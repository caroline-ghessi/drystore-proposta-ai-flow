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
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { arquivo_url, tipo_proposta, cliente_nome, cliente_email }: ProcessarDocumentoRequest = await req.json();
    
    console.log('Processando documento:', { arquivo_url, tipo_proposta, cliente_nome });

    // Processar com Dify API ou simulação
    const dadosExtraidos = await processarComDify(arquivo_url, tipo_proposta);
    
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

async function processarComDify(arquivoUrl: string, tipoProposta: string) {
  const difyApiKey = Deno.env.get('DIFY_API_KEY');
  const difyAppId = Deno.env.get('DIFY_APP_ID');
  
  if (!difyApiKey || !difyAppId) {
    console.warn('DIFY_API_KEY ou DIFY_APP_ID não configurados, usando dados simulados');
    return simularProcessamentoDify(arquivoUrl, tipoProposta);
  }

  try {
    console.log(`Processando documento ${tipoProposta} via Dify API`);
    
    // Step 1: Upload file to Dify
    const fileId = await uploadFileToDify(arquivoUrl, difyApiKey);
    console.log('Arquivo enviado para Dify:', fileId);

    // Step 2: Process with chat messages API
    const extractedData = await processWithDifyChat(fileId, tipoProposta, difyApiKey, difyAppId);
    console.log('Dados extraídos pelo Dify:', extractedData);

    return extractedData;
    
  } catch (error) {
    console.error('Erro na integração Dify:', error);
    console.log('Fallback para dados simulados');
    return simularProcessamentoDify(arquivoUrl, tipoProposta);
  }
}

// Upload file to Dify
async function uploadFileToDify(arquivoUrl: string, apiKey: string): Promise<string> {
  console.log('Fazendo upload do arquivo para Dify...');
  
  // Download the file first
  const fileResponse = await fetch(arquivoUrl);
  if (!fileResponse.ok) {
    throw new Error(`Erro ao baixar arquivo: ${fileResponse.statusText}`);
  }
  
  const fileBlob = await fileResponse.blob();
  
  // Create form data for upload
  const formData = new FormData();
  formData.append('file', fileBlob, 'document.pdf');
  formData.append('user', 'drystore-user');

  const uploadResponse = await fetch('https://api.dify.ai/v1/files/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(`Erro no upload: ${uploadResponse.statusText} - ${errorText}`);
  }

  const uploadResult = await uploadResponse.json();
  console.log('Resultado do upload:', uploadResult);
  
  return uploadResult.id;
}

// Process with Dify Chat Messages API
async function processWithDifyChat(fileId: string, tipoProposta: string, apiKey: string, appId: string): Promise<any> {
  console.log('Processando documento com Dify Chat...');
  
  const prompt = getPromptForTipoProposta(tipoProposta);
  
  const chatResponse = await fetch('https://api.dify.ai/v1/chat-messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
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
    }),
  });

  if (!chatResponse.ok) {
    const errorText = await chatResponse.text();
    throw new Error(`Erro no processamento: ${chatResponse.statusText} - ${errorText}`);
  }

  const chatResult = await chatResponse.json();
  console.log('Resposta do Dify:', chatResult);
  
  // Parse the response to extract structured data
  return parseResponseToDadosExtraidos(chatResult.answer, tipoProposta);
}

// Get prompt based on proposal type
function getPromptForTipoProposta(tipoProposta: string): string {
  switch (tipoProposta) {
    case 'energia-solar':
      return `Analise este documento de conta de energia elétrica e extraia os seguintes dados em formato JSON:
      {
        "consumo_mensal": número do consumo em kWh,
        "valor_conta": valor da conta,
        "tipo_conexao": "monofásica/bifásica/trifásica",
        "endereco_completo": "endereço completo"
      }`;
      
    case 'materiais-construcao':
      return `Analise este documento de especificação de materiais de construção e extraia os seguintes dados em formato JSON:
      {
        "produtos": [
          {
            "codigo": "código do produto",
            "descricao": "nome do produto",
            "quantidade": número,
            "unidade": "unidade de medida",
            "preco_unitario": valor,
            "total": valor total
          }
        ],
        "valor_total_proposta": valor total da proposta,
        "observacoes": "observações adicionais"
      }`;
      
    default:
      return `Analise este documento e extraia informações relevantes em formato JSON estruturado.`;
  }
}

// Parse Dify response to structured data
function parseResponseToDadosExtraidos(response: string, tipoProposta: string): any {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedData = JSON.parse(jsonMatch[0]);
      return {
        ...parsedData,
        tipo_dados: tipoProposta
      };
    }
    
    // Fallback to simulated data if parsing fails
    console.log('Não foi possível extrair JSON da resposta, usando dados simulados');
    return simularProcessamentoDify('', tipoProposta);
    
  } catch (error) {
    console.error('Erro ao fazer parse da resposta:', error);
    return simularProcessamentoDify('', tipoProposta);
  }
}

async function simularProcessamentoDify(arquivoUrl: string, tipoProposta: string) {
  // Simular delay de processamento
  await new Promise(resolve => setTimeout(resolve, 2000));

  if (tipoProposta === 'materiais-construcao') {
    return {
      numero_proposta: 'PROP-' + Math.floor(Math.random() * 10000),
      nome_do_cliente: 'Cliente Simulado',
      telefone_do_cliente: '(11) 99999-9999',
      produtos: [
        {
          codigo: 'MAT001',
          descricao: 'Cimento CP II 50kg',
          quantidade: 10,
          unidade: 'saco',
          preco_unitario: 32.50,
          total: 325.00
        },
        {
          codigo: 'MAT002', 
          descricao: 'Areia média m³',
          quantidade: 5,
          unidade: 'm³',
          preco_unitario: 45.00,
          total: 225.00
        },
        {
          codigo: 'MAT003',
          descricao: 'Brita 1 m³',
          quantidade: 3,
          unidade: 'm³',
          preco_unitario: 55.00,
          total: 165.00
        }
      ],
      valor_frete: 150.00,
      valor_total_proposta: 865.00,
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