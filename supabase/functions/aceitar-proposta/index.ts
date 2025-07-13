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

interface AceitarPropostaRequest {
  proposta_id: string;
  forma_pagamento?: string;
  observacoes?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { proposta_id, forma_pagamento, observacoes }: AceitarPropostaRequest = await req.json();
    
    console.log('Aceitando proposta:', proposta_id);

    // Buscar proposta
    const { data: proposta, error: propostaError } = await supabase
      .from('propostas')
      .select('*')
      .eq('id', proposta_id)
      .single();

    if (propostaError || !proposta) {
      throw new Error('Proposta não encontrada');
    }

    // Atualizar proposta como aceita
    const { error: updateError } = await supabase
      .from('propostas')
      .update({ 
        status: 'aceita',
        data_aceitacao: new Date().toISOString(),
        forma_pagamento: forma_pagamento || proposta.forma_pagamento,
        observacoes: observacoes ? `${proposta.observacoes || ''}\n\nObs. Cliente: ${observacoes}`.trim() : proposta.observacoes
      })
      .eq('id', proposta_id);

    if (updateError) {
      throw updateError;
    }

    // Criar notificação de aceitação
    await supabase
      .from('notificacoes')
      .insert({
        proposta_id: proposta_id,
        tipo: 'aceitacao',
        mensagem: `Cliente ${proposta.cliente_nome} aceitou a proposta`,
        dados_extras: {
          valor_total: proposta.valor_total,
          forma_pagamento: forma_pagamento,
          observacoes: observacoes,
          timestamp: new Date().toISOString()
        }
      });

    // Enviar email para o vendedor se houver
    if (proposta.vendedor_id) {
      try {
        // Buscar email do vendedor
        const { data: vendedor } = await supabase
          .from('vendedores')
          .select('email, nome')
          .eq('id', proposta.vendedor_id)
          .single();

        if (vendedor?.email) {
          await supabase.functions.invoke('notificar-email', {
            body: {
              destinatario: vendedor.email,
              tipo_template: 'proposta_aceita',
              dados_proposta: {
                cliente_nome: proposta.cliente_nome,
                tipo_proposta: proposta.tipo_proposta,
                valor_total: proposta.valor_total,
                forma_pagamento: forma_pagamento || 'Não especificada',
                vendedor_nome: vendedor.nome,
                observacoes: observacoes
              }
            }
          });
          console.log('Email de aceitação enviado para vendedor:', vendedor.email);
        }
      } catch (emailError) {
        console.error('Erro ao enviar email de aceitação:', emailError);
      }
    }

    console.log('Proposta aceita com sucesso:', proposta_id);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Proposta aceita com sucesso',
      proposta: {
        id: proposta_id,
        status: 'aceita',
        data_aceitacao: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao aceitar proposta:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao aceitar proposta',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});