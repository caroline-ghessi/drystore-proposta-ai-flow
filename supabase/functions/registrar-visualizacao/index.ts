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

interface RegistrarVisualizacaoRequest {
  url_unica: string;
  dados_extras?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url_unica, dados_extras }: RegistrarVisualizacaoRequest = await req.json();
    
    console.log('Registrando visualização para:', url_unica);

    // Buscar proposta
    const { data: proposta, error: propostaError } = await supabase
      .from('propostas')
      .select('*')
      .eq('url_unica', url_unica)
      .single();

    if (propostaError || !proposta) {
      throw new Error('Proposta não encontrada');
    }

    // Só registrar se ainda não foi visualizada
    if (!proposta.data_visualizacao) {
      // Atualizar proposta com data de visualização
      const { error: updateError } = await supabase
        .from('propostas')
        .update({ 
          data_visualizacao: new Date().toISOString(),
          status: 'visualizada'
        })
        .eq('id', proposta.id);

      if (updateError) {
        throw updateError;
      }

      // Criar notificação de visualização
      await supabase
        .from('notificacoes')
        .insert({
          proposta_id: proposta.id,
          tipo: 'visualizacao',
          mensagem: `Cliente ${proposta.cliente_nome} visualizou a proposta`,
          dados_extras: {
            ...dados_extras,
            timestamp: new Date().toISOString(),
            ip: req.headers.get('x-forwarded-for') || 'unknown'
          }
        });

      console.log('Visualização registrada com sucesso para proposta:', proposta.id);

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
                tipo_template: 'proposta_visualizada',
                dados_proposta: {
                  cliente_nome: proposta.cliente_nome,
                  tipo_proposta: proposta.tipo_proposta,
                  valor_total: proposta.valor_total,
                  vendedor_nome: vendedor.nome
                }
              }
            });
            console.log('Email de visualização enviado para vendedor:', vendedor.email);
          }
        } catch (emailError) {
          console.error('Erro ao enviar email de visualização:', emailError);
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      proposta: {
        id: proposta.id,
        cliente_nome: proposta.cliente_nome,
        status: proposta.status,
        data_visualizacao: proposta.data_visualizacao
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao registrar visualização:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao registrar visualização',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});