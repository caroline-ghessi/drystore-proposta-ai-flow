import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configurações do Dify
const difyApiKey = Deno.env.get('DIFY_API_KEY');
const difyAppId = Deno.env.get('DIFY_APP_ID');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { arquivoUrl, nomeArquivo } = await req.json();

    console.log('Processando arquivo para treinamento IA:', nomeArquivo);

    if (!difyApiKey || !difyAppId) {
      throw new Error('Configuração do Dify não encontrada');
    }

    // Fazer download do arquivo do Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documentos-propostas')
      .download(arquivoUrl.replace('documentos-propostas/', ''));

    if (downloadError) {
      console.error('Erro ao baixar arquivo:', downloadError);
      throw new Error('Erro ao baixar arquivo do storage');
    }

    // Converter para base64 para envio ao Dify
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    console.log('Enviando para Dify...');

    // Chamar Dify API para processar o documento
    const difyResponse = await fetch(`https://api.dify.ai/v1/workflows/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${difyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          document_content: base64,
          document_name: nomeArquivo,
          extraction_type: 'training_content'
        },
        response_mode: 'blocking',
        user: 'admin-treinamento'
      }),
    });

    if (!difyResponse.ok) {
      const errorText = await difyResponse.text();
      console.error('Erro na API do Dify:', difyResponse.status, errorText);
      throw new Error(`Dify API error: ${difyResponse.status} - ${errorText}`);
    }

    const difyResult = await difyResponse.json();
    console.log('Resposta do Dify:', difyResult);

    // Extrair informações do resultado do Dify
    const outputs = difyResult.data?.outputs || {};
    
    const conteudoExtraido = outputs.extracted_content || 
                            outputs.content || 
                            outputs.text || 
                            'Conteúdo extraído do documento';

    const titulo = outputs.title || 
                  outputs.suggested_title || 
                  nomeArquivo.replace('.pdf', '');

    const categoria = outputs.category || 
                     outputs.suggested_category || 
                     'tecnico';

    const tags = outputs.tags || 
                outputs.suggested_tags || 
                ['treinamento', 'pdf'];

    // Estruturar resposta
    const resultado = {
      sucesso: true,
      titulo: titulo,
      conteudo: conteudoExtraido,
      categoria: categoria,
      tags: Array.isArray(tags) ? tags : [tags],
      fonte: nomeArquivo,
      processadoEm: new Date().toISOString()
    };

    console.log('Processamento concluído:', resultado);

    return new Response(JSON.stringify(resultado), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no processamento:', error);
    
    return new Response(JSON.stringify({
      sucesso: false,
      erro: error.message || 'Erro interno do servidor',
      detalhes: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});