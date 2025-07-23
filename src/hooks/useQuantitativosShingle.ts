import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ItemQuantitativo } from '@/components/wizard/PlanilhaQuantitativos';

interface DadosCalculoShingle {
  area_telhado: number;
  comprimento_cumeeira?: number;
  comprimento_espigao?: number;
  comprimento_agua_furtada?: number;
  perimetro_telhado?: number;
  telha_codigo?: string;
  cor_acessorios?: string;
  incluir_manta?: boolean;
}

export function useQuantitativosShingle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const calcularQuantitativosComerciais = async (
    dados: DadosCalculoShingle
  ): Promise<ItemQuantitativo[] | null> => {
    console.log('🔄 [useQuantitativosShingle] Iniciando cálculo de quantitativos comerciais');
    console.log('📊 [useQuantitativosShingle] Dados de entrada:', JSON.stringify(dados, null, 2));
    
    try {
      setLoading(true);
      setError(null);

      // Validação prévia dos dados essenciais
      if (!dados?.area_telhado || dados.area_telhado <= 0) {
        const errorMsg = 'Área do telhado é obrigatória e deve ser maior que zero';
        console.error('❌ [useQuantitativosShingle] Validação falhou:', errorMsg);
        throw new Error(errorMsg);
      }

      // CORREÇÃO: Sempre usar 'telhas-shingle' como tipo de proposta
      const tipoProposta = 'telhas-shingle';

      // Construir dados extras com valores padrão seguros e logs detalhados
      const dadosExtras = {
        area_telhado: dados.area_telhado,
        perimetro_telhado: dados.perimetro_telhado || 0,
        comprimento_cumeeira: dados.comprimento_cumeeira || 0,
        comprimento_espigao: dados.comprimento_espigao || 0,
        comprimento_agua_furtada: dados.comprimento_agua_furtada || 0,
        telha_codigo: dados.telha_codigo || '1.16',
        cor_acessorios: dados.cor_acessorios || 'CINZA',
        incluir_manta: dados.incluir_manta || false
      };

      console.log('🏗️ [useQuantitativosShingle] Dados extras preparados:', JSON.stringify(dadosExtras, null, 2));
      console.log(`📋 [useQuantitativosShingle] Tipo de proposta final: ${tipoProposta}`);
      console.log(`📐 [useQuantitativosShingle] Área base: ${dados.area_telhado}m²`);
      
      console.log('🚀 [useQuantitativosShingle] Chamando função calcular_por_mapeamento...');

      // Chamar função de cálculo por mapeamento com dados extras estruturados
      const { data: resultadoMapeamento, error: dbError } = await supabase.rpc('calcular_por_mapeamento', {
        p_tipo_proposta: tipoProposta,
        p_area_base: dados.area_telhado,
        p_dados_extras: dadosExtras
      });

      if (dbError) {
        console.error('💥 [useQuantitativosShingle] Erro na função RPC:', dbError);
        throw new Error(`Erro no cálculo: ${dbError.message}`);
      }

      console.log('📦 [useQuantitativosShingle] Resultados brutos recebidos:', resultadoMapeamento);
      console.log(`📊 [useQuantitativosShingle] Número de itens retornados: ${resultadoMapeamento?.length || 0}`);

      if (!resultadoMapeamento || resultadoMapeamento.length === 0) {
        console.warn('⚠️ [useQuantitativosShingle] Nenhum resultado retornado');
        throw new Error('Nenhum item foi calculado. Verifique se existem produtos configurados para telhas shingle.');
      }

      // Buscar informações de embalagem dos produtos
      const codigosProdutos = [...new Set(resultadoMapeamento.map((item: any) => item.item_codigo))];
      
      const { data: produtoInfo, error: produtoError } = await supabase
        .from('produtos_mestre')
        .select('codigo, quantidade_embalagem, unidade_medida')
        .in('codigo', codigosProdutos);

      if (produtoError) {
        console.error('Erro ao buscar informações dos produtos:', produtoError);
        throw produtoError;
      }

      // Criar mapa de informações de produto
      const infoProdutos = produtoInfo?.reduce((acc: any, prod: any) => {
        acc[prod.codigo] = prod;
        return acc;
      }, {}) || {};

      // Processar resultados e calcular quantidades comerciais
      const itensQuantitativos: ItemQuantitativo[] = resultadoMapeamento.map((item: any, index: number) => {
        const infoProduto = infoProdutos[item.item_codigo] || {};
        const quantidadeEmbalagem = infoProduto.quantidade_embalagem || 1;
        const unidadeVenda = determinarUnidadeVenda(item.categoria, infoProduto.unidade_medida);
        
        // Calcular quantidade de embalagens necessárias
        const quantidadeEmbalagens = Math.ceil(item.quantidade_com_quebra / quantidadeEmbalagem);
        
        // Calcular quebra percentual
        const quebraPercentual = item.quantidade_liquida > 0 
          ? ((item.quantidade_com_quebra - item.quantidade_liquida) / item.quantidade_liquida) * 100 
          : 0;

        return {
          codigo: item.item_codigo,
          descricao: item.item_descricao,
          categoria: item.categoria,
          quantidade_liquida: parseFloat(item.quantidade_liquida.toFixed(2)),
          quebra_percentual: parseFloat(quebraPercentual.toFixed(1)),
          quantidade_com_quebra: parseFloat(item.quantidade_com_quebra.toFixed(2)),
          unidade_venda: unidadeVenda,
          quantidade_embalagens: quantidadeEmbalagens,
          preco_unitario: parseFloat(item.preco_unitario.toFixed(2)),
          valor_total: parseFloat(item.valor_total.toFixed(2)),
          ordem: item.ordem_calculo || index + 1
        };
      });

      // Ordenar por categoria e ordem
      itensQuantitativos.sort((a, b) => {
        if (a.categoria !== b.categoria) {
          return a.categoria.localeCompare(b.categoria);
        }
        return a.ordem - b.ordem;
      });

      console.log('Quantitativos calculados com sucesso:', itensQuantitativos);
      
      if (itensQuantitativos.length === 0) {
        throw new Error('Nenhum item foi processado corretamente');
      }

      return itensQuantitativos;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao calcular quantitativos';
      setError(errorMessage);
      console.error('Erro ao calcular quantitativos:', err);
      
      toast({
        title: "Erro no Cálculo",
        description: errorMessage,
        variant: "destructive"
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  const processarQuantitativosProposta = (dadosExtraidos: any): ItemQuantitativo[] => {
    try {
      console.log('Processando quantitativos da proposta:', dadosExtraidos);

      // Verificar se temos os dados necessários
      if (!dadosExtraidos?.orcamento_completo?.itens) {
        console.warn('Dados de orçamento não encontrados');
        return [];
      }

      const itens = dadosExtraidos.orcamento_completo.itens;
      
      // Converter dados para formato ItemQuantitativo
      const itensProcessados: ItemQuantitativo[] = itens.map((item: any, index: number) => {
        // Calcular quantidade líquida (antes da quebra)
        const quantidadeLiquida = item.quantidade_calculada || 0;
        
        // Calcular quebra percentual
        const quebraPercentual = item.quebra_aplicada || 0;
        
        // Quantidade com quebra
        const quantidadeComQuebra = item.quantidade_final || quantidadeLiquida;
        
        // Determinar unidade de venda baseada no tipo
        const unidadeVenda = determinarUnidadeVenda(item.tipo_componente || '', item.unidade_dimensao);
        
        // Quantidade de embalagens (usar quantidade_arredondada se disponível)
        const quantidadeEmbalagens = item.quantidade_arredondada || Math.ceil(quantidadeComQuebra);

        return {
          codigo: item.produto_codigo || `ITEM-${index + 1}`,
          descricao: item.descricao || 'Produto não identificado',
          categoria: mapearCategoria(item.tipo_componente || ''),
          quantidade_liquida: parseFloat(quantidadeLiquida.toFixed(2)),
          quebra_percentual: parseFloat(quebraPercentual.toFixed(1)),
          quantidade_com_quebra: parseFloat(quantidadeComQuebra.toFixed(2)),
          unidade_venda: unidadeVenda,
          quantidade_embalagens: quantidadeEmbalagens,
          preco_unitario: parseFloat((item.preco_unitario || 0).toFixed(2)),
          valor_total: parseFloat((item.valor_total || 0).toFixed(2)),
          ordem: index + 1
        };
      });

      // Ordenar por categoria e código
      itensProcessados.sort((a, b) => {
        if (a.categoria !== b.categoria) {
          return a.categoria.localeCompare(b.categoria);
        }
        return a.codigo.localeCompare(b.codigo);
      });

      console.log('Quantitativos processados:', itensProcessados);
      return itensProcessados;

    } catch (error) {
      console.error('Erro ao processar quantitativos da proposta:', error);
      return [];
    }
  };

  const mapearCategoria = (tipoComponente: string): string => {
    const mapeamento: Record<string, string> = {
      'TELHA_SHINGLE': 'TELHAS_SHINGLE',
      'STARTER': 'STARTER_SHINGLE',
      'CUMEEIRA': 'ACESSORIOS_SHINGLE',
      'OSB': 'PLACAS_OSB',
      'SUBCOBERTURA': 'SUBCOBERTURA',
      'FIXACAO': 'FIXACAO',
      'ACESSORIO': 'ACESSORIOS_SHINGLE'
    };

    return mapeamento[tipoComponente.toUpperCase()] || 'OUTROS';
  };

  const determinarUnidadeVenda = (categoria: string, unidadeMedida?: string): string => {
    // Mapeamento de categorias para unidades de venda
    const unidadesPorCategoria: Record<string, string> = {
      'TELHAS_SHINGLE': 'Pacote',
      'PLACAS_OSB': 'Placa',
      'SUBCOBERTURA': 'Rolo',
      'STARTER_SHINGLE': 'Pacote',
      'ACESSORIOS_SHINGLE': 'Peça',
      'FIXACAO': 'Caixa',
      'VEDACAO': 'Tubo'
    };

    return unidadesPorCategoria[categoria] || unidadeMedida || 'Un';
  };

  const validarQuantitativos = (itens: ItemQuantitativo[]): string[] => {
    const alertas: string[] = [];

    // Verificar itens com quebra muito alta
    const itensQuebraAlta = itens.filter(item => item.quebra_percentual > 20);
    if (itensQuebraAlta.length > 0) {
      alertas.push(`${itensQuebraAlta.length} itens com quebra superior a 20%`);
    }

    // Verificar se há itens sem quantidade
    const itensSemQuantidade = itens.filter(item => item.quantidade_embalagens === 0);
    if (itensSemQuantidade.length > 0) {
      alertas.push(`${itensSemQuantidade.length} itens com quantidade zero`);
    }

    // Verificar se há preços zerados
    const itensPrecoZero = itens.filter(item => item.preco_unitario === 0);
    if (itensPrecoZero.length > 0) {
      alertas.push(`${itensPrecoZero.length} itens com preço zerado`);
    }

    return alertas;
  };

  return {
    loading,
    error,
    calcularQuantitativosComerciais,
    processarQuantitativosProposta,
    validarQuantitativos,
    clearError: () => setError(null)
  };
}
