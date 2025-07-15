import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const grokApiKey = Deno.env.get('GROK_API_KEY');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { propostaId, promptMelhoria, tipoFollowup } = await req.json();

    console.log('Gerando follow-up para proposta:', propostaId);

    if (!grokApiKey && !openAIApiKey) {
      throw new Error('Nenhuma API key de IA configurada (Grok ou OpenAI)');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar dados da proposta e cliente
    const { data: proposta, error: propostaError } = await supabase
      .from('propostas')
      .select(`
        *,
        vendedores!propostas_vendedor_id_fkey(nome, email)
      `)
      .eq('id', propostaId)
      .single();

    if (propostaError || !proposta) {
      throw new Error('Proposta não encontrada');
    }

    // Buscar dados técnicos específicos por tipo de proposta
    let dadosTecnicos = null;
    
    console.log(`Buscando dados técnicos para proposta ${proposta.tipo_proposta}`);
    
    if (proposta.tipo_proposta === 'energia-solar') {
      const { data: calculoSolar } = await supabase
        .from('energia_solar_calculos')
        .select(`
          potencia_sistema_kwp,
          quantidade_paineis,
          economia_mensal_estimada,
          economia_anual_estimada,
          payback_simples_anos,
          geracao_estimada_mensal_kwh,
          valor_total
        `)
        .eq('proposta_id', propostaId)
        .single();
      
      dadosTecnicos = calculoSolar;
      console.log('Dados técnicos energia solar:', calculoSolar);
    } 
    else if (proposta.tipo_proposta === 'telhas') {
      const { data: calculoTelhas } = await supabase
        .from('orcamentos_telhado_shingle')
        .select(`
          area_telhado,
          valor_total,
          valor_por_m2,
          telha_codigo,
          comprimento_cumeeira,
          perimetro_telhado
        `)
        .eq('proposta_id', propostaId)
        .single();
      
      dadosTecnicos = calculoTelhas;
      console.log('Dados técnicos telhas:', calculoTelhas);
    }
    else if (proposta.tipo_proposta === 'divisorias') {
      const { data: calculoDrywall } = await supabase
        .from('orcamentos_drywall')
        .select(`
          area_parede,
          valor_total,
          valor_por_m2,
          tipo_parede,
          composicao_nome
        `)
        .eq('proposta_id', propostaId)
        .single();
      
      dadosTecnicos = calculoDrywall;
      console.log('Dados técnicos drywall:', calculoDrywall);
    }
    else if (proposta.tipo_proposta === 'impermeabilizacao') {
      const { data: calculoImpermeabilizacao } = await supabase
        .from('calculos_impermeabilizacao')
        .select(`
          area_aplicacao,
          valor_total,
          valor_por_m2,
          sistema_impermeabilizacao,
          tipo_superficie
        `)
        .eq('proposta_id', propostaId)
        .single();
      
      dadosTecnicos = calculoImpermeabilizacao;
      console.log('Dados técnicos impermeabilização:', calculoImpermeabilizacao);
    }

    // Calcular dias desde criação
    const diasAbertas = Math.floor((new Date().getTime() - new Date(proposta.created_at).getTime()) / (1000 * 60 * 60 * 24));
    
    // Determinar tipo de follow-up baseado no tempo se não especificado
    let categoria = tipoFollowup;
    if (!categoria) {
      if (diasAbertas <= 1) categoria = 'primeiro-contato';
      else if (diasAbertas <= 3) categoria = 'segundo-followup';
      else categoria = 'terceiro-followup';
    }

    // Buscar conhecimento relevante com busca hierárquica
    console.log(`Buscando conhecimento para categoria: ${categoria}, proposta: ${proposta.tipo_proposta}`);
    
    let conhecimento = [];
    
    // 1º: Buscar por tag específica (primeiro-contato, segundo-followup, etc.)
    const { data: conhecimentoEspecifico } = await supabase
      .from('conhecimento_vendas')
      .select('*')
      .eq('ativo', true)
      .contains('tags', [categoria])
      .order('prioridade', { ascending: false })
      .limit(3);
    
    console.log(`Conhecimento específico encontrado: ${conhecimentoEspecifico?.length || 0} itens`);
    
    if (conhecimentoEspecifico && conhecimentoEspecifico.length > 0) {
      conhecimento = conhecimentoEspecifico;
    } else {
      // 2º: Buscar por tags genéricas (followup, venda, objeções)
      const { data: conhecimentoGenerico } = await supabase
        .from('conhecimento_vendas')
        .select('*')
        .eq('ativo', true)
        .or(`tags.cs.{followup},tags.cs.{venda},tags.cs.{objecoes},tags.cs.{persuasao}`)
        .order('prioridade', { ascending: false })
        .limit(3);
      
      console.log(`Conhecimento genérico encontrado: ${conhecimentoGenerico?.length || 0} itens`);
      
      if (conhecimentoGenerico && conhecimentoGenerico.length > 0) {
        conhecimento = conhecimentoGenerico;
      } else {
        // 3º: Buscar por categoria
        const { data: conhecimentoCategoria } = await supabase
          .from('conhecimento_vendas')
          .select('*')
          .eq('ativo', true)
          .in('categoria', ['followup', 'objecoes', 'tecnicas-vendas'])
          .order('prioridade', { ascending: false })
          .limit(3);
        
        console.log(`Conhecimento por categoria encontrado: ${conhecimentoCategoria?.length || 0} itens`);
        
        if (conhecimentoCategoria && conhecimentoCategoria.length > 0) {
          conhecimento = conhecimentoCategoria;
        } else {
          // 4º: Buscar por tipo de proposta
          const { data: conhecimentoProposta } = await supabase
            .from('conhecimento_vendas')
            .select('*')
            .eq('ativo', true)
            .contains('tags', [proposta.tipo_proposta])
            .order('prioridade', { ascending: false })
            .limit(2);
          
          console.log(`Conhecimento por tipo de proposta encontrado: ${conhecimentoProposta?.length || 0} itens`);
          conhecimento = conhecimentoProposta || [];
        }
      }
    }

    // Criar contexto enriquecido com dados técnicos
    const contexto = {
      clienteNome: proposta.cliente_nome,
      valorTotal: proposta.valor_total,
      tipoProposta: proposta.tipo_proposta,
      status: proposta.status,
      diasAbertas,
      vendedorNome: proposta.vendedores?.nome,
      dataVisualizacao: proposta.data_visualizacao,
      dataVencimento: proposta.data_vencimento,
      dadosTecnicos: dadosTecnicos,
      dadosExtraidos: proposta.dados_extraidos
    };

    // Criar contexto específico baseado no tipo de proposta
    let contextoEspecifico = "";
    
    if (proposta.tipo_proposta === 'energia-solar' && dadosTecnicos) {
      const economiaAnual = dadosTecnicos.economia_anual_estimada;
      const economiaMensal = dadosTecnicos.economia_mensal_estimada;
      const payback = dadosTecnicos.payback_simples_anos;
      const paineis = dadosTecnicos.quantidade_paineis;
      const potencia = dadosTecnicos.potencia_sistema_kwp;
      
      contextoEspecifico = `
DADOS TÉCNICOS ENERGIA SOLAR:
- Sistema: ${paineis} painéis de ${potencia}kWp
- Economia mensal: R$ ${economiaMensal?.toLocaleString('pt-BR') || 'N/A'}
- Economia anual: R$ ${economiaAnual?.toLocaleString('pt-BR') || 'N/A'}
- Payback: ${payback ? `${payback} anos` : 'N/A'}
- Valor investimento: R$ ${contexto.valorTotal?.toLocaleString('pt-BR') || 'N/A'}`;
    }
    else if (proposta.tipo_proposta === 'telhas' && dadosTecnicos) {
      const area = dadosTecnicos.area_telhado;
      const valorM2 = dadosTecnicos.valor_por_m2;
      
      contextoEspecifico = `
DADOS TÉCNICOS TELHAS:
- Área do telhado: ${area}m²
- Valor por m²: R$ ${valorM2?.toLocaleString('pt-BR') || 'N/A'}
- Garantia: 25 anos
- Resistência: 200+ km/h vento`;
    }
    else if (proposta.tipo_proposta === 'divisorias' && dadosTecnicos) {
      const area = dadosTecnicos.area_parede;
      const valorM2 = dadosTecnicos.valor_por_m2;
      const tipo = dadosTecnicos.tipo_parede;
      
      contextoEspecifico = `
DADOS TÉCNICOS DIVISÓRIAS:
- Área das paredes: ${area}m²
- Tipo: ${tipo}
- Valor por m²: R$ ${valorM2?.toLocaleString('pt-BR') || 'N/A'}
- Instalação rápida: 3-5 dias`;
    }
    else if (proposta.tipo_proposta === 'impermeabilizacao' && dadosTecnicos) {
      const area = dadosTecnicos.area_aplicacao;
      const sistema = dadosTecnicos.sistema_impermeabilizacao;
      const valorM2 = dadosTecnicos.valor_por_m2;
      
      contextoEspecifico = `
DADOS TÉCNICOS IMPERMEABILIZAÇÃO:
- Área: ${area}m²
- Sistema: ${sistema || 'N/A'}
- Valor por m²: R$ ${valorM2?.toLocaleString('pt-BR') || 'N/A'}
- Vida útil: 10+ anos`;
    }

    // Preparar prompt para Grok
    const sistemaPrompt = `Você é um especialista em vendas consultivas que gera mensagens de follow-up personalizadas para WhatsApp.

TÉCNICAS DE VENDAS A APLICAR:
- Use linguagem natural e conversacional
- Crie senso de urgência sem pressionar
- Aplique gatilhos psicológicos sutis (escassez, prova social)
- Seja consultivo, não vendedor
- Personalise com base no contexto do cliente

CONHECIMENTO BASE:
${conhecimento?.map(k => `${k.titulo}: ${k.conteudo}`).join('\n\n')}

CONTEXTO DA PROPOSTA:
- Cliente: ${contexto.clienteNome}
- Tipo: ${contexto.tipoProposta}
- Valor: R$ ${contexto.valorTotal?.toLocaleString('pt-BR') || 'N/A'}
- Status: ${contexto.status}
- Dias em aberto: ${contexto.diasAbertas}
- Visualizada: ${contexto.dataVisualizacao ? 'Sim' : 'Não'}
- Vence em: ${contexto.dataVencimento || 'Não definido'}

${contextoEspecifico}

INSTRUÇÕES:
1. Gere uma mensagem de follow-up personalizada de até 200 caracteres
2. Use o nome do cliente
3. Seja específico sobre a proposta, use os dados técnicos quando disponíveis
4. Inclua números específicos (economia, área, benefícios quantificados)
5. Inclua call-to-action claro e urgente
6. Use emojis apropriadamente (máximo 2)
7. Mantenha tom profissional mas amigável
8. Para energia solar: mencione economia mensal/payback
9. Para telhas: mencione área e durabilidade
10. Para divisórias: mencione rapidez da instalação
11. Para impermeabilização: mencione vida útil`;

    const userPrompt = promptMelhoria 
      ? `Melhore a mensagem seguindo esta orientação: ${promptMelhoria}`
      : `Gere uma mensagem de follow-up para ${categoria}`;

    console.log('Chamando IA para geração de follow-up...');

    let response, data;
    
    if (grokApiKey) {
      // Usar Grok AI (modelo correto 2025)
      console.log('Usando Grok AI...');
      console.log('API Key presente:', !!grokApiKey);
      
      try {
        response = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${grokApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'grok-3',
            messages: [
              { role: 'system', content: sistemaPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
            max_tokens: 200,
          }),
        });
        
        console.log('Resposta Grok status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Grok API Error:', response.status, errorText);
          throw new Error(`Grok API falhou: ${response.status} - ${errorText}`);
        }
        
      } catch (grokError) {
        console.error('Erro ao usar Grok, tentando OpenAI como fallback:', grokError);
        
        if (!openAIApiKey) {
          throw new Error('Grok falhou e OpenAI não está configurado: ' + grokError.message);
        }
        
        // Fallback para OpenAI se Grok falhar
        console.log('Usando OpenAI como fallback...');
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: sistemaPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 200,
          }),
        });
      }
    } else {
      // Usar OpenAI se Grok não estiver configurado
      console.log('Usando OpenAI (Grok não configurado)...');
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: sistemaPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 200,
        }),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`IA API error: ${response.status} - ${response.statusText} - ${errorText}`);
    }

    data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Resposta inválida da API:', data);
      throw new Error('Resposta inválida da API de IA');
    }
    
    const mensagemGerada = data.choices[0].message.content?.trim();

    if (!mensagemGerada) {
      throw new Error('Não foi possível gerar a mensagem');
    }

    // Salvar no histórico
    const { data: followupSalvo } = await supabase
      .from('followups_ia')
      .insert({
        proposta_id: propostaId,
        vendedor_id: proposta.vendedor_id,
        mensagem_gerada: mensagemGerada,
        prompt_melhoria: promptMelhoria
      })
      .select()
      .single();

    console.log('Follow-up gerado com sucesso');

    return new Response(
      JSON.stringify({
        mensagem: mensagemGerada,
        contexto,
        followupId: followupSalvo?.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erro ao gerar follow-up:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        details: error.stack 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});