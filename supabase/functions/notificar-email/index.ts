import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificarEmailRequest {
  destinatario: string;
  tipo_template: 'proposta_criada' | 'proposta_visualizada' | 'proposta_aceita';
  dados_proposta: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { destinatario, tipo_template, dados_proposta }: NotificarEmailRequest = await req.json();
    
    console.log('Enviando email:', { destinatario, tipo_template });

    // Gerar template baseado no tipo
    const emailHtml = gerarTemplateEmail(tipo_template, dados_proposta);
    const assunto = gerarAssunto(tipo_template, dados_proposta);

    // Simular envio de email (substituir por integração real - Resend, SendGrid, etc.)
    console.log('Email simulado enviado:', {
      to: destinatario,
      subject: assunto,
      html: emailHtml
    });

    // Em produção, aqui seria a integração real com serviço de email
    // Exemplo com Resend:
    // const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    // const result = await resend.emails.send({
    //   from: 'DryStore <propostas@drystore.com>',
    //   to: destinatario,
    //   subject: assunto,
    //   html: emailHtml
    // });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Email enviado com sucesso',
      destinatario,
      tipo_template
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao enviar email',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function gerarTemplateEmail(tipo: string, dados: any): string {
  const templates = {
    proposta_criada: `
      <h1>Sua Proposta DryStore está Pronta!</h1>
      <p>Olá ${dados.cliente_nome},</p>
      <p>Sua proposta de ${dados.tipo_proposta} foi gerada com sucesso.</p>
      <p><strong>Valor Total:</strong> R$ ${dados.valor_total?.toFixed(2)}</p>
      <p><a href="${dados.url_acesso}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Proposta</a></p>
      <p>Atenciosamente,<br>Equipe DryStore</p>
    `,
    proposta_visualizada: `
      <h1>Proposta Visualizada</h1>
      <p>O cliente ${dados.cliente_nome} visualizou a proposta.</p>
      <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
    `,
    proposta_aceita: `
      <h1>Proposta Aceita! 🎉</h1>
      <p>O cliente ${dados.cliente_nome} aceitou a proposta.</p>
      <p><strong>Valor:</strong> R$ ${dados.valor_total?.toFixed(2)}</p>
    `
  };

  return templates[tipo as keyof typeof templates] || templates.proposta_criada;
}

function gerarAssunto(tipo: string, dados: any): string {
  const assuntos = {
    proposta_criada: `Sua Proposta DryStore - ${dados.tipo_proposta}`,
    proposta_visualizada: `Proposta Visualizada - ${dados.cliente_nome}`,
    proposta_aceita: `Proposta Aceita - ${dados.cliente_nome} 🎉`
  };

  return assuntos[tipo as keyof typeof assuntos] || 'DryStore - Atualização da Proposta';
}