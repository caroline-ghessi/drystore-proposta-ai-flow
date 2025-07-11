import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type StatusProposta = 'processando' | 'enviada' | 'visualizada' | 'aceita' | 'expirada';
export type TipoProposta = 'energia-solar' | 'telhas' | 'divisorias' | 'pisos' | 'forros' | 'materiais-construcao';

export interface Proposta {
  id: string;
  cliente_nome: string;
  cliente_email: string;
  cliente_whatsapp?: string;
  cliente_endereco?: string;
  vendedor_id?: string;
  tipo_proposta: TipoProposta;
  status: StatusProposta;
  arquivo_original?: string;
  dados_extraidos?: any;
  valor_total?: number;
  forma_pagamento?: string;
  observacoes?: string;
  url_unica: string;
  data_criacao: string;
  data_vencimento?: string;
  data_visualizacao?: string;
  data_aceitacao?: string;
  created_at: string;
  updated_at: string;
}

export interface CriarPropostaData {
  cliente_nome: string;
  cliente_email: string;
  cliente_whatsapp?: string;
  cliente_endereco?: string;
  vendedor_id?: string;
  tipo_proposta: TipoProposta;
  dados_extraidos: any;
  valor_total: number;
  forma_pagamento?: string;
  observacoes?: string;
  arquivo_original?: string;
}

export function usePropostas() {
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPropostas = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('propostas')
        .select(`
          *,
          vendedores (nome, email)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setPropostas(data || []);
    } catch (err: any) {
      const errorMessage = 'Erro ao carregar propostas';
      setError(errorMessage);
      console.error('Erro ao buscar propostas:', err);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const criarProposta = async (dados: CriarPropostaData): Promise<Proposta | null> => {
    try {
      console.log('Criando proposta:', dados);

      const { data, error } = await supabase.functions.invoke('criar-proposta', {
        body: dados
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Proposta criada com sucesso!",
      });

      // Atualizar lista de propostas
      await fetchPropostas();

      return data as Proposta;
    } catch (err: any) {
      const errorMessage = 'Erro ao criar proposta';
      console.error('Erro ao criar proposta:', err);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const atualizarProposta = async (id: string, dados: Partial<Proposta>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('propostas')
        .update(dados)
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Proposta atualizada com sucesso!",
      });

      // Atualizar lista de propostas
      await fetchPropostas();

      return true;
    } catch (err: any) {
      const errorMessage = 'Erro ao atualizar proposta';
      console.error('Erro ao atualizar proposta:', err);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const buscarPropostaPorUrl = async (urlUnica: string): Promise<Proposta | null> => {
    try {
      const { data, error } = await supabase
        .from('propostas')
        .select(`
          *,
          vendedores (nome, email, whatsapp)
        `)
        .eq('url_unica', urlUnica)
        .single();

      if (error) {
        throw error;
      }

      return data as Proposta;
    } catch (err: any) {
      console.error('Erro ao buscar proposta por URL:', err);
      return null;
    }
  };

  const registrarVisualizacao = async (urlUnica: string, dadosExtras?: any): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('registrar-visualizacao', {
        body: {
          url_unica: urlUnica,
          dados_extras: dadosExtras
        }
      });

      if (error) {
        throw error;
      }

      console.log('Visualização registrada:', data);
      return true;
    } catch (err: any) {
      console.error('Erro ao registrar visualização:', err);
      return false;
    }
  };

  const aceitarProposta = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('propostas')
        .update({ 
          status: 'aceita',
          data_aceitacao: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Criar notificação de aceitação
      await supabase
        .from('notificacoes')
        .insert({
          proposta_id: id,
          tipo: 'aceitacao',
          mensagem: 'Proposta aceita pelo cliente'
        });

      toast({
        title: "Sucesso",
        description: "Proposta aceita com sucesso!",
      });

      return true;
    } catch (err: any) {
      const errorMessage = 'Erro ao aceitar proposta';
      console.error('Erro ao aceitar proposta:', err);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchPropostas();
  }, []);

  return {
    propostas,
    loading,
    error,
    fetchPropostas,
    criarProposta,
    atualizarProposta,
    buscarPropostaPorUrl,
    registrarVisualizacao,
    aceitarProposta
  };
}