import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ItemCalculoMapeamento {
  composicao_id: string;
  composicao_nome: string;
  composicao_codigo: string;
  categoria: string;
  item_id: string;
  item_codigo: string;
  item_descricao: string;
  consumo_por_m2: number;
  area_aplicacao: number;
  fator_aplicacao: number;
  quantidade_liquida: number;
  quantidade_com_quebra: number;
  preco_unitario: number;
  valor_total: number;
  ordem_calculo: number;
  obrigatorio: boolean;
}

export interface ResumoCalculoMapeamento {
  tipo_proposta: string;
  area_base: number;
  valor_total: number;
  valor_por_m2: number;
  total_itens: number;
  data_calculo: string;
}

export const useCalculoMapeamento = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const calcularPorMapeamento = async (
    tipoProposta: string,
    areaBase: number,
    dadosExtras: Record<string, any> = {}
  ): Promise<ItemCalculoMapeamento[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('calcular_por_mapeamento', {
        p_tipo_proposta: tipoProposta,
        p_area_base: areaBase,
        p_dados_extras: dadosExtras
      });

      if (error) {
        throw new Error(`Erro no cálculo: ${error.message}`);
      }

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido no cálculo';
      setError(errorMessage);
      toast({
        title: "Erro no Cálculo",
        description: errorMessage,
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const obterResumoOrcamento = async (
    tipoProposta: string,
    areaBase: number,
    dadosExtras: Record<string, any> = {}
  ): Promise<ResumoCalculoMapeamento | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('resumo_orcamento_mapeamento', {
        p_tipo_proposta: tipoProposta,
        p_area_base: areaBase,
        p_dados_extras: dadosExtras
      });

      if (error) {
        throw new Error(`Erro no resumo: ${error.message}`);
      }

      return data as unknown as ResumoCalculoMapeamento;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido no resumo';
      setError(errorMessage);
      toast({
        title: "Erro no Resumo",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const verificarMapeamentosDisponiveis = async (tipoProposta: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('tipo_proposta_composicoes')
        .select('id')
        .eq('tipo_proposta', tipoProposta)
        .eq('ativo', true)
        .limit(1);

      if (error) {
        console.error('Erro ao verificar mapeamentos:', error);
        return false;
      }

      return (data?.length || 0) > 0;
    } catch (err) {
      console.error('Erro ao verificar mapeamentos:', err);
      return false;
    }
  };

  return {
    calcularPorMapeamento,
    obterResumoOrcamento,
    verificarMapeamentosDisponiveis,
    isLoading,
    error
  };
};