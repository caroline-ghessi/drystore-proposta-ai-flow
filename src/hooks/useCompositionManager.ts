
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ItemComposicao {
  id: string;
  composicao_id: string;
  produto_id: string;
  consumo_por_m2: number;
  quebra_aplicada: number;
  fator_correcao: number;
  valor_unitario: number;
  valor_por_m2: number;
  ordem: number;
  produtos_mestre?: {
    id: string;
    codigo: string;
    descricao: string;
    preco_unitario: number;
    quantidade_embalagem: number;
    unidade_medida: string;
  };
}

export interface NovoItemComposicao {
  produto_id: string;
  consumo_por_m2: number;
  quebra_aplicada: number;
  fator_correcao: number;
  ordem: number;
}

export const useCompositionManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchItensComposicao = async (composicaoId: string): Promise<ItemComposicao[]> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('itens_composicao')
        .select(`
          *,
          produtos_mestre:produto_id (
            id,
            codigo,
            descricao,
            preco_unitario,
            quantidade_embalagem,
            unidade_medida
          )
        `)
        .eq('composicao_id', composicaoId)
        .order('ordem');

      if (error) throw error;
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar itens';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const adicionarItem = async (composicaoId: string, novoItem: NovoItemComposicao): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Buscar dados do produto para calcular valores
      const { data: produto, error: produtoError } = await supabase
        .from('produtos_mestre')
        .select('preco_unitario, quantidade_embalagem')
        .eq('id', novoItem.produto_id)
        .single();

      if (produtoError) throw produtoError;

      // Calcular valores
      const valor_unitario = produto.preco_unitario / produto.quantidade_embalagem;
      const valor_por_m2 = novoItem.consumo_por_m2 * valor_unitario * (1 + novoItem.quebra_aplicada / 100) * novoItem.fator_correcao;

      const { error } = await supabase
        .from('itens_composicao')
        .insert([{
          composicao_id: composicaoId,
          produto_id: novoItem.produto_id,
          consumo_por_m2: novoItem.consumo_por_m2,
          quebra_aplicada: novoItem.quebra_aplicada,
          fator_correcao: novoItem.fator_correcao,
          valor_unitario,
          valor_por_m2,
          ordem: novoItem.ordem
        }]);

      if (error) throw error;

      // Recalcular composição
      await recalcularComposicao(composicaoId);

      toast({
        title: "Sucesso",
        description: "Item adicionado com sucesso"
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar item';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const editarItem = async (itemId: string, dadosAtualizados: Partial<NovoItemComposicao>): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Buscar item atual
      const { data: itemAtual, error: itemError } = await supabase
        .from('itens_composicao')
        .select('*, produtos_mestre:produto_id(preco_unitario, quantidade_embalagem)')
        .eq('id', itemId)
        .single();

      if (itemError) throw itemError;

      const produto = itemAtual.produtos_mestre;
      const consumo = dadosAtualizados.consumo_por_m2 ?? itemAtual.consumo_por_m2;
      const quebra = dadosAtualizados.quebra_aplicada ?? itemAtual.quebra_aplicada;
      const fator = dadosAtualizados.fator_correcao ?? itemAtual.fator_correcao;

      // Recalcular valores
      const valor_unitario = produto.preco_unitario / produto.quantidade_embalagem;
      const valor_por_m2 = consumo * valor_unitario * (1 + quebra / 100) * fator;

      const { error } = await supabase
        .from('itens_composicao')
        .update({
          ...dadosAtualizados,
          valor_unitario,
          valor_por_m2
        })
        .eq('id', itemId);

      if (error) throw error;

      // Recalcular composição
      await recalcularComposicao(itemAtual.composicao_id);

      toast({
        title: "Sucesso",
        description: "Item atualizado com sucesso"
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao editar item';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removerItem = async (itemId: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Buscar composição_id antes de deletar
      const { data: item, error: itemError } = await supabase
        .from('itens_composicao')
        .select('composicao_id')
        .eq('id', itemId)
        .single();

      if (itemError) throw itemError;

      const { error } = await supabase
        .from('itens_composicao')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      // Recalcular composição
      await recalcularComposicao(item.composicao_id);

      toast({
        title: "Sucesso",
        description: "Item removido com sucesso"
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover item';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const reordenarItens = async (composicaoId: string, itens: { id: string; ordem: number }[]): Promise<boolean> => {
    try {
      setIsLoading(true);

      for (const item of itens) {
        const { error } = await supabase
          .from('itens_composicao')
          .update({ ordem: item.ordem })
          .eq('id', item.id);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Ordem dos itens atualizada"
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao reordenar itens';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const recalcularComposicao = async (composicaoId: string): Promise<number> => {
    try {
      const { data, error } = await supabase.rpc('recalcular_composicao', {
        p_composicao_id: composicaoId
      });

      if (error) throw error;
      return data || 0;
    } catch (err) {
      console.error('Erro ao recalcular composição:', err);
      return 0;
    }
  };

  const calcularPreviewItem = (
    consumo: number,
    precoUnitario: number,
    quantidadeEmbalagem: number,
    quebra: number,
    fator: number
  ): { valor_unitario: number; valor_por_m2: number } => {
    const valor_unitario = precoUnitario / quantidadeEmbalagem;
    const valor_por_m2 = consumo * valor_unitario * (1 + quebra / 100) * fator;
    return { valor_unitario, valor_por_m2 };
  };

  return {
    fetchItensComposicao,
    adicionarItem,
    editarItem,
    removerItem,
    reordenarItens,
    recalcularComposicao,
    calcularPreviewItem,
    isLoading,
    error
  };
};
