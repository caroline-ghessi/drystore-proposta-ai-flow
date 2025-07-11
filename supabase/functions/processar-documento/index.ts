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

interface ProcessarDocumentoRequest {
  arquivo_url: string;
  tipo_proposta: string;
  cliente_nome: string;
  cliente_email: string;
  modo_debug?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { arquivo_url, tipo_proposta, cliente_nome, cliente_email, modo_debug = false }: ProcessarDocumentoRequest = await req.json();
    
    console.log('=== INICIANDO PROCESSAMENTO DOCUMENTO ===');
    console.log('Parâmetros:', { arquivo_url, tipo_proposta, cliente_nome, modo_debug });

    // Processar com Dify API ou simulação
    const dadosExtraidos = await processarComDify(arquivo_url, tipo_proposta, modo_debug);
    
    // Calcular valores baseado nos dados extraídos
    const valorTotal = calcularValorTotal(dadosExtraidos, tipo_proposta);

    const resultado = {
      dados_extraidos: dadosExtraidos,
      valor_total: valorTotal,
      status: 'processado',
      timestamp: new Date().toISOString()
    };

    console.log('Processamento concluído:', resultado);

    return new Response(JSON.stringify(resultado), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no processamento:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro no processamento do documento',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function processarComDify(arquivoUrl: string, tipoProposta: string, modoDebug: boolean = false) {
  const difyApiKey = Deno.env.get('DIFY_API_KEY');
  const difyAppId = Deno.env.get('DIFY_APP_ID');
  
  console.log('=== INICIANDO PROCESSAMENTO DIFY ===');
  console.log('Configuração:', { 
    temApiKey: !!difyApiKey, 
    temAppId: !!difyAppId, 
    modoDebug,
    tipoProposta 
  });
  
  if (!difyApiKey || !difyAppId) {
    const erro = 'DIFY_API_KEY ou DIFY_APP_ID não configurados';
    console.error('=== ERRO DE CONFIGURAÇÃO ===', erro);
    
    if (modoDebug) {
      throw new Error(erro);
    }
    
    console.warn('Usando dados simulados (credenciais ausentes)');
    return simularProcessamentoDify(arquivoUrl, tipoProposta);
  }

  try {
    // Step 1: Testar conectividade
    console.log('=== TESTANDO CONECTIVIDADE DIFY ===');
    await testarConectividadeDify(difyApiKey);
    console.log('✓ Conectividade Dify OK');
    
    // Step 2: Upload file to Dify
    console.log('=== FAZENDO UPLOAD PARA DIFY ===');
    const fileId = await uploadFileToDify(arquivoUrl, difyApiKey);
    console.log('✓ Upload concluído. File ID:', fileId);

    // Step 3: Process with chat messages API
    console.log('=== PROCESSANDO COM DIFY CHAT ===');
    const extractedData = await processWithDifyChat(fileId, tipoProposta, difyApiKey, difyAppId, modoDebug);
    console.log('✓ Processamento Dify concluído');
    console.log('=== DADOS EXTRAÍDOS PELO DIFY ===', JSON.stringify(extractedData, null, 2));

    return extractedData;
    
  } catch (error) {
    console.error('=== ERRO NO PROCESSAMENTO DIFY ===');
    console.error('Erro detalhado:', error);
    console.error('Stack trace:', error.stack);
    
    if (modoDebug) {
      throw error; // No modo debug, não usar fallback
    }
    
    console.log('=== USANDO FALLBACK (DADOS SIMULADOS) ===');
    return simularProcessamentoDify(arquivoUrl, tipoProposta);
  }
}

// Testar conectividade Dify
async function testarConectividadeDify(apiKey: string): Promise<void> {
  try {
    const testResponse = await fetch('https://api.dify.ai/v1/info', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!testResponse.ok) {
      throw new Error(`Teste de conectividade falhou: ${testResponse.statusText}`);
    }
    
    console.log('✓ Conectividade Dify confirmada');
  } catch (error) {
    console.error('✗ Falha na conectividade Dify:', error);
    throw error;
  }
}

// Upload file to Dify
async function uploadFileToDify(arquivoUrl: string, apiKey: string): Promise<string> {
  console.log('Baixando arquivo original...');
  console.log('URL do arquivo:', arquivoUrl);
  
  // Download the file first
  const fileResponse = await fetch(arquivoUrl);
  if (!fileResponse.ok) {
    throw new Error(`Erro ao baixar arquivo: ${fileResponse.statusText}`);
  }
  
  const fileBlob = await fileResponse.blob();
  console.log('Arquivo baixado. Tamanho:', fileBlob.size, 'bytes');
  
  // Create form data for upload
  const formData = new FormData();
  formData.append('file', fileBlob, 'document.pdf');
  formData.append('user', 'drystore-user');

  console.log('Enviando arquivo para Dify...');
  const uploadResponse = await fetch('https://api.dify.ai/v1/files/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  console.log('Status do upload:', uploadResponse.status, uploadResponse.statusText);

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error('Erro detalhado do upload:', errorText);
    throw new Error(`Erro no upload: ${uploadResponse.statusText} - ${errorText}`);
  }

  const uploadResult = await uploadResponse.json();
  console.log('✓ Upload concluído com sucesso');
  console.log('Resultado completo do upload:', JSON.stringify(uploadResult, null, 2));
  
  return uploadResult.id;
}

// Process with Dify Chat Messages API
async function processWithDifyChat(fileId: string, tipoProposta: string, apiKey: string, appId: string, modoDebug: boolean = false): Promise<any> {
  console.log('Construindo prompt para tipo:', tipoProposta);
  
  const prompt = getPromptForTipoProposta(tipoProposta);
  console.log('Prompt construído:', prompt.substring(0, 200) + '...');
  
  const requestBody = {
    inputs: {
      app_id: appId
    },
    query: prompt,
    response_mode: "blocking",
    user: "drystore-user",
    files: [
      {
        type: "document",
        transfer_method: "local_file",
        upload_file_id: fileId
      }
    ]
  };
  
  console.log('Enviando request para Dify Chat...');
  console.log('Request body:', JSON.stringify(requestBody, null, 2));
  
  const chatResponse = await fetch('https://api.dify.ai/v1/chat-messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log('Status da resposta Dify:', chatResponse.status, chatResponse.statusText);

  if (!chatResponse.ok) {
    const errorText = await chatResponse.text();
    console.error('Erro detalhado do processamento:', errorText);
    throw new Error(`Erro no processamento: ${chatResponse.statusText} - ${errorText}`);
  }

  const chatResult = await chatResponse.json();
  console.log('=== RESPOSTA COMPLETA DO DIFY ===');
  console.log(JSON.stringify(chatResult, null, 2));
  
  // Parse the response to extract structured data
  return parseResponseToDadosExtraidos(chatResult.answer, tipoProposta, modoDebug);
}

// Get prompt based on proposal type
function getPromptForTipoProposta(tipoProposta: string): string {
  switch (tipoProposta) {
    case 'energia-solar':
      return `EXTRAIA OS DADOS DESTA CONTA DE ENERGIA ELÉTRICA E RETORNE EM JSON.

Analise o documento anexado e extraia os seguintes dados em formato JSON:
{
  "consumo_mensal": número do consumo em kWh,
  "valor_conta": valor da conta,
  "tipo_conexao": "monofásica/bifásica/trifásica",
  "endereco_completo": "endereço completo"
}

IMPORTANTE: Retorne APENAS o JSON válido, sem texto adicional.`;
      
    case 'materiais-construcao':
      return `EXTRAIA OS DADOS DESTE DOCUMENTO DE MATERIAIS E RETORNE EM JSON.

Analise este documento de orçamento/lista de materiais de construção e extraia TODOS os produtos com suas informações. Retorne APENAS um JSON válido com esta estrutura exata:

{
  "numero_proposta": "número ou código da proposta/orçamento",
  "nome_do_cliente": "nome do cliente encontrado no documento",
  "telefone_do_cliente": "telefone do cliente",
  "produtos": [
    {
      "codigo": "código do produto",
      "descricao": "descrição completa do produto/material",
      "quantidade": número,
      "unidade": "unidade de medida (un, m², kg, etc)",
      "preco_unitario": valor numérico,
      "total": valor total do item
    }
  ],
  "valor_frete": valor do frete se especificado,
  "valor_total_proposta": valor total da proposta,
  "observacoes": "observações adicionais se houver"
}

IMPORTANTE: 
- Retorne APENAS o JSON válido, sem texto adicional
- Se não encontrar algum campo, use null ou string vazia
- Valores numéricos devem ser números, não strings
- Extraia TODOS os produtos listados no documento`;
      
    case 'telhas':
      return `EXTRAIA OS DADOS DESTE DOCUMENTO DE TELHAS E RETORNE EM JSON.

Analise este documento e extraia informações sobre telhas:
{
  "area_cobertura": área em m²,
  "tipo_telhado": "tipo de telhado",
  "inclinacao": "inclinação",
  "itens_necessarios": [
    {"item": "nome do item", "quantidade": número}
  ]
}

IMPORTANTE: Retorne APENAS o JSON válido, sem texto adicional.`;

    case 'divisorias':
      return `EXTRAIA OS DADOS DESTE DOCUMENTO DE DIVISÓRIAS E RETORNE EM JSON.

Analise este documento e extraia informações sobre divisórias:
{
  "area_total": área em m²,
  "altura_pe_direito": altura em metros,
  "tipo_acabamento": "tipo de acabamento",
  "itens_necessarios": [
    {"item": "nome do item", "quantidade": número}
  ]
}

IMPORTANTE: Retorne APENAS o JSON válido, sem texto adicional.`;
      
    default:
      return `EXTRAIA OS DADOS DESTE DOCUMENTO E RETORNE EM JSON. Analise este documento e extraia informações relevantes em formato JSON estruturado. IMPORTANTE: Retorne APENAS o JSON válido, sem texto adicional.`;
  }
}

// Parse Dify response to structured data
function parseResponseToDadosExtraidos(response: string, tipoProposta: string, modoDebug: boolean = false): any {
  console.log('=== INICIANDO PARSE DA RESPOSTA DIFY ===');
  console.log('Resposta bruta (primeiros 500 chars):', response.substring(0, 500));
  console.log('Tamanho total da resposta:', response.length);
  console.log('Tipo de proposta:', tipoProposta);
  console.log('Modo debug:', modoDebug);
  
  try {
    // Estratégia 1: Procurar por blocos JSON com ```json
    let jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      console.log('Encontrado bloco JSON com marcadores ```json');
      try {
        const parsedData = JSON.parse(jsonMatch[1]);
        console.log('✓ JSON extraído de bloco marcado:', parsedData);
        return {
          ...parsedData,
          tipo_dados: tipoProposta,
          fonte_dados: 'dify_real'
        };
      } catch (parseError) {
        console.log('✗ Erro no parse do JSON do bloco marcado:', parseError);
      }
    }
    
    // Estratégia 2: Procurar por JSON sem marcadores
    jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log('Encontrado possível JSON sem marcadores');
      console.log('JSON candidato:', jsonMatch[0]);
      try {
        const parsedData = JSON.parse(jsonMatch[0]);
        console.log('✓ JSON extraído sem marcadores:', parsedData);
        return {
          ...parsedData,
          tipo_dados: tipoProposta,
          fonte_dados: 'dify_real'
        };
      } catch (parseError) {
        console.log('✗ Erro no parse do JSON sem marcadores:', parseError);
      }
    }
    
    // Estratégia 3: Limpeza avançada
    console.log('Tentando limpeza avançada da resposta...');
    const cleanedResponse = response
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .replace(/^[^{]*(?=\{)/g, '') // Remove tudo antes do primeiro {
      .replace(/\}[^}]*$/g, '}') // Remove tudo depois do último }
      .trim();
    
    console.log('Resposta após limpeza:', cleanedResponse);
    
    if (cleanedResponse.startsWith('{') && cleanedResponse.endsWith('}')) {
      try {
        const parsedData = JSON.parse(cleanedResponse);
        console.log('✓ JSON extraído após limpeza:', parsedData);
        return {
          ...parsedData,
          tipo_dados: tipoProposta,
          fonte_dados: 'dify_real'
        };
      } catch (parseError) {
        console.log('✗ Erro no parse do JSON limpo:', parseError);
      }
    }
    
    // Se chegou até aqui, nenhuma estratégia funcionou
    console.log('=== FALHA NO PARSE: NENHUMA ESTRATÉGIA FUNCIONOU ===');
    console.log('Resposta original completa para análise:');
    console.log(response);
    
    if (modoDebug) {
      throw new Error(`Falha ao extrair JSON da resposta Dify. Resposta recebida: ${response.substring(0, 1000)}...`);
    }
    
    console.log('=== USANDO FALLBACK DADOS SIMULADOS ===');
    return {
      ...simularProcessamentoDify('', tipoProposta),
      fonte_dados: 'simulado_fallback',
      resposta_original_dify: response
    };
    
  } catch (error) {
    console.error('=== ERRO CRÍTICO NO PARSE ===');
    console.error('Erro:', error);
    console.error('Stack:', error.stack);
    
    if (modoDebug) {
      throw error;
    }
    
    return {
      ...simularProcessamentoDify('', tipoProposta),
      fonte_dados: 'simulado_erro',
      erro_parse: error.message,
      resposta_original_dify: response
    };
  }
}

async function simularProcessamentoDify(arquivoUrl: string, tipoProposta: string) {
  // Simular delay de processamento
  await new Promise(resolve => setTimeout(resolve, 2000));

  if (tipoProposta === 'materiais-construcao') {
    return {
      numero_proposta: 'PROP-MAT-' + Math.floor(Math.random() * 10000),
      nome_do_cliente: 'João Silva Santos',
      telefone_do_cliente: '(11) 98765-4321',
      produtos: [
        {
          codigo: 'CIM001',
          descricao: 'Cimento Portland CP II-E-32 50kg',
          quantidade: 20,
          unidade: 'sc',
          preco_unitario: 28.90,
          total: 578.00
        },
        {
          codigo: 'ARG001', 
          descricao: 'Argamassa AC-I para revestimento interno 20kg',
          quantidade: 15,
          unidade: 'sc',
          preco_unitario: 18.50,
          total: 277.50
        },
        {
          codigo: 'CER001',
          descricao: 'Cerâmica esmaltada 45x45cm PEI 3',
          quantidade: 85,
          unidade: 'm²',
          preco_unitario: 24.90,
          total: 2116.50
        },
        {
          codigo: 'REJ001',
          descricao: 'Rejunte flexível branco 1kg',
          quantidade: 8,
          unidade: 'kg',
          preco_unitario: 12.80,
          total: 102.40
        },
        {
          codigo: 'FER001',
          descricao: 'Vergalhão CA-50 Ø 8mm barra 12m',
          quantidade: 25,
          unidade: 'pc',
          preco_unitario: 45.20,
          total: 1130.00
        }
      ],
      valor_frete: 280.00,
      valor_total_proposta: 4484.40,
      observacoes: 'Entrega em até 5 dias úteis. Descarga por conta do cliente.',
      tipo_dados: 'materiais-construcao'
    };
  }

  // Dados simulados baseados no tipo de proposta
  const dadosBase = {
    'energia-solar': {
      consumo_mensal: Math.floor(Math.random() * 300) + 100,
      valor_conta: Math.floor(Math.random() * 500) + 100,
      endereco_completo: 'Rua Exemplo, 123 - São Paulo, SP',
      tipo_instalacao: 'Residencial',
      area_disponivel: Math.floor(Math.random() * 50) + 20,
      orientacao: 'Sul',
      itens_necessarios: [
        { item: 'Painéis Solares 550W', quantidade: 10 },
        { item: 'Inversor 5kW', quantidade: 1 },
        { item: 'Estrutura de Fixação', quantidade: 10 }
      ]
    },
    'telhas': {
      area_cobertura: Math.floor(Math.random() * 200) + 50,
      tipo_telhado: 'Colonial',
      inclinacao: '30°',
      itens_necessarios: [
        { item: 'Telha Americana', quantidade: 500 },
        { item: 'Cumeeira', quantidade: 20 }
      ]
    },
    'divisorias': {
      area_total: Math.floor(Math.random() * 100) + 20,
      altura_pe_direito: 2.8,
      tipo_acabamento: 'Padrão',
      itens_necessarios: [
        { item: 'Divisória Drywall', quantidade: 25 }
      ]
    }
  };

  return dadosBase[tipoProposta as keyof typeof dadosBase] || dadosBase['energia-solar'];
}

function calcularValorTotal(dadosExtraidos: any, tipoProposta: string): number {
  // Para materiais de construção, usar valor já calculado pelo Dify
  if (tipoProposta === 'materiais-construcao' && dadosExtraidos.valor_total_proposta) {
    return dadosExtraidos.valor_total_proposta;
  }

  if (!dadosExtraidos.itens_necessarios) return 0;

  // Preços base por tipo (simulados)
  const precos: Record<string, number> = {
    'Painéis Solares 550W': 899.99,
    'Inversor 5kW': 2500.00,
    'Estrutura de Fixação': 150.00,
    'Telha Americana': 2.50,
    'Cumeeira': 15.00,
    'Divisória Drywall': 45.00
  };

  let total = 0;
  dadosExtraidos.itens_necessarios.forEach((item: any) => {
    const preco = precos[item.item] || 0;
    total += preco * item.quantidade;
  });

  // Adicionar margem e instalação (20%)
  return Math.round(total * 1.2 * 100) / 100;
}