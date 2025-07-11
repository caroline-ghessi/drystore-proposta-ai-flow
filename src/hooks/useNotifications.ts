import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Notificacao {
  id: string;
  proposta_id: string;
  tipo: 'visualizacao' | 'aceitacao' | 'contato' | 'vencimento';
  mensagem: string;
  lida: boolean;
  dados_extras?: any;
  created_at: string;
  propostas?: {
    cliente_nome: string;
    tipo_proposta: string;
    valor_total?: number;
  };
}

export function useNotifications() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchNotificacoes = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('notificacoes')
        .select(`
          *,
          propostas (
            cliente_nome,
            tipo_proposta,
            valor_total
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        throw fetchError;
      }

      setNotificacoes(data || []);
    } catch (err: any) {
      const errorMessage = 'Erro ao carregar notificações';
      setError(errorMessage);
      console.error('Erro ao buscar notificações:', err);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLida = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Atualizar localmente
      setNotificacoes(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, lida: true } : notif
        )
      );

      return true;
    } catch (err: any) {
      console.error('Erro ao marcar notificação como lida:', err);
      return false;
    }
  };

  const marcarTodasComoLidas = async (): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('lida', false);

      if (error) {
        throw error;
      }

      // Atualizar localmente
      setNotificacoes(prev => 
        prev.map(notif => ({ ...notif, lida: true }))
      );

      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas",
      });

      return true;
    } catch (err: any) {
      console.error('Erro ao marcar todas notificações como lidas:', err);
      toast({
        title: "Erro",
        description: "Erro ao marcar notificações como lidas",
        variant: "destructive",
      });
      return false;
    }
  };

  const criarNotificacao = async (
    propostaId: string,
    tipo: Notificacao['tipo'],
    mensagem: string,
    dadosExtras?: any
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .insert({
          proposta_id: propostaId,
          tipo,
          mensagem,
          dados_extras: dadosExtras
        });

      if (error) {
        throw error;
      }

      // Atualizar lista de notificações
      await fetchNotificacoes();

      return true;
    } catch (err: any) {
      console.error('Erro ao criar notificação:', err);
      return false;
    }
  };

  // Configurar realtime para novas notificações
  useEffect(() => {
    const channel = supabase
      .channel('notificacoes-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificacoes'
        },
        (payload) => {
          console.log('Nova notificação recebida:', payload);
          
          // Mostrar toast para nova notificação
          toast({
            title: "Nova Notificação",
            description: payload.new.mensagem,
          });

          // Atualizar lista
          fetchNotificacoes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  // Buscar notificações ao montar
  useEffect(() => {
    fetchNotificacoes();
  }, []);

  // Computed properties
  const notificacaoesNaoLidas = notificacoes.filter(n => !n.lida);
  const totalNaoLidas = notificacaoesNaoLidas.length;

  return {
    notificacoes,
    notificacaoesNaoLidas,
    totalNaoLidas,
    loading,
    error,
    fetchNotificacoes,
    marcarComoLida,
    marcarTodasComoLidas,
    criarNotificacao
  };
}