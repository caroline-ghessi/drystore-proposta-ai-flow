import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DadosContaLuz {
  cliente_nome: string;
  cliente_cpf_cnpj?: string;
  endereco_instalacao: string;
  consumo_kwh_mes: number;
  valor_conta: number;
  classe_consumo: 'residencial' | 'comercial' | 'industrial';
  tarifa_kwh?: number;
  demanda_contratada?: number;
  distribuidora: string;
  mes_referencia: string;
  bandeira_tarifaria?: string;
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
          image_file: imagemUrl,
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
        cliente_nome: outputs.cliente_nome || clienteNome,
        cliente_cpf_cnpj: outputs.cliente_cpf_cnpj,
        endereco_instalacao: outputs.endereco_instalacao || '',
        consumo_kwh_mes: parseFloat(outputs.consumo_kwh_mes) || 0,
        valor_conta: parseFloat(outputs.valor_conta) || 0,
        classe_consumo: outputs.classe_consumo || 'residencial',
        tarifa_kwh: outputs.tarifa_kwh ? parseFloat(outputs.tarifa_kwh) : undefined,
        demanda_contratada: outputs.demanda_contratada ? parseFloat(outputs.demanda_contratada) : undefined,
        distribuidora: outputs.distribuidora || '',
        mes_referencia: outputs.mes_referencia || '',
        bandeira_tarifaria: outputs.bandeira_tarifaria
      };

      // Validar dados essenciais
      const dadosValidos = dadosExtraidos.consumo_kwh_mes > 0 && 
                          dadosExtraidos.endereco_instalacao.trim() !== '';

      if (!dadosValidos) {
        console.warn('Dados extraídos incompletos:', dadosExtraidos);
      }

      const resultado: ProcessamentoResult = {
        sucesso: true,
        dados: dadosExtraidos,
        detalhes: {
          workflow_id: difyResult.workflow_run_id,
          tempo_processamento: difyResult.elapsed_time
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
      detalhes: error
    };

    return new Response(JSON.stringify(resultado), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});