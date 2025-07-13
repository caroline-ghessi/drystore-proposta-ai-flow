import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useSolicitarContato() {
  const { toast } = useToast();

  const solicitarContato = useCallback(async (propostaId: string, mensagem?: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('solicitar-contato', {
        body: {
          proposta_id: propostaId,
          mensagem: mensagem
        }
      });

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erro ao solicitar contato');
      }

      toast({
        title: "Solicitação Enviada",
        description: "Sua solicitação de contato foi enviada! O vendedor entrará em contato em breve.",
      });

      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao solicitar contato';
      console.error('Erro ao solicitar contato:', err);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  return {
    solicitarContato
  };
}