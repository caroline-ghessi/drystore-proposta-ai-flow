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
    const { message, tipo = 'consulta' } = await req.json();
    
    if (!grokApiKey && !openAIApiKey) {
      throw new Error('Nenhuma API key de IA configurada (Grok ou OpenAI)');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar dados contextuais do sistema
    const [propostas, vendedores] = await Promise.all([
      supabase.from('propostas').select(`
        *, vendedores(nome, email)
      `).order('created_at', { ascending: false }).limit(50),
      supabase.from('vendedores').select('*')
    ]);

    // Calcular métricas em tempo real para contexto
    const agora = new Date();
    const mesAtual = agora.getMonth() + 1;
    const anoAtual = agora.getFullYear();
    const diaAtual = agora.getDate();
    const diasNoMes = new Date(anoAtual, mesAtual, 0).getDate();
    const diasRestantes = diasNoMes - diaAtual;

    const propostasData = propostas.data || [];
    const vendedoresData = vendedores.data || [];

    // Propostas do mês atual
    const propostasDoMes = propostasData.filter(p => {
      const data = new Date(p.created_at);
      return data.getMonth() + 1 === mesAtual && data.getFullYear() === anoAtual;
    });

    // Propostas abertas (pipeline)
    const propostasAbertas = propostasData.filter(p => 
      ['enviada', 'visualizada'].includes(p.status)
    ).sort((a, b) => (b.valor_total || 0) - (a.valor_total || 0));

    const metricas = {
      faturamentoDoMes: propostasDoMes.reduce((sum, p) => sum + (p.valor_total || 0), 0),
      propostasDoMes: propostasDoMes.length,
      propostasAbertas: propostasAbertas.length,
      valorPipeline: propostasAbertas.reduce((sum, p) => sum + (p.valor_total || 0), 0),
      taxaConversaoMes: propostasDoMes.length > 0 ? 
        (propostasDoMes.filter(p => p.status === 'aceita').length / propostasDoMes.length * 100) : 0,
      diasRestantes,
      maioresOportunidades: propostasAbertas.slice(0, 5).map(p => ({
        cliente: p.cliente_nome,
        valor: p.valor_total,
        tipo: p.tipo_proposta,
        diasEmAberto: Math.floor((Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24)),
        vendedor: p.vendedores?.nome || 'Não atribuído'
      })),
      vendedoresPerformance: vendedoresData.map(v => {
        const propostas = propostasDoMes.filter(p => p.vendedor_id === v.id);
        return {
          nome: v.nome,
          propostas: propostas.length,
          valor: propostas.reduce((sum, p) => sum + (p.valor_total || 0), 0),
          aceitas: propostas.filter(p => p.status === 'aceita').length
        };
      }).filter(v => v.propostas > 0).sort((a, b) => b.valor - a.valor)
    };

    // Sistema de prompts otimizado para Grok AI
    const basePrompt = `CONTEXTO ATUAL DO NEGÓCIO - DryStore:
- Faturamento do mês: R$ ${metricas.faturamentoDoMes.toLocaleString('pt-BR')}
- Propostas criadas este mês: ${metricas.propostasDoMes}
- Pipeline atual: ${metricas.propostasAbertas} propostas abertas no valor de R$ ${metricas.valorPipeline.toLocaleString('pt-BR')}
- Taxa de conversão do mês: ${metricas.taxaConversaoMes.toFixed(1)}%
- Dias restantes no mês: ${metricas.diasRestantes}

MAIORES OPORTUNIDADES EM ABERTO:
${metricas.maioresOportunidades.map((op, i) => 
  `${i+1}. ${op.cliente} - R$ ${op.valor?.toLocaleString('pt-BR')} - ${op.tipo} (${op.diasEmAberto} dias) - Vendedor: ${op.vendedor}`
).join('\n')}

PERFORMANCE DA EQUIPE ESTE MÊS:
${metricas.vendedoresPerformance.map((v, i) => 
  `${i+1}. ${v.nome}: ${v.propostas} propostas, R$ ${v.valor.toLocaleString('pt-BR')}, ${v.aceitas} vendas`
).join('\n')}`;

    // Prompts específicos para cada IA
    let systemPrompt, model, apiUrl, authHeader, requestBody;

    if (grokApiKey) {
      // Configuração para Grok AI (X.ai)
      systemPrompt = `Você é o consultor comercial estratégico da DryStore. Analise dados, identifique oportunidades e dê recomendações práticas.

${basePrompt}

Seja direto, use números concretos e foque em ações que geram resultados. Priorize as maiores oportunidades.`;
      
      model = 'grok-beta';
      apiUrl = 'https://api.x.ai/v1/chat/completions';
      authHeader = `Bearer ${grokApiKey}`;
      
      if (tipo === 'analise_automatica') {
        systemPrompt += `\n\nFaça uma análise automática e dê 3 recomendações estratégicas prioritárias.`;
      }
      
      requestBody = JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });
    } else {
      // Fallback para OpenAI
      systemPrompt = `Você é o assistente de vendas da DryStore, especialista em análise de dados comerciais e estratégias de vendas.

${basePrompt}

SUAS ESPECIALIDADES:
1. Análise de métricas e identificação de oportunidades
2. Estratégias para acelerar fechamento de vendas
3. Priorização de esforços baseada em dados
4. Sugestões para melhoria de conversão
5. Análise de pipeline e previsões
6. Coaching para vendedores
7. Identificação de gargalos no processo

Seja direto, prático e focado em resultados. Use dados reais para embasar suas recomendações.`;
      
      model = 'gpt-4o';
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      authHeader = `Bearer ${openAIApiKey}`;
      
      if (tipo === 'analise_automatica') {
        systemPrompt += `\n\nFaça uma análise automática da situação atual e forneça 3 recomendações estratégicas prioritárias.`;
      }
      
      requestBody = JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro na API OpenAI');
    }

    const resposta = data.choices[0].message.content;

    // Log da interação
    await supabase.from('notificacoes').insert({
      tipo: 'contato',
      mensagem: `IA Consultada: ${message.substring(0, 100)}...`,
      dados_extras: { resposta: resposta.substring(0, 200), metricas }
    });

    return new Response(JSON.stringify({ 
      resposta,
      metricas,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no chatbot de vendas:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      resposta: "Desculpe, houve um erro ao processar sua solicitação. Verifique se todas as configurações estão corretas."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});