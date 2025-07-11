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

interface CriarPropostaRequest {
  cliente_nome: string;
  cliente_email: string;
  cliente_whatsapp?: string;
  cliente_endereco?: string;
  vendedor_id?: string;
  tipo_proposta: string;
  dados_extraidos: any;
  valor_total: number;
  forma_pagamento?: string;
  observacoes?: string;
  arquivo_original?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const dados: CriarPropostaRequest = await req.json();
    
    console.log('Criando proposta para:', dados.cliente_nome);

    // Definir data de vencimento (7 dias)
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 7);

    // Inserir proposta no banco
    const { data: proposta, error: propostaError } = await supabase
      .from('propostas')
      .insert({
        cliente_nome: dados.cliente_nome,
        cliente_email: dados.cliente_email,
        cliente_whatsapp: dados.cliente_whatsapp,
        cliente_endereco: dados.cliente_endereco,
        vendedor_id: dados.vendedor_id,
        tipo_proposta: dados.tipo_proposta,
        dados_extraidos: dados.dados_extraidos,
        valor_total: dados.valor_total,
        forma_pagamento: dados.forma_pagamento,
        observacoes: dados.observacoes,
        arquivo_original: dados.arquivo_original,
        data_vencimento: dataVencimento.toISOString(),
        status: 'enviada'
      })
      .select()
      .single();

    if (propostaError) {
      throw propostaError;
    }

    // Criar ou atualizar cliente
    const { data: clienteExistente } = await supabase
      .from('clientes')
      .select('id')
      .eq('email', dados.cliente_email)
      .single();

    if (!clienteExistente) {
      await supabase
        .from('clientes')
        .insert({
          nome: dados.cliente_nome,
          email: dados.cliente_email,
          whatsapp: dados.cliente_whatsapp,
          endereco: dados.cliente_endereco,
          vendedor_id: dados.vendedor_id
        });
    }

    // Criar notificação
    await supabase
      .from('notificacoes')
      .insert({
        proposta_id: proposta.id,
        tipo: 'visualizacao',
        mensagem: `Proposta criada para ${dados.cliente_nome}`,
        dados_extras: { 
          valor_total: dados.valor_total,
          tipo_proposta: dados.tipo_proposta
        }
      });

    console.log('Proposta criada com sucesso:', proposta.id);

    // Retornar proposta com URL de acesso
    const resultado = {
      ...proposta,
      url_acesso: `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/proposta/${proposta.url_unica}`
    };

    return new Response(JSON.stringify(resultado), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao criar proposta:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao criar proposta',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});