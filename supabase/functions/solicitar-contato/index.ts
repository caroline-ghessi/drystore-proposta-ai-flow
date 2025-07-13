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

interface SolicitarContatoRequest {
  proposta_id: string;
  mensagem?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { proposta_id, mensagem }: SolicitarContatoRequest = await req.json();
    
    console.log('Solicitação de contato para proposta:', proposta_id);

    // Buscar proposta
    const { data: proposta, error: propostaError } = await supabase
      .from('propostas')
      .select('*')
      .eq('id', proposta_id)
      .single();

    if (propostaError || !proposta) {
      throw new Error('Proposta não encontrada');
    }

    // Criar notificação de solicitação de contato
    await supabase
      .from('notificacoes')
      .insert({
        proposta_id: proposta_id,
        tipo: 'contato',
        mensagem: `Cliente ${proposta.cliente_nome} solicitou contato`,
        dados_extras: {
          valor_total: proposta.valor_total,
          mensagem_cliente: mensagem,
          timestamp: new Date().toISOString(),
          urgencia: 'alta'
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
              tipo_template: 'solicitacao_contato',
              dados_proposta: {
                cliente_nome: proposta.cliente_nome,
                cliente_email: proposta.cliente_email,
                cliente_whatsapp: proposta.cliente_whatsapp,
                tipo_proposta: proposta.tipo_proposta,
                valor_total: proposta.valor_total,
                vendedor_nome: vendedor.nome,
                mensagem_cliente: mensagem
              }
            }
          });
          console.log('Email de solicitação de contato enviado para vendedor:', vendedor.email);
        }
      } catch (emailError) {
        console.error('Erro ao enviar email de solicitação de contato:', emailError);
      }
    }

    console.log('Solicitação de contato registrada com sucesso:', proposta_id);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Solicitação de contato enviada com sucesso',
      dados: {
        proposta_id: proposta_id,
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao processar solicitação de contato:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao processar solicitação de contato',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});