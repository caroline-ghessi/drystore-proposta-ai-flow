import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Iniciando limpeza de arquivos de treinamento...');

    // Calcular data limite (7 dias atrás)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoffDate = sevenDaysAgo.toISOString();

    console.log('Data limite para limpeza:', cutoffDate);

    // Listar arquivos no bucket documentos-propostas
    const { data: files, error: listError } = await supabase.storage
      .from('documentos-propostas')
      .list('documentos', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'asc' }
      });

    if (listError) {
      console.error('Erro ao listar arquivos:', listError);
      throw new Error(`Erro ao listar arquivos: ${listError.message}`);
    }

    if (!files || files.length === 0) {
      console.log('Nenhum arquivo encontrado para limpeza');
      return new Response(JSON.stringify({
        sucesso: true,
        mensagem: 'Nenhum arquivo encontrado para limpeza',
        arquivos_removidos: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Filtrar arquivos relacionados ao treinamento e mais antigos que 7 dias
    const arquivosParaRemover = files.filter(file => {
      const fileDate = new Date(file.created_at);
      const isTrainingFile = file.name.includes('treinamento-ia') || 
                           file.name.includes('temp') ||
                           file.name.startsWith('treinamento');
      const isOld = fileDate < sevenDaysAgo;
      
      return isTrainingFile && isOld;
    });

    console.log(`Encontrados ${arquivosParaRemover.length} arquivos para remoção`);

    let removedCount = 0;
    const errors: string[] = [];

    // Remover arquivos em lotes
    for (const file of arquivosParaRemover) {
      try {
        const filePath = `documentos/${file.name}`;
        console.log(`Removendo arquivo: ${filePath}`);
        
        const { error: deleteError } = await supabase.storage
          .from('documentos-propostas')
          .remove([filePath]);

        if (deleteError) {
          console.error(`Erro ao remover ${filePath}:`, deleteError);
          errors.push(`${filePath}: ${deleteError.message}`);
        } else {
          removedCount++;
          console.log(`Arquivo removido com sucesso: ${filePath}`);
        }
      } catch (error) {
        console.error(`Erro ao processar arquivo ${file.name}:`, error);
        errors.push(`${file.name}: ${error.message}`);
      }
    }

    console.log(`Limpeza concluída. Arquivos removidos: ${removedCount}`);
    
    return new Response(JSON.stringify({
      sucesso: true,
      mensagem: 'Limpeza de arquivos concluída',
      arquivos_removidos: removedCount,
      arquivos_totais: files.length,
      erros: errors.length > 0 ? errors : null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na limpeza:', error);
    return new Response(JSON.stringify({
      sucesso: false,
      erro: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});