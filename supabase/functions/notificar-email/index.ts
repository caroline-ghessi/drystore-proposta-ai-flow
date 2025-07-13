import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificarEmailRequest {
  destinatario: string;
  tipo_template: 'proposta_criada' | 'proposta_visualizada' | 'proposta_aceita' | 'solicitacao_contato';
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

    // Enviar email via Resend
    const result = await resend.emails.send({
      from: 'DryStore <propostas@resend.dev>',
      to: destinatario,
      subject: assunto,
      html: emailHtml
    });

    console.log('Email enviado com sucesso:', {
      to: destinatario,
      subject: assunto,
      id: result.data?.id
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Email enviado com sucesso',
      destinatario,
      tipo_template,
      email_id: result.data?.id
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
  const baseStyle = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
  `;
  
  const footerStyle = `
      </div>
      <div style="text-align: center; margin-top: 20px; color: #666;">
        <p>DryStore - Soluções em Construção</p>
        <p style="font-size: 12px;">Este é um email automático, não responda.</p>
      </div>
    </div>
  `;

  const templates = {
    proposta_criada: `
      ${baseStyle}
        <h1 style="color: #2c5aa0; margin-bottom: 20px;">🎉 Sua Proposta DryStore está Pronta!</h1>
        <p style="font-size: 16px; line-height: 1.6;">Olá <strong>${dados.cliente_nome}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6;">Sua proposta de <strong>${dados.tipo_proposta}</strong> foi gerada com sucesso.</p>
        ${dados.valor_total ? `<p style="font-size: 18px; color: #2c5aa0;"><strong>💰 Valor Total: R$ ${dados.valor_total?.toFixed(2)}</strong></p>` : ''}
        <div style="text-align: center; margin: 30px 0;">
          <a href="${dados.url_acesso}" style="background: linear-gradient(135deg, #2c5aa0, #1e3a73); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">🔍 Ver Proposta Completa</a>
        </div>
        <p style="font-size: 14px; color: #666; line-height: 1.6;">💡 <strong>Dica:</strong> Acesse o link acima para visualizar todos os detalhes, especificações técnicas e opções de pagamento.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 16px; line-height: 1.6;">Atenciosamente,<br><strong>Equipe DryStore</strong></p>
      ${footerStyle}
    `,
    proposta_visualizada: `
      ${baseStyle}
        <h1 style="color: #28a745; margin-bottom: 20px;">👀 Proposta Visualizada</h1>
        <p style="font-size: 16px; line-height: 1.6;">O cliente <strong>${dados.cliente_nome}</strong> acabou de visualizar a proposta.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>📅 Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          <p style="margin: 5px 0;"><strong>💰 Valor:</strong> R$ ${dados.valor_total?.toFixed(2)}</p>
          <p style="margin: 5px 0;"><strong>📋 Tipo:</strong> ${dados.tipo_proposta}</p>
        </div>
        <p style="font-size: 14px; color: #666;">💡 É um bom momento para entrar em contato e esclarecer dúvidas!</p>
      ${footerStyle}
    `,
    proposta_aceita: `
      ${baseStyle}
        <h1 style="color: #28a745; margin-bottom: 20px;">🎉 Proposta Aceita!</h1>
        <p style="font-size: 18px; line-height: 1.6; color: #28a745;"><strong>Parabéns! O cliente ${dados.cliente_nome} aceitou a proposta!</strong></p>
        <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <p style="margin: 5px 0; font-size: 16px;"><strong>💰 Valor:</strong> R$ ${dados.valor_total?.toFixed(2)}</p>
          <p style="margin: 5px 0; font-size: 16px;"><strong>📋 Tipo:</strong> ${dados.tipo_proposta}</p>
          ${dados.forma_pagamento ? `<p style="margin: 5px 0; font-size: 16px;"><strong>💳 Pagamento:</strong> ${dados.forma_pagamento}</p>` : ''}
        </div>
        <p style="font-size: 16px; line-height: 1.6;">🚀 <strong>Próximos passos:</strong> Entre em contato com o cliente para finalizar os detalhes e agendar o serviço.</p>
      ${footerStyle}
    `,
    solicitacao_contato: `
      ${baseStyle}
        <h1 style="color: #ffc107; margin-bottom: 20px;">📞 Solicitação de Contato</h1>
        <p style="font-size: 16px; line-height: 1.6;">O cliente <strong>${dados.cliente_nome}</strong> solicitou contato sobre a proposta.</p>
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${dados.cliente_email}</p>
          ${dados.cliente_whatsapp ? `<p style="margin: 5px 0;"><strong>📱 WhatsApp:</strong> ${dados.cliente_whatsapp}</p>` : ''}
          <p style="margin: 5px 0;"><strong>💰 Valor:</strong> R$ ${dados.valor_total?.toFixed(2)}</p>
          <p style="margin: 5px 0;"><strong>📋 Tipo:</strong> ${dados.tipo_proposta}</p>
        </div>
        <p style="font-size: 16px; line-height: 1.6; color: #856404;"><strong>⚡ Ação necessária:</strong> Entre em contato com o cliente o mais rápido possível!</p>
      ${footerStyle}
    `
  };

  return templates[tipo as keyof typeof templates] || templates.proposta_criada;
}

function gerarAssunto(tipo: string, dados: any): string {
  const assuntos = {
    proposta_criada: `🎉 Sua Proposta DryStore - ${dados.tipo_proposta}`,
    proposta_visualizada: `👀 Proposta Visualizada - ${dados.cliente_nome}`,
    proposta_aceita: `🎉 Proposta Aceita - ${dados.cliente_nome}`,
    solicitacao_contato: `📞 Solicitação de Contato - ${dados.cliente_nome}`
  };

  return assuntos[tipo as keyof typeof assuntos] || 'DryStore - Atualização da Proposta';
}