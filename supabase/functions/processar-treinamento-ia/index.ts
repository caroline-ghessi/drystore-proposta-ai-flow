
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configurações do Dify para treinamento
const difyApiKey = Deno.env.get('DIFY_TREINAMENTO_API_KEY');
const difyAppId = Deno.env.get('DIFY_TREINAMENTO_APP_ID');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Função para gerar título baseado no conteúdo
function gerarTitulo(conteudo: string, nomeArquivo: string): string {
  // Tenta pegar as primeiras palavras do conteúdo para gerar um título
  const primeiraLinha = conteudo.split('\n')[0];
  if (primeiraLinha && primeiraLinha.length > 10 && primeiraLinha.length < 100) {
    // Remove caracteres especiais e limita o tamanho
    return primeiraLinha.replace(/[^\w\s]/gi, '').substring(0, 80).trim();
  }
  
  // Fallback para nome do arquivo limpo
  return nomeArquivo.replace('.pdf', '').replace(/[-_]/g, ' ').trim();
}

// Função para determinar categoria baseada no conteúdo
function determinarCategoria(conteudo: string): string {
  const conteudoLower = conteudo.toLowerCase();
  
  // Palavras-chave para cada categoria
  const categorias = {
    'energia-solar': ['solar', 'painel', 'inversor', 'fotovoltaico', 'energia', 'kwh', 'kwp', 'irradiação'],
    'telhas': ['telha', 'shingle', 'cobertura', 'telhado', 'rufo', 'cumeeira', 'calha'],
    'drywall': ['drywall', 'gesso', 'divisória', 'parede', 'placa', 'perfil', 'estrutura'],
    'impermeabilizacao': ['impermeabilização', 'manta', 'primer', 'laje', 'fundação', 'vedação'],
    'vendas': ['venda', 'cliente', 'proposta', 'orçamento', 'negociação', 'preço', 'contrato'],
    'tecnico': ['instalação', 'montagem', 'técnico', 'procedimento', 'especificação', 'norma']
  };
  
  for (const [categoria, palavras] of Object.entries(categorias)) {
    const matches = palavras.filter(palavra => conteudoLower.includes(palavra));
    if (matches.length >= 2) {
      return categoria;
    }
  }
  
  return 'tecnico'; // Categoria padrão
}

// Função para gerar tags baseadas no conteúdo
function gerarTags(conteudo: string, nomeArquivo: string): string[] {
  const conteudoLower = conteudo.toLowerCase();
  const tags = ['treinamento', 'pdf'];
  
  // Tags baseadas em palavras-chave
  const tagsPalavasChave = {
    'energia-solar': 'energia-solar',
    'solar': 'energia-solar',
    'painel': 'paineis-solares',
    'inversor': 'inversores',
    'telha': 'telhas',
    'shingle': 'telhas-shingle',
    'drywall': 'drywall',
    'divisória': 'divisorias',
    'impermeabilização': 'impermeabilizacao',
    'manta': 'mantas',
    'vendas': 'vendas',
    'cliente': 'atendimento',
    'instalação': 'instalacao',
    'técnico': 'tecnico',
    'procedimento': 'procedimentos',
    'norma': 'normas'
  };
  
  for (const [palavra, tag] of Object.entries(tagsPalavasChave)) {
    if (conteudoLower.includes(palavra) && !tags.includes(tag)) {
      tags.push(tag);
    }
  }
  
  // Adicionar tag baseada no nome do arquivo
  const nomeArquivoLower = nomeArquivo.toLowerCase();
  if (nomeArquivoLower.includes('manual') && !tags.includes('manual')) {
    tags.push('manual');
  }
  if (nomeArquivoLower.includes('guia') && !tags.includes('guia')) {
    tags.push('guia');
  }
  
  return tags.slice(0, 8); // Limita a 8 tags
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { arquivoUrl, nomeArquivo } = await req.json();
    
    if (!arquivoUrl) {
      return new Response(JSON.stringify({ 
        sucesso: false, 
        erro: 'URL do arquivo é obrigatória' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processando arquivo para treinamento IA:', nomeArquivo);
    console.log('Caminho do arquivo:', arquivoUrl);

    if (!difyApiKey || !difyAppId) {
      throw new Error('Configuração do Dify para treinamento não encontrada. Verifique DIFY_TREINAMENTO_API_KEY e DIFY_TREINAMENTO_APP_ID');
    }

    // Extrair o nome do arquivo do caminho completo
    const nomeArquivoExtraido = arquivoUrl.split('/').pop() || nomeArquivo;
    
    console.log('Verificando arquivo:', {
      arquivoUrl,
      nomeArquivoExtraido,
      bucketPath: 'documentos/'
    });

    // Verificar se o arquivo existe no bucket (na pasta documentos/)
    const { data: fileExists, error: checkError } = await supabase.storage
      .from('documentos-propostas')
      .list('documentos', { 
        search: nomeArquivoExtraido
      });

    if (checkError) {
      console.error('Erro ao verificar arquivo:', checkError);
      throw new Error('Erro ao verificar se o arquivo existe');
    }

    if (!fileExists || fileExists.length === 0) {
      console.error('Arquivo não encontrado no bucket:', {
        pasta: 'documentos/',
        arquivo: nomeArquivoExtraido,
        arquivoUrlOriginal: arquivoUrl
      });
      throw new Error('Arquivo não encontrado no storage');
    }

    console.log('Arquivo encontrado no storage:', {
      arquivo: fileExists[0],
      totalArquivos: fileExists.length
    });

    // Gerar URL pública para acesso do Dify (como nas outras funções)
    const { data: publicUrlData } = supabase.storage
      .from('documentos-propostas')
      .getPublicUrl(arquivoUrl);

    if (!publicUrlData?.publicUrl) {
      console.error('Erro ao gerar URL pública para o arquivo');
      throw new Error('Erro ao gerar URL pública para o arquivo');
    }

    const fileUrl = publicUrlData.publicUrl;
    console.log('URL pública gerada para Dify:', fileUrl);
    console.log('Arquivo acessível via URL pública');

    // Chamar Dify API para processar o documento (com timeout de 5 minutos)
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), 5 * 60 * 1000); // 5 minutos

    let conteudoExtraido: string;

    try {
      // Preparar payload no formato correto que o Dify espera
      const difyPayload = {
        app_id: difyAppId,
        inputs: {
          pdf_file: [  // Array obrigatório conforme erro do Dify
            {
              transfer_method: "remote_url",
              url: fileUrl,
              type: "application/pdf", 
              filename: nomeArquivo
            }
          ],
          nome_arquivo: nomeArquivo
        },
        response_mode: 'blocking',
        user: 'admin-treinamento'
      };
      
      console.log('Payload enviado para Dify:', JSON.stringify(difyPayload, null, 2));
      
      const difyResponse = await fetch(`https://api.dify.ai/v1/workflows/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${difyApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(difyPayload),
        signal: timeoutController.signal
      });

      clearTimeout(timeoutId);

      if (!difyResponse.ok) {
        const errorText = await difyResponse.text();
        console.error('Erro na API do Dify:', difyResponse.status, errorText);
        throw new Error(`Dify API error: ${difyResponse.status} - ${errorText}`);
      }

      const difyResult = await difyResponse.json();
      console.log('Resposta do Dify recebida com sucesso');
      console.log('Tipo de saída:', typeof difyResult.data?.outputs);

      // Extrair texto simples do resultado do Dify
      conteudoExtraido = difyResult.data?.outputs?.text || 
                         difyResult.data?.outputs?.content || 
                         difyResult.data?.outputs || 
                         'Conteúdo extraído do documento';

      console.log('Conteúdo extraído (primeiros 200 chars):', 
                  String(conteudoExtraido).substring(0, 200) + '...');
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Timeout: O processamento do Dify demorou mais de 5 minutos');
      }
      throw error;
    }

    // Gerar título baseado no conteúdo ou nome do arquivo
    const titulo = gerarTitulo(conteudoExtraido, nomeArquivo);

    // Determinar categoria baseada no conteúdo
    const categoria = determinarCategoria(conteudoExtraido);

    // Gerar tags automaticamente baseadas no conteúdo
    const tags = gerarTags(conteudoExtraido, nomeArquivo);

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
