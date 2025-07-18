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
  tipo_calculo?: string;
  formula_customizada?: string;
  observacoes_calculo?: string;
  // Dados do produto
  produto_codigo?: string;
  produto_descricao?: string;
  produto_preco?: number;
  produto_unidade?: string;
  produto_categoria?: string;
  produto_quantidade_embalagem?: number;
}

export interface NovoItemComposicao {
  produto_id: string;
  consumo_por_m2: number;
  quebra_aplicada?: number;
  fator_correcao?: number;
  ordem?: number;
  tipo_calculo?: string;
  formula_customizada?: string;
  observacoes_calculo?: string;
}

export const useCompositionManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchItensComposicao = async (composicaoId: string): Promise<ItemComposicao[]> => {
    try {
      const { data, error } = await supabase
        .from('itens_composicao')
        .select(`
          *,
          produtos_mestre (
            codigo,
            descricao,
            preco_unitario,
            unidade_medida,
            categoria,
            quantidade_embalagem
          )
        `)
        .eq('composicao_id', composicaoId)
        .order('ordem');

      if (error) throw error;

      return data?.map(item => ({
        id: item.id,
        composicao_id: item.composicao_id,
        produto_id: item.produto_id,
        consumo_por_m2: item.consumo_por_m2,
        quebra_aplicada: item.quebra_aplicada,
        fator_correcao: item.fator_correcao,
        valor_unitario: item.valor_unitario,
        valor_por_m2: item.valor_por_m2,
        ordem: item.ordem,
        tipo_calculo: item.tipo_calculo || 'direto',
        formula_customizada: item.formula_customizada,
        observacoes_calculo: item.observacoes_calculo,
        produto_codigo: item.produtos_mestre?.codigo,
        produto_descricao: item.produtos_mestre?.descricao,
        produto_preco: item.produtos_mestre?.preco_unitario,
        produto_unidade: item.produtos_mestre?.unidade_medida,
        produto_categoria: item.produtos_mestre?.categoria,
        produto_quantidade_embalagem: item.produtos_mestre?.quantidade_embalagem,
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar itens da composição:', error);
      toast({ title: "Erro", description: "Erro ao carregar itens da composição", variant: "destructive" });
      return [];
    }
  };

  const adicionarItem = async (composicaoId: string, novoItem: NovoItemComposicao): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Buscar dados do produto
      const { data: produtoData, error: produtoError } = await supabase
        .from('produtos_mestre')
        .select('preco_unitario, quantidade_embalagem')
        .eq('id', novoItem.produto_id)
        .single();

      if (produtoError) throw produtoError;

      // Buscar maior ordem atual
      const { data: maxOrdemData } = await supabase
        .from('itens_composicao')
        .select('ordem')
        .eq('composicao_id', composicaoId)
        .order('ordem', { ascending: false })
        .limit(1);

      const maxOrdem = maxOrdemData?.[0]?.ordem || 0;

      // Calcular valores baseados no tipo de cálculo
      const tipoCalculo = novoItem.tipo_calculo || 'direto';
      const quebra = (novoItem.quebra_aplicada || 5) / 100;
      const fator = novoItem.fator_correcao || 1;
      
      let valorUnitario: number;
      let valorPorM2: number;

      if (tipoCalculo === 'rendimento') {
        // Para produtos com rendimento (ex: Shingle)
        valorUnitario = produtoData.preco_unitario / (produtoData.quantidade_embalagem || 1);
        valorPorM2 = (produtoData.preco_unitario / (produtoData.quantidade_embalagem || 1)) * (1 + quebra) * fator;
      } else if (tipoCalculo === 'customizado' && novoItem.formula_customizada) {
        // Para fórmulas customizadas
        valorUnitario = produtoData.quantidade_embalagem > 0 
          ? produtoData.preco_unitario / produtoData.quantidade_embalagem
          : produtoData.preco_unitario;
        valorPorM2 = calcularFormulaCustomizada(novoItem.formula_customizada, {
          preco: produtoData.preco_unitario,
          consumo: novoItem.consumo_por_m2,
          quebra: quebra * 100,
          fator: fator,
          rendimento: produtoData.quantidade_embalagem || 1
        });
      } else {
        // Cálculo direto tradicional
        valorUnitario = produtoData.quantidade_embalagem > 0 
          ? produtoData.preco_unitario / produtoData.quantidade_embalagem
          : produtoData.preco_unitario;
        valorPorM2 = novoItem.consumo_por_m2 * valorUnitario * (1 + quebra) * fator;
      }

      const { error } = await supabase
        .from('itens_composicao')
        .insert({
          composicao_id: composicaoId,
          produto_id: novoItem.produto_id,
          consumo_por_m2: novoItem.consumo_por_m2,
          quebra_aplicada: novoItem.quebra_aplicada || 5,
          fator_correcao: novoItem.fator_correcao || 1,
          valor_unitario: valorUnitario,
          valor_por_m2: valorPorM2,
          ordem: novoItem.ordem || maxOrdem + 1,
          tipo_calculo: tipoCalculo,
          formula_customizada: novoItem.formula_customizada,
          observacoes_calculo: novoItem.observacoes_calculo
        });

      if (error) throw error;

      // Recalcular composição
      await recalcularComposicao(composicaoId);

      toast({ title: "Sucesso", description: "Item adicionado com sucesso!" });
      return true;
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast({ title: "Erro", description: "Erro ao adicionar item à composição", variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const editarItem = async (itemId: string, dadosAtualizados: Partial<NovoItemComposicao>): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Buscar item atual com dados do produto
      const { data: itemAtual, error: itemError } = await supabase
        .from('itens_composicao')
        .select(`
          *,
          produtos_mestre (
            preco_unitario,
            quantidade_embalagem
          )
        `)
        .eq('id', itemId)
        .single();

      if (itemError) throw itemError;

      const produto = itemAtual.produtos_mestre;
      const consumo = dadosAtualizados.consumo_por_m2 ?? itemAtual.consumo_por_m2;
      const quebra = (dadosAtualizados.quebra_aplicada ?? itemAtual.quebra_aplicada) / 100;
      const fator = dadosAtualizados.fator_correcao ?? itemAtual.fator_correcao;
      const tipoCalculo = dadosAtualizados.tipo_calculo ?? itemAtual.tipo_calculo ?? 'direto';

      // Calcular valores baseados no tipo de cálculo
      let valorUnitario: number;
      let valorPorM2: number;

      if (tipoCalculo === 'rendimento') {
        valorUnitario = produto.preco_unitario / (produto.quantidade_embalagem || 1);
        valorPorM2 = (produto.preco_unitario / (produto.quantidade_embalagem || 1)) * (1 + quebra) * fator;
      } else if (tipoCalculo === 'customizado' && dadosAtualizados.formula_customizada) {
        valorUnitario = produto.quantidade_embalagem > 0 
          ? produto.preco_unitario / produto.quantidade_embalagem
          : produto.preco_unitario;
        valorPorM2 = calcularFormulaCustomizada(dadosAtualizados.formula_customizada, {
          preco: produto.preco_unitario,
          consumo: consumo,
          quebra: quebra * 100,
          fator: fator,
          rendimento: produto.quantidade_embalagem || 1
        });
      } else {
        valorUnitario = produto.quantidade_embalagem > 0 
          ? produto.preco_unitario / produto.quantidade_embalagem
          : produto.preco_unitario;
        valorPorM2 = consumo * valorUnitario * (1 + quebra) * fator;
      }

      const { error } = await supabase
        .from('itens_composicao')
        .update({
          ...dadosAtualizados,
          valor_unitario: valorUnitario,
          valor_por_m2: valorPorM2
        })
        .eq('id', itemId);

      if (error) throw error;

      // Recalcular composição
      await recalcularComposicao(itemAtual.composicao_id);

      toast({ title: "Sucesso", description: "Item atualizado com sucesso!" });
      return true;
    } catch (error) {
      console.error('Erro ao editar item:', error);
      toast({ title: "Erro", description: "Erro ao atualizar item da composição", variant: "destructive" });
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

      toast({ title: "Sucesso", description: "Item removido com sucesso!" });
      return true;
    } catch (error) {
      console.error('Erro ao remover item:', error);
      toast({ title: "Erro", description: "Erro ao remover item da composição", variant: "destructive" });
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

      toast({ title: "Sucesso", description: "Ordem dos itens atualizada com sucesso!" });
      return true;
    } catch (error) {
      console.error('Erro ao reordenar itens:', error);
      toast({ title: "Erro", description: "Erro ao reordenar itens da composição", variant: "destructive" });
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
    } catch (error) {
      console.error('Erro ao recalcular composição:', error);
      return 0;
    }
  };

  const calcularPreviewItem = (
    consumo: number, 
    precoUnitario: number, 
    quantidadeEmbalagem: number, 
    quebra: number, 
    fator: number,
    tipoCalculo: string = 'direto',
    formulaCustomizada?: string
  ) => {
    let valor_unitario: number;
    let valor_por_m2: number;
    
    if (tipoCalculo === 'rendimento') {
      valor_unitario = precoUnitario / (quantidadeEmbalagem || 1);
      valor_por_m2 = (precoUnitario / (quantidadeEmbalagem || 1)) * (1 + quebra / 100) * fator;
    } else if (tipoCalculo === 'customizado' && formulaCustomizada) {
      valor_unitario = quantidadeEmbalagem > 0 ? precoUnitario / quantidadeEmbalagem : precoUnitario;
      valor_por_m2 = calcularFormulaCustomizada(formulaCustomizada, {
        preco: precoUnitario,
        consumo: consumo,
        quebra: quebra,
        fator: fator,
        rendimento: quantidadeEmbalagem || 1
      });
    } else {
      valor_unitario = quantidadeEmbalagem > 0 ? precoUnitario / quantidadeEmbalagem : precoUnitario;
      valor_por_m2 = consumo * valor_unitario * (1 + quebra / 100) * fator;
    }
    
    return {
      valor_unitario: Number(valor_unitario.toFixed(2)),
      valor_por_m2: Number(valor_por_m2.toFixed(2))
    };
  };

  const calcularFormulaCustomizada = (formula: string, variaveis: any): number => {
    try {
      let formulaProcessada = formula;
      
      // Substituir variáveis na fórmula
      Object.keys(variaveis).forEach(key => {
        const regex = new RegExp(`\\{${key}\\}`, 'g');
        formulaProcessada = formulaProcessada.replace(regex, variaveis[key].toString());
      });
      
      // Avaliar a fórmula (usar Function é mais seguro que eval)
      const resultado = Function(`"use strict"; return (${formulaProcessada})`)();
      return Number(resultado.toFixed(2));
    } catch (error) {
      console.error('Erro ao calcular fórmula customizada:', error);
      return 0;
    }
  };

  const atualizarValoresComposicao = async (composicaoId: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Buscar todos os itens da composição com dados atuais dos produtos
      const { data: itens, error: itensError } = await supabase
        .from('itens_composicao')
        .select(`
          *,
          produtos_mestre (
            preco_unitario,
            quantidade_embalagem
          )
        `)
        .eq('composicao_id', composicaoId);

      if (itensError) throw itensError;

      let itensAtualizados = 0;

      // Atualizar cada item com preços atuais
      for (const item of itens || []) {
        const produto = item.produtos_mestre;
        if (!produto) continue;

        // Calcular novos valores baseados no tipo de cálculo
        const tipoCalculo = item.tipo_calculo || 'direto';
        const quebra = item.quebra_aplicada / 100;
        
        let novoValorUnitario: number;
        let novoValorPorM2: number;

        if (tipoCalculo === 'rendimento') {
          novoValorUnitario = produto.preco_unitario / (produto.quantidade_embalagem || 1);
          novoValorPorM2 = (produto.preco_unitario / (produto.quantidade_embalagem || 1)) * (1 + quebra) * item.fator_correcao;
        } else if (tipoCalculo === 'customizado' && item.formula_customizada) {
          novoValorUnitario = produto.quantidade_embalagem > 0 
            ? produto.preco_unitario / produto.quantidade_embalagem
            : produto.preco_unitario;
          novoValorPorM2 = calcularFormulaCustomizada(item.formula_customizada, {
            preco: produto.preco_unitario,
            consumo: item.consumo_por_m2,
            quebra: item.quebra_aplicada,
            fator: item.fator_correcao,
            rendimento: produto.quantidade_embalagem || 1
          });
        } else {
          novoValorUnitario = produto.quantidade_embalagem > 0 
            ? produto.preco_unitario / produto.quantidade_embalagem
            : produto.preco_unitario;
          novoValorPorM2 = item.consumo_por_m2 * novoValorUnitario * (1 + quebra) * item.fator_correcao;
        }

        // Atualizar apenas se houve mudança significativa (diferença > R$ 0.01)
        if (Math.abs(novoValorUnitario - item.valor_unitario) > 0.01 || 
            Math.abs(novoValorPorM2 - item.valor_por_m2) > 0.01) {
          
          const { error: updateError } = await supabase
            .from('itens_composicao')
            .update({
              valor_unitario: novoValorUnitario,
              valor_por_m2: novoValorPorM2
            })
            .eq('id', item.id);

          if (updateError) throw updateError;
          itensAtualizados++;
        }
      }

      // Recalcular composição total
      await recalcularComposicao(composicaoId);

      toast({ title: "Valores Atualizados", description: `${itensAtualizados} itens foram atualizados com os preços atuais dos produtos` });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar valores:', error);
      toast({ title: "Erro", description: "Erro ao atualizar valores da composição", variant: "destructive" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchItensComposicao,
    adicionarItem,
    editarItem,
    removerItem,
    reordenarItens,
    calcularPreviewItem,
    recalcularComposicao,
    atualizarValoresComposicao,
    calcularFormulaCustomizada,
    isLoading,
    error
  };
};