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

interface ProcessarDivisoriasRequest {
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
    const { arquivo_url, cliente_nome, cliente_email, modo_debug = false }: ProcessarDivisoriasRequest = await req.json();
    
    console.log('=== PROCESSAMENTO DIVISÓRIAS ===');
    console.log('Parâmetros:', { arquivo_url, cliente_nome, modo_debug });

    // Processar documento para extrair dados específicos de divisórias
    const dadosExtraidos = await processarDocumentoDivisorias(arquivo_url, modo_debug);
    
    // Calcular especificações técnicas
    const especificacoesTecnicas = calcularEspecificacoesDivisorias(dadosExtraidos);
    
    // Selecionar produtos adequados
    const produtosSelecionados = await selecionarProdutosDivisorias(especificacoesTecnicas);
    
    // Calcular orçamento final
    const orcamento = calcularOrcamentoDivisorias(especificacoesTecnicas, produtosSelecionados);

    const resultado = {
      dados_extraidos: dadosExtraidos,
      especificacoes_tecnicas: especificacoesTecnicas,
      produtos_selecionados: produtosSelecionados,
      orcamento: orcamento,
      valor_total: orcamento.valor_total,
      status: 'processado',
      timestamp: new Date().toISOString()
    };

    console.log('Processamento divisórias concluído:', resultado);

    return new Response(JSON.stringify(resultado), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no processamento divisórias:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro no processamento de divisórias',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function processarDocumentoDivisorias(arquivoUrl: string, modoDebug: boolean) {
  const difyApiKey = Deno.env.get('DIFY_API_KEY');
  
  if (!difyApiKey) {
    console.warn('DIFY_API_KEY não configurado, usando dados simulados');
    return simularDadosDivisorias();
  }

  try {
    const fileId = await uploadFileToDify(arquivoUrl, difyApiKey);
    const extractedData = await processarComDifyDivisorias(fileId, difyApiKey);
    return extractedData;
  } catch (error) {
    console.error('Erro no processamento Dify para divisórias:', error);
    if (modoDebug) {
      throw error;
    }
    return simularDadosDivisorias();
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
  
  formData.append('file', new File([fileBlob], `divisorias.${fileExtension}`, { type: mimeType }));
  formData.append('user', 'drystore-divisorias');

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

async function processarComDifyDivisorias(fileId: string, apiKey: string) {
  const prompt = `
EXTRAIA OS DADOS DESTA ESPECIFICAÇÃO DE DIVISÓRIAS E RETORNE EM JSON:

Analise o documento e extraia:
{
  "area_total_m2": número da área total das divisórias,
  "altura_divisorias_m": altura das divisórias em metros,
  "tipo_ambiente": "escritório/comercial/industrial/residencial",
  "isolamento_acustico": "baixo/médio/alto",
  "resistencia_fogo": true/false,
  "acabamento_desejado": "standard/premium/executivo",
  "cor_especificada": "cor desejada",
  "necessita_porta": true/false,
  "quantidade_portas": número de portas necessárias,
  "tipo_vidro": "comum/temperado/laminado/acústico",
  "observacoes_especiais": "requisitos específicos"
}

IMPORTANTE: Retorne APENAS o JSON válido.`;

  const requestBody = {
    query: prompt,
    response_mode: "blocking",
    user: "drystore-divisorias",
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
  
  return simularDadosDivisorias();
}

function simularDadosDivisorias() {
  return {
    area_total_m2: 45,
    altura_divisorias_m: 2.8,
    tipo_ambiente: "escritório",
    isolamento_acustico: "médio",
    resistencia_fogo: true,
    acabamento_desejado: "premium",
    cor_especificada: "branco",
    necessita_porta: true,
    quantidade_portas: 2,
    tipo_vidro: "temperado",
    observacoes_especiais: "Divisórias modulares para flexibilidade"
  };
}

function calcularEspecificacoesDivisorias(dados: any) {
  const area = dados.area_total_m2 || 45;
  const altura = dados.altura_divisorias_m || 2.8;
  
  // Calcular metros lineares de divisórias
  const metrosLineares = Math.ceil(area / altura);
  
  // Calcular quantidade de perfis
  const perfilVertical = metrosLineares * 2; // 2 perfis por metro linear
  const perfilHorizontal = metrosLineares * 3; // 3 perfis horizontais por metro linear
  
  // Calcular área de vidros/painéis
  const areaVidros = area * 0.7; // 70% da área é vidro
  const areaPaineis = area * 0.3; // 30% da área são painéis
  
  return {
    metros_lineares: metrosLineares,
    altura_divisorias: altura,
    area_total: area,
    quantidade_perfil_vertical: perfilVertical,
    quantidade_perfil_horizontal: perfilHorizontal,
    area_vidros_m2: areaVidros,
    area_paineis_m2: areaPaineis,
    quantidade_portas: dados.quantidade_portas || 0,
    tipo_ambiente: dados.tipo_ambiente,
    nivel_isolamento: dados.isolamento_acustico,
    acabamento: dados.acabamento_desejado,
    cor: dados.cor_especificada
  };
}

async function selecionarProdutosDivisorias(specs: any) {
  // Buscar produtos de divisórias no banco
  const { data: perfis } = await supabase
    .from('produtos')
    .select('*')
    .eq('categoria', 'perfis-divisorias')
    .eq('ativo', true);

  const { data: vidros } = await supabase
    .from('produtos')
    .select('*')
    .eq('categoria', 'vidros-divisorias')
    .eq('ativo', true);

  const { data: paineis } = await supabase
    .from('produtos')
    .select('*')
    .eq('categoria', 'paineis-divisorias')
    .eq('ativo', true);

  const { data: portas } = await supabase
    .from('produtos')
    .select('*')
    .eq('categoria', 'portas-divisorias')
    .eq('ativo', true);

  // Selecionar produtos baseados nas especificações
  const perfilSelecionado = perfis?.find(p => 
    p.nome.toLowerCase().includes(specs.acabamento) || 
    p.nome.toLowerCase().includes('standard')
  ) || perfis?.[0];

  const vidroSelecionado = vidros?.find(v => 
    specs.nivel_isolamento === 'alto' ? 
      v.nome.toLowerCase().includes('acústico') : 
      v.nome.toLowerCase().includes('temperado')
  ) || vidros?.[0];

  return {
    perfil_vertical: perfilSelecionado,
    perfil_horizontal: perfilSelecionado,
    vidro: vidroSelecionado,
    painel: paineis?.[0],
    porta: specs.quantidade_portas > 0 ? portas?.[0] : null
  };
}

function calcularOrcamentoDivisorias(specs: any, produtos: any) {
  const valorPerfisVerticais = (produtos.perfil_vertical?.preco_unitario || 85) * specs.quantidade_perfil_vertical;
  const valorPerfisHorizontais = (produtos.perfil_horizontal?.preco_unitario || 85) * specs.quantidade_perfil_horizontal;
  const valorVidros = (produtos.vidro?.preco_unitario || 120) * specs.area_vidros_m2;
  const valorPaineis = (produtos.painel?.preco_unitario || 95) * specs.area_paineis_m2;
  const valorPortas = specs.quantidade_portas > 0 ? 
    (produtos.porta?.preco_unitario || 850) * specs.quantidade_portas : 0;
  
  const subtotalMateriais = valorPerfisVerticais + valorPerfisHorizontais + valorVidros + valorPaineis + valorPortas;
  const custoInstalacao = subtotalMateriais * 0.35; // 35% do valor dos materiais
  const margem = 0.28; // 28%
  
  const subtotal = subtotalMateriais + custoInstalacao;
  const valorTotal = subtotal * (1 + margem);

  return {
    materiais: {
      perfis_verticais: valorPerfisVerticais,
      perfis_horizontais: valorPerfisHorizontais,
      vidros: valorVidros,
      paineis: valorPaineis,
      portas: valorPortas,
      subtotal: subtotalMateriais
    },
    instalacao: custoInstalacao,
    subtotal_geral: subtotal,
    margem_percentual: margem * 100,
    valor_margem: subtotal * margem,
    valor_total: Math.round(valorTotal),
    valor_m2: Math.round(valorTotal / specs.area_total)
  };
}