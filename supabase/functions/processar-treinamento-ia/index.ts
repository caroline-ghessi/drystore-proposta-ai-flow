
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

    console.log('Processando arquivo para treinamento IA:', nomeArquivo);

    if (!difyApiKey || !difyAppId) {
      throw new Error('Configuração do Dify para treinamento não encontrada. Verifique DIFY_TREINAMENTO_API_KEY e DIFY_TREINAMENTO_APP_ID');
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

    console.log('Enviando para Dify workflow de treinamento...');

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

    // Extrair texto simples do resultado do Dify
    const conteudoExtraido = difyResult.data?.outputs?.text || 
                            difyResult.data?.outputs?.content || 
                            difyResult.data?.outputs || 
                            'Conteúdo extraído do documento';

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
