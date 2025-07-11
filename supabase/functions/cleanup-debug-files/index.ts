import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Iniciando limpeza de arquivos debug...');

    // Listar todos os arquivos no bucket
    const { data: files, error: listError } = await supabase.storage
      .from('documentos-propostas')
      .list('documentos');

    if (listError) {
      throw new Error(`Erro ao listar arquivos: ${listError.message}`);
    }

    if (!files || files.length === 0) {
      console.log('Nenhum arquivo encontrado para verificação');
      return new Response(
        JSON.stringify({ 
          success: true, 
          deletedCount: 0,
          message: 'Nenhum arquivo encontrado' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Filtrar arquivos de debug/test mais antigos que 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const debugFilesToDelete = files.filter(file => {
      // Verificar se é arquivo de debug/test pelo nome
      const isDebugFile = file.name.startsWith('debug_') || 
                          file.name.startsWith('test_') ||
                          file.name.includes('_debug_') ||
                          file.name.includes('_test_');
      
      if (!isDebugFile) {
        return false;
      }

      // Verificar se é mais antigo que 7 dias
      const fileDate = new Date(file.created_at || file.updated_at || '');
      return fileDate < sevenDaysAgo;
    });

    console.log(`Encontrados ${debugFilesToDelete.length} arquivos debug para remoção`);

    if (debugFilesToDelete.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          deletedCount: 0,
          message: 'Nenhum arquivo debug antigo encontrado' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Remover arquivos em lotes
    const filePaths = debugFilesToDelete.map(file => `documentos/${file.name}`);
    
    console.log('Removendo arquivos:', filePaths);

    const { error: deleteError } = await supabase.storage
      .from('documentos-propostas')
      .remove(filePaths);

    if (deleteError) {
      throw new Error(`Erro ao deletar arquivos: ${deleteError.message}`);
    }

    console.log(`Limpeza concluída: ${filePaths.length} arquivos removidos`);

    // Log da operação no banco (opcional)
    try {
      await supabase.from('notificacoes').insert({
        tipo: 'contato',
        mensagem: `Limpeza automática executada: ${filePaths.length} arquivos debug removidos`,
        dados_extras: {
          deletedFiles: filePaths,
          executedAt: new Date().toISOString(),
          type: 'cleanup'
        }
      });
    } catch (logError) {
      console.warn('Erro ao registrar log da limpeza:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        deletedCount: filePaths.length,
        deletedFiles: filePaths,
        message: `${filePaths.length} arquivos debug removidos com sucesso`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Erro na limpeza de arquivos debug:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});