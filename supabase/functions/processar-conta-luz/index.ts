import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DadosContaLuz {
  nome_cliente: string;
  endereco: string;
  numero_instalacao: string;
  data_emissao: string;
  mes_referencia: string;
  preco_kw: number | null;
  concessionaria: string;
  consumo_atual: number | null;
  valor_total: number | null;
  historico_consumo: {
    dados_ano_atual: {
      ano: number;
      meses: {
        janeiro: number | null;
        fevereiro: number | null;
        março: number | null;
        abril: number | null;
        maio: number | null;
        junho: number | null;
        julho: number | null;
        agosto: number | null;
        setembro: number | null;
        outubro: number | null;
        novembro: number | null;
        dezembro: number | null;
      };
    };
    dados_ano_anterior: {
      ano: number;
      meses: {
        janeiro: number | null;
        fevereiro: number | null;
        março: number | null;
        abril: number | null;
        maio: number | null;
        junho: number | null;
        julho: number | null;
        agosto: number | null;
        setembro: number | null;
        outubro: number | null;
        novembro: number | null;
        dezembro: number | null;
      };
    };
    observacao: string;
  };
}

interface ProcessamentoResult {
  sucesso: boolean;
  dados?: DadosContaLuz;
  erro?: string;
  detalhes?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imagemUrl, clienteNome, clienteEmail } = await req.json();
    
    console.log('Processando conta de luz:', { imagemUrl, clienteNome, clienteEmail });

    const difyApiKey = Deno.env.get('DIFY_ENERGIA_SOLAR_API_KEY');
    const difyAppId = Deno.env.get('DIFY_ENERGIA_SOLAR_APP_ID');

    if (!difyApiKey || !difyAppId) {
      throw new Error('Chaves de API do Dify não configuradas');
    }

    // Fazer chamada para o Dify API com a imagem da conta de luz
    const difyResponse = await fetch(`https://api.dify.ai/v1/workflows/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${difyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: difyAppId,
        inputs: {
          image_file: {
            transfer_method: "remote_url",
            type: "image",
            url: imagemUrl
          },
          cliente_nome: clienteNome,
          cliente_email: clienteEmail
        },
        response_mode: 'blocking',
        user: clienteEmail || 'anonymous'
      }),
    });

    if (!difyResponse.ok) {
      const errorText = await difyResponse.text();
      console.error('Erro na resposta do Dify:', errorText);
      throw new Error(`Falha na comunicação com Dify: ${difyResponse.status}`);
    }

    const difyResult = await difyResponse.json();
    console.log('Resposta do Dify:', difyResult);

    // Processar a resposta do Dify
    if (difyResult.data?.outputs) {
      const outputs = difyResult.data.outputs;
      
      // Extrair dados estruturados da resposta
      const dadosExtraidos: DadosContaLuz = {
        nome_cliente: outputs.nome_cliente || clienteNome,
        endereco: outputs.endereco || '',
        numero_instalacao: outputs.numero_instalacao || '',
        data_emissao: outputs.data_emissao || new Date().toLocaleDateString('pt-BR'),
        mes_referencia: outputs.mes_referencia || '',
        preco_kw: outputs.preco_kw !== undefined ? parseFloat(outputs.preco_kw) : null,
        concessionaria: outputs.concessionaria || 'Não identificada',
        consumo_atual: outputs.consumo_atual !== undefined ? parseFloat(outputs.consumo_atual) : null,
        valor_total: outputs.valor_total !== undefined ? parseFloat(outputs.valor_total) : null,
        historico_consumo: {
          dados_ano_atual: {
            ano: new Date().getFullYear(),
            meses: {
              janeiro: null, fevereiro: null, março: null, abril: null,
              maio: null, junho: null, julho: null, agosto: null,
              setembro: null, outubro: null, novembro: null, dezembro: null
            }
          },
          dados_ano_anterior: {
            ano: new Date().getFullYear() - 1,
            meses: {
              janeiro: null, fevereiro: null, março: null, abril: null,
              maio: null, junho: null, julho: null, agosto: null,
              setembro: null, outubro: null, novembro: null, dezembro: null
            }
          },
          observacao: 'Dados de histórico não encontrados na conta de luz'
        }
      };

      // Sobrescrever historico_consumo apenas com dados parciais se presentes
      if (outputs.historico_consumo) {
        dadosExtraidos.historico_consumo = {
          ...dadosExtraidos.historico_consumo,
          ...outputs.historico_consumo
        };
      }

      // Validação mais robusta
      const dadosValidos = [
        dadosExtraidos.nome_cliente.trim() !== '',
        dadosExtraidos.endereco.trim() !== '',
        dadosExtraidos.consumo_atual !== null && !isNaN(dadosExtraidos.consumo_atual) && dadosExtraidos.consumo_atual > 0,
        dadosExtraidos.preco_kw !== null && !isNaN(dadosExtraidos.preco_kw) && dadosExtraidos.preco_kw > 0
      ].every(Boolean);

      if (!dadosValidos) {
        console.warn('Dados extraídos incompletos ou inválidos:', dadosExtraidos);
      }

      const resultado: ProcessamentoResult = {
        sucesso: true,
        dados: dadosExtraidos,
        detalhes: {
          workflow_id: difyResult.workflow_run_id || 'não disponível',
          tempo_processamento: difyResult.elapsed_time || 0
        }
      };

      return new Response(JSON.stringify(resultado), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      console.error('Formato de resposta inesperado do Dify:', difyResult);
      throw new Error('Formato de resposta inválido do Dify');
    }

  } catch (error) {
    console.error('Erro no processamento da conta de luz:', error);
    
    const resultado: ProcessamentoResult = {
      sucesso: false,
      erro: error.message || 'Erro desconhecido no processamento',
      detalhes: error.stack || error.toString()
    };

    return new Response(JSON.stringify(resultado), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});