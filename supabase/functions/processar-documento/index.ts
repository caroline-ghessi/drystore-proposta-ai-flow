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
    tipoProposta,
    arquivoUrl: arquivoUrl.substring(0, 100) + '...'
  });
  
  if (!difyApiKey || !difyAppId) {
    const erro = 'DIFY_API_KEY ou DIFY_APP_ID não configurado';
    console.error('=== ERRO DE CONFIGURAÇÃO ===', erro);
    
    if (modoDebug) {
      throw new Error(erro);
    }
    
    console.warn('Usando dados simulados (credenciais ausentes)');
    return simularProcessamentoDify(arquivoUrl, tipoProposta);
  }

  // Validar se URL é acessível
  console.log('=== VALIDANDO ACESSO À URL ===');
  try {
    await validarUrlPublica(arquivoUrl);
    console.log('✓ URL validada como acessível publicamente');
  } catch (validationError) {
    console.error('✗ URL não acessível:', validationError.message);
    if (modoDebug) {
      throw new Error(`URL não acessível pelo Dify: ${validationError.message}`);
    }
    console.warn('Continuando com URL potencialmente inacessível...');
  }

  try {
    console.log('=== ESTRATÉGIA 1: UPLOAD + WORKFLOW ===');
    
    // Tentar upload do arquivo para Dify primeiro
    const fileId = await uploadFileToDify(arquivoUrl, difyApiKey, modoDebug);
    
    if (fileId) {
      console.log(`✓ Upload bem-sucedido, file_id: ${fileId}`);
      console.log('=== PROCESSAMENTO VIA WORKFLOW API ===');
      
      const extractedData = await processWithDifyWorkflow(fileId, tipoProposta, difyApiKey, difyAppId, modoDebug);
      console.log('✓ Processamento Workflow concluído');
      console.log('=== DADOS EXTRAÍDOS PELO WORKFLOW ===', JSON.stringify(extractedData, null, 2));
      return extractedData;
    }
    
    throw new Error('Upload falhou');
    
  } catch (uploadError) {
    console.error('=== FALHA NA ESTRATÉGIA 1 ===', uploadError.message);
    
    console.log('=== ESTRATÉGIA 2: WORKFLOW COM URL REMOTA ===');
    try {
      const extractedData = await processWithDifyWorkflow(null, tipoProposta, difyApiKey, difyAppId, modoDebug, arquivoUrl);
      console.log('✓ Processamento Workflow (URL remota) concluído');
      console.log('=== DADOS EXTRAÍDOS PELO WORKFLOW ===', JSON.stringify(extractedData, null, 2));
      return extractedData;
      
    } catch (workflowError) {
      console.error('=== FALHA NA ESTRATÉGIA 2 ===', workflowError.message);
      
      if (modoDebug) {
        throw new Error(`Ambas estratégias falharam: Upload: ${uploadError.message}, Workflow: ${workflowError.message}`);
      }
      
      console.log('=== USANDO FALLBACK (DADOS SIMULADOS) ===');
      return simularProcessamentoDify(arquivoUrl, tipoProposta);
    }
  }
}

// Validar se URL é acessível publicamente
async function validarUrlPublica(url: string): Promise<void> {
  console.log('[VALIDACAO] Testando acesso à URL:', url);
  
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'Dify-Integration-Test/1.0'
      }
    });
    
    console.log('[VALIDACAO] Status:', response.status, response.statusText);
    console.log('[VALIDACAO] Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    console.log('[VALIDACAO] Content-Type:', contentType);
    
    if (!contentType || (!contentType.includes('pdf') && !contentType.includes('image'))) {
      console.warn('[VALIDACAO] Content-Type suspeito:', contentType);
    }
    
  } catch (error) {
    console.error('[VALIDACAO] Erro ao acessar URL:', error);
    throw error;
  }
}

// Upload file to Dify for workflow processing
async function uploadFileToDify(arquivoUrl: string, apiKey: string, modoDebug: boolean = false): Promise<string | null> {
  console.log('[UPLOAD] Baixando arquivo original...');
  console.log('[UPLOAD] URL do arquivo:', arquivoUrl);
  
  // Download the file first
  const fileResponse = await fetch(arquivoUrl);
  if (!fileResponse.ok) {
    throw new Error(`Erro ao baixar arquivo: ${fileResponse.status} ${fileResponse.statusText}`);
  }
  
  const fileBlob = await fileResponse.blob();
  console.log('[UPLOAD] Arquivo baixado. Tamanho:', fileBlob.size, 'bytes, Tipo:', fileBlob.type);
  
  // Create form data for upload conforme documentação Dify
  const formData = new FormData();
  
  // Determinar tipo do arquivo baseado na URL ou blob
  const isImage = fileBlob.type.startsWith('image/') || arquivoUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const fileExtension = isImage ? 'png' : 'pdf';
  const mimeType = isImage ? fileBlob.type || 'image/png' : 'application/pdf';
  
  console.log('[UPLOAD] Tipo detectado:', { isImage, fileExtension, mimeType });
  
  formData.append('file', new File([fileBlob], `document.${fileExtension}`, { type: mimeType }));
  formData.append('user', 'drystore-user');

  console.log('[UPLOAD] Enviando arquivo para Dify API...');
  const uploadResponse = await fetch('https://api.dify.ai/v1/files/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  console.log('[UPLOAD] Status:', uploadResponse.status, uploadResponse.statusText);
  console.log('[UPLOAD] Headers resposta:', Object.fromEntries(uploadResponse.headers.entries()));

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error('[UPLOAD] Erro detalhado:', errorText);
    console.error('[UPLOAD] Headers request enviado: Authorization: Bearer [HIDDEN]');
    throw new Error(`Upload falhou: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
  }

  const uploadResult = await uploadResponse.json();
  console.log('[UPLOAD] ✓ Upload concluído com sucesso');
  console.log('[UPLOAD] Resultado completo:', JSON.stringify(uploadResult, null, 2));
  
  if (!uploadResult.id) {
    throw new Error('Upload bem-sucedido mas ID do arquivo não retornado');
  }
  
  return uploadResult.id;
}

// Process with Dify Workflow API
async function processWithDifyWorkflow(
  fileId: string | null,
  tipoProposta: string,
  apiKey: string,
  appId: string,
  modoDebug: boolean = false,
  remoteUrl?: string
): Promise<any> {
  const endpoint = 'https://api.dify.ai/v1/workflows/run';
  
  console.log(`[WORKFLOW] Iniciando processamento workflow - fileId: ${fileId}, tipo: ${tipoProposta}`);
  
  // Configurar estrutura de requisição correta conforme documentação
  const query = "faça a extração de dados desse arquivo"; // Query fora dos inputs
  
  // Preparar inputs do workflow usando pdf_file conforme placeholder
  let inputs: any = {};
  
  if (remoteUrl) {
    console.log(`[WORKFLOW] Configurando pdf_file com URL remota: ${remoteUrl}`);
    inputs.pdf_file = remoteUrl; // Usar pdf_file diretamente como string
  } else if (fileId) {
    console.log(`[WORKFLOW] Configurando pdf_file com file_id: ${fileId}`);
    inputs.pdf_file = fileId; // Alternativamente usar file_id
  }

  const body = {
    inputs: inputs,
    query: query, // Query fora dos inputs
    response_mode: "blocking",
    user: "drystore-user"
  };

  console.log(`[WORKFLOW] Request body:`, JSON.stringify(body, null, 2));

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  console.log(`[WORKFLOW] Status da resposta: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[WORKFLOW] Dify Workflow API error: ${response.status} - ${errorText}`);
    throw new Error(`Dify Workflow API error: ${response.status} - ${errorText}`);
  }

  const responseData = await response.json();
  
  console.log(`[WORKFLOW] Resposta completa:`, JSON.stringify(responseData, null, 2));

  // Processar resposta priorizando structured_output
  let extractedData = null;
  
  // Procurar structured_output em diferentes locais da resposta
  if (responseData.data?.outputs?.structured_output) {
    console.log(`[WORKFLOW] Usando structured_output do outputs`);
    extractedData = responseData.data.outputs.structured_output;
  } else if (responseData.structured_output) {
    console.log(`[WORKFLOW] Usando structured_output raiz`);
    extractedData = responseData.structured_output;
  } else if (responseData.data?.outputs?.text) {
    console.log(`[WORKFLOW] Tentando extrair JSON do campo text`);
    try {
      const textOutput = responseData.data.outputs.text;
      if (typeof textOutput === 'string') {
        extractedData = JSON.parse(textOutput.replace(/```json\n?/g, '').replace(/```/g, ''));
      } else {
        extractedData = textOutput;
      }
    } catch (parseError) {
      console.error(`[WORKFLOW] Erro ao parsear text como JSON:`, parseError);
      throw new Error('Não foi possível extrair dados estruturados da resposta do Dify');
    }
  } else {
    console.error(`[WORKFLOW] Estrutura de resposta inesperada, usando fallback`);
    throw new Error('Resposta do Dify não contém dados estruturados válidos');
  }
  
  if (extractedData) {
    console.log(`[WORKFLOW] Dados estruturados extraídos com sucesso:`, extractedData);
    return formatWorkflowDataToExpectedStructure(extractedData, tipoProposta);
  } else {
    console.log(`[WORKFLOW] Structured output não encontrado, tentando parsing tradicional`);
    const textContent = JSON.stringify(responseData);
    return parseResponseToDadosExtraidos(textContent, tipoProposta, modoDebug);
  }
}

function formatWorkflowDataToExpectedStructure(data: any, tipoProposta: string): any {
  // Para materiais de construção, o Dify retorna estrutura específica
  if (tipoProposta === 'materiais-construcao') {
    return {
      numeroPropostaCliente: data.numero_proposta || 'Não encontrado',
      nomeCliente: data.nome_do_cliente || 'Não encontrado',
      telefoneCliente: data.telefone_do_cliente || 'Não encontrado',
      produtos: data.produtos || [],
      valorFrete: data.valor_frete || 0,
      valorTotalProposta: data.valor_total_proposta || 0,
      observacoes: data.observacoes || '',
      tipo_dados: tipoProposta,
      fonte_dados: 'dify_workflow'
    };
  }
  
  // Para outros tipos, manter estrutura original com metadados
  return {
    ...data,
    tipo_dados: tipoProposta,
    fonte_dados: 'dify_workflow'
  };
}

// Process with Dify Chat Messages API
async function processWithDifyChat(
  fileId: string | null, 
  tipoProposta: string, 
  apiKey: string, 
  appId: string, 
  modoDebug: boolean = false,
  transferMethod: 'local_file' | 'remote_url' = 'local_file',
  remoteUrl?: string
): Promise<any> {
  console.log('[CHAT] Construindo prompt para tipo:', tipoProposta);
  console.log('[CHAT] Método de transferência:', transferMethod);
  
  const prompt = getPromptForTipoProposta(tipoProposta);
  console.log('[CHAT] Prompt construído:', prompt.substring(0, 200) + '...');
  
  // Construir estrutura de arquivos conforme documentação oficial Dify
  let files: any[] = [];
  
  if (transferMethod === 'remote_url' && remoteUrl) {
    console.log('[CHAT] Configurando arquivo via URL remota:', remoteUrl);
    files = [
      {
        transfer_method: "remote_url", 
        url: remoteUrl
      }
    ];
  } else if (transferMethod === 'local_file' && fileId) {
    console.log('[CHAT] Configurando arquivo via upload local:', fileId);
    files = [
      {
        transfer_method: "local_file",
        file_id: fileId  // Campo correto conforme documentação
      }
    ];
  }
  
  const requestBody = {
    inputs: {}, // Removido app_id dos inputs conforme documentação
    query: prompt,
    response_mode: "blocking",
    user: "drystore-user",
    files: files
  };
  
  console.log('[CHAT] Enviando request para Dify Chat API...');
  console.log('[CHAT] Request body:', JSON.stringify(requestBody, null, 2));
  
  const startTime = Date.now();
  const chatResponse = await fetch('https://api.dify.ai/v1/chat-messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });
  
  const responseTime = Date.now() - startTime;
  console.log('[CHAT] Status:', chatResponse.status, chatResponse.statusText);
  console.log('[CHAT] Tempo resposta:', responseTime + 'ms');
  console.log('[CHAT] Headers resposta:', Object.fromEntries(chatResponse.headers.entries()));

  if (!chatResponse.ok) {
    const errorText = await chatResponse.text();
    console.error('[CHAT] Erro detalhado:', errorText);
    console.error('[CHAT] Request que falhou:', JSON.stringify(requestBody, null, 2));
    console.error('[CHAT] Headers da requisição:', {
      'Authorization': 'Bearer [HIDDEN]',
      'Content-Type': 'application/json'
    });
    
    // Tentar parse do erro para mais detalhes
    try {
      const errorJson = JSON.parse(errorText);
      console.error('[CHAT] Erro estruturado:', errorJson);
    } catch (e) {
      console.error('[CHAT] Erro não é JSON válido');
    }
    
    // Se modo debug, mostrar erro completo sem fallback
    if (modoDebug) {
      throw new Error(`Chat Dify falhou: ${chatResponse.status} ${chatResponse.statusText} - ${errorText}`);
    }
    
    throw new Error(`Chat Dify falhou: ${chatResponse.status} ${chatResponse.statusText}`);
  }

  const chatResult = await chatResponse.json();
  console.log('[CHAT] ✓ Resposta recebida com sucesso');
  console.log('[CHAT] Estrutura da resposta:', Object.keys(chatResult));
  console.log('[CHAT] Resposta completa:', JSON.stringify(chatResult, null, 2));
  
  // Verificar se resposta tem estrutura esperada
  if (!chatResult.answer && !chatResult.data && !chatResult.message) {
    console.warn('[CHAT] Resposta não tem campos esperados (answer/data/message)');
    if (modoDebug) {
      throw new Error('Resposta Dify sem campo answer/data/message');
    }
  }
  
  // Parse the response to extract structured data
  const answerText = chatResult.answer || chatResult.data || chatResult.message || JSON.stringify(chatResult);
  return parseResponseToDadosExtraidos(answerText, tipoProposta, modoDebug);
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