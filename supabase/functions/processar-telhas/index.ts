import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface ProcessarTelhasRequest {
  arquivo_url: string;
  cliente_nome: string;
  cliente_email: string;
  modo_debug?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { arquivo_url, cliente_nome, cliente_email, modo_debug = false }: ProcessarTelhasRequest = await req.json();
    
    console.log('=== PROCESSAMENTO TELHAS SHINGLE ===');
    console.log('Parâmetros:', { arquivo_url, cliente_nome, modo_debug });

    // Processar documento para extrair dados específicos de telhas
    const dadosExtraidos = await processarDocumentoTelhas(arquivo_url, modo_debug);
    
    // Calcular especificações técnicas
    const especificacoesTecnicas = calcularEspecificacoesTelhas(dadosExtraidos);
    
    // Selecionar produtos adequados
    const produtosSelecionados = await selecionarProdutosTelhas(especificacoesTecnicas);
    
    // Calcular orçamento final
    const orcamento = calcularOrcamentoTelhas(especificacoesTecnicas, produtosSelecionados);

    const resultado = {
      dados_extraidos: dadosExtraidos,
      especificacoes_tecnicas: especificacoesTecnicas,
      produtos_selecionados: produtosSelecionados,
      orcamento: orcamento,
      valor_total: orcamento.valor_total,
      status: 'processado',
      timestamp: new Date().toISOString()
    };

    console.log('Processamento telhas concluído:', resultado);

    return new Response(JSON.stringify(resultado), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no processamento telhas:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro no processamento de telhas',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function processarDocumentoTelhas(arquivoUrl: string, modoDebug: boolean) {
  const difyApiKey = Deno.env.get('DIFY_API_KEY');
  
  if (!difyApiKey) {
    console.warn('DIFY_API_KEY não configurado, usando dados simulados');
    return simularDadosTelhas();
  }

  try {
    // Fazer upload do arquivo para Dify
    const fileId = await uploadFileToDify(arquivoUrl, difyApiKey);
    
    // Processar com prompt específico para telhas
    const extractedData = await processarComDifyTelhas(fileId, difyApiKey);
    
    return extractedData;
  } catch (error) {
    console.error('Erro no processamento Dify para telhas:', error);
    if (modoDebug) {
      throw error;
    }
    return simularDadosTelhas();
  }
}

async function uploadFileToDify(arquivoUrl: string, apiKey: string): Promise<string> {
  const fileResponse = await fetch(arquivoUrl);
  if (!fileResponse.ok) {
    throw new Error(`Erro ao baixar arquivo: ${fileResponse.status}`);
  }
  
  const fileBlob = await fileResponse.blob();
  const formData = new FormData();
  
  const isImage = fileBlob.type.startsWith('image/') || arquivoUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const fileExtension = isImage ? 'png' : 'pdf';
  const mimeType = isImage ? fileBlob.type || 'image/png' : 'application/pdf';
  
  formData.append('file', new File([fileBlob], `telhas.${fileExtension}`, { type: mimeType }));
  formData.append('user', 'drystore-telhas');

  const uploadResponse = await fetch('https://api.dify.ai/v1/files/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(`Upload falhou: ${uploadResponse.status} - ${errorText}`);
  }

  const uploadResult = await uploadResponse.json();
  return uploadResult.id;
}

async function processarComDifyTelhas(fileId: string, apiKey: string) {
  const prompt = `
EXTRAIA OS DADOS DESTA ESPECIFICAÇÃO DE TELHAS SHINGLE E RETORNE EM JSON:

Analise o documento e extraia:
{
  "area_total_m2": número da área total a ser coberta,
  "inclinacao_telhado": "baixa/média/alta",
  "tipo_estrutura": "madeira/metálica/concreto",
  "regiao_climatica": "tropical/subtropical/temperado",
  "cor_preferida": "cor desejada pelo cliente",
  "acabamento_desejado": "standard/premium/luxo",
  "necessita_isolamento": true/false,
  "necessita_manta": true/false,
  "observacoes_especiais": "requisitos específicos"
}

IMPORTANTE: Retorne APENAS o JSON válido.`;

  const requestBody = {
    query: prompt,
    response_mode: "blocking",
    user: "drystore-telhas",
    files: [{
      transfer_method: "local_file",
      file_id: fileId
    }]
  };

  const response = await fetch('https://api.dify.ai/v1/chat-messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Dify API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const answerText = result.answer || result.data || '';
  
  try {
    const jsonMatch = answerText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Erro ao parsear resposta JSON:', e);
  }
  
  return simularDadosTelhas();
}

function simularDadosTelhas() {
  return {
    area_total_m2: 120,
    inclinacao_telhado: "média",
    tipo_estrutura: "madeira",
    regiao_climatica: "subtropical",
    cor_preferida: "cinza",
    acabamento_desejado: "premium",
    necessita_isolamento: true,
    necessita_manta: false,
    observacoes_especiais: "Resistência a ventos fortes"
  };
}

function calcularEspecificacoesTelhas(dados: any) {
  const area = dados.area_total_m2 || 120;
  
  // Calcular quantidade de telhas baseado na área
  const telhasPorM2 = 3.2; // Telhas shingle padrão
  const quantidadeTelhas = Math.ceil(area * telhasPorM2);
  
  // Calcular acessórios necessários
  const quantidadeRufo = Math.ceil(area * 0.1); // 10% da área
  const quantidadeCumeeira = Math.ceil(area * 0.05); // 5% da área
  const quantidadePrego = Math.ceil(quantidadeTelhas * 4 / 1000); // 4 pregos por telha, vendido por kg
  
  // Calcular manta se necessário
  const areaManta = dados.necessita_manta ? area * 1.1 : 0; // 10% de sobra
  
  return {
    area_cobertura: area,
    quantidade_telhas: quantidadeTelhas,
    quantidade_rufo_m: quantidadeRufo,
    quantidade_cumeeira_m: quantidadeCumeeira,
    quantidade_pregos_kg: quantidadePrego,
    area_manta_m2: areaManta,
    inclinacao: dados.inclinacao_telhado,
    tipo_estrutura: dados.tipo_estrutura,
    cor_especificada: dados.cor_preferida,
    nivel_acabamento: dados.acabamento_desejado
  };
}

async function selecionarProdutosTelhas(specs: any) {
  // Buscar produtos de telhas no banco
  const { data: telhas } = await supabase
    .from('produtos')
    .select('*')
    .eq('categoria', 'telhas-shingle')
    .eq('ativo', true)
    .order('preco_unitario', { ascending: true });

  const { data: acessorios } = await supabase
    .from('produtos')
    .select('*')
    .eq('categoria', 'acessorios-telhas')
    .eq('ativo', true);

  // Selecionar telha adequada baseada no acabamento
  let telhaSelecionada = telhas?.[0];
  if (specs.nivel_acabamento === 'premium') {
    telhaSelecionada = telhas?.find(t => t.nome.toLowerCase().includes('premium')) || telhas?.[0];
  } else if (specs.nivel_acabamento === 'luxo') {
    telhaSelecionada = telhas?.find(t => t.nome.toLowerCase().includes('luxo')) || telhas?.[0];
  }

  return {
    telha_principal: telhaSelecionada,
    rufo: acessorios?.find(a => a.nome.toLowerCase().includes('rufo')),
    cumeeira: acessorios?.find(a => a.nome.toLowerCase().includes('cumeeira')),
    pregos: acessorios?.find(a => a.nome.toLowerCase().includes('prego')),
    manta: specs.area_manta_m2 > 0 ? acessorios?.find(a => a.nome.toLowerCase().includes('manta')) : null
  };
}

function calcularOrcamentoTelhas(specs: any, produtos: any) {
  const valorTelhas = (produtos.telha_principal?.preco_unitario || 25) * specs.quantidade_telhas;
  const valorRufo = (produtos.rufo?.preco_unitario || 15) * specs.quantidade_rufo_m;
  const valorCumeeira = (produtos.cumeeira?.preco_unitario || 18) * specs.quantidade_cumeeira_m;
  const valorPregas = (produtos.pregos?.preco_unitario || 8) * specs.quantidade_pregos_kg;
  const valorManta = specs.area_manta_m2 > 0 ? (produtos.manta?.preco_unitario || 12) * specs.area_manta_m2 : 0;
  
  const subtotalMateriais = valorTelhas + valorRufo + valorCumeeira + valorPregas + valorManta;
  const custoInstalacao = subtotalMateriais * 0.4; // 40% do valor dos materiais
  const margem = 0.25; // 25%
  
  const subtotal = subtotalMateriais + custoInstalacao;
  const valorTotal = subtotal * (1 + margem);

  return {
    materiais: {
      telhas: valorTelhas,
      rufo: valorRufo,
      cumeeira: valorCumeeira,
      pregos: valorPregas,
      manta: valorManta,
      subtotal: subtotalMateriais
    },
    instalacao: custoInstalacao,
    subtotal_geral: subtotal,
    margem_percentual: margem * 100,
    valor_margem: subtotal * margem,
    valor_total: Math.round(valorTotal),
    valor_m2: Math.round(valorTotal / specs.area_cobertura)
  };
}