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

    // Simular processamento com Dify API (substituir pela integração real)
    const dadosExtraidos = await simularProcessamentoDify(arquivo_url, tipo_proposta);
    
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

async function simularProcessamentoDify(arquivoUrl: string, tipoProposta: string) {
  // Simular delay de processamento
  await new Promise(resolve => setTimeout(resolve, 2000));

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