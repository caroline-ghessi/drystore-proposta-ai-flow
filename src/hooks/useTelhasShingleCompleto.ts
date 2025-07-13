import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ProdutoShingleCompleto {
  id: string;
  tipo_componente: string;
  codigo: string;
  linha: string;
  descricao: string;
  cor?: string;
  unidade_medida: string;
  conteudo_unidade: number;
  quebra_padrao: number;
  preco_unitario: number;
  peso_unitario?: number;
  especificacoes_tecnicas?: any;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ItemCalculadoShingleCompleto {
  tipo_item: string;
  codigo: string;
  descricao: string;
  dimensao_base: number;
  unidade_dimensao: string;
  fator_conversao: number;
  quebra_percentual: number;
  quantidade_calculada: number;
  quantidade_final: number;
  unidade_venda: string;
  preco_unitario: number;
  valor_total: number;
  categoria: string;
  ordem: number;
}

export interface ResumoOrcamentoShingleCompleto {
  itens: ItemCalculadoShingleCompleto[];
  resumo_por_categoria: {
    [categoria: string]: {
      quantidade_itens: number;
      valor_total: number;
    };
  };
  valor_total_geral: number;
  valor_por_m2: number;
  area_telhado: number;
  economia_peso_vs_ceramica?: number;
  observacoes_tecnicas: string[];
}

export interface ParametrosCalculoShingle {
  area_telhado: number;
  comprimento_cumeeira?: number;
  perimetro_telhado?: number;
  comprimento_calha?: number;
  telha_codigo?: string;
  cor_acessorios?: string;
  incluir_manta?: boolean;
  incluir_calha?: boolean;
}

export function useTelhasShingleCompleto() {
  const [produtos, setProdutos] = useState<ProdutoShingleCompleto[]>([]);
  const [telhas, setTelhas] = useState<ProdutoShingleCompleto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar todos os produtos
  const buscarProdutos = async (tipo_componente?: string) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('produtos_shingle_novo')
        .select('*')
        .eq('ativo', true)
        .order('tipo_componente', { ascending: true })
        .order('descricao', { ascending: true });

      if (tipo_componente) {
        query = query.eq('tipo_componente', tipo_componente);
      }

      const { data, error: dbError } = await query;

      if (dbError) throw dbError;

      if (tipo_componente) {
        if (tipo_componente === 'TELHA') {
          setTelhas(data || []);
        }
      } else {
        setProdutos(data || []);
      }

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar produtos';
      setError(errorMessage);
      console.error('Erro ao buscar produtos:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Buscar apenas telhas
  const buscarTelhas = async (linha?: 'SUPREME' | 'DURATION') => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('produtos_shingle_novo')
        .select('*')
        .eq('tipo_componente', 'TELHA')
        .eq('ativo', true)
        .order('linha', { ascending: true })
        .order('descricao', { ascending: true });

      if (linha) {
        query = query.eq('linha', linha);
      }

      const { data, error: dbError } = await query;

      if (dbError) throw dbError;

      setTelhas(data || []);
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar telhas';
      setError(errorMessage);
      console.error('Erro ao buscar telhas:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Calcular orçamento completo
  const calcularOrcamentoShingleCompleto = async (
    parametros: ParametrosCalculoShingle
  ): Promise<ResumoOrcamentoShingleCompleto | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: dbError } = await supabase.rpc('calcular_orcamento_shingle_completo_v2', {
        p_area_telhado: parametros.area_telhado,
        p_comprimento_cumeeira: parametros.comprimento_cumeeira || 0,
        p_perimetro_telhado: parametros.perimetro_telhado || 0,
        p_comprimento_calha: parametros.comprimento_calha || 0,
        p_telha_codigo: parametros.telha_codigo || '10420',
        p_cor_acessorios: parametros.cor_acessorios || 'CINZA',
        p_incluir_manta: parametros.incluir_manta ?? true,
        p_incluir_calha: parametros.incluir_calha ?? true
      });

      if (dbError) throw dbError;

      if (!data || data.length === 0) {
        throw new Error('Nenhum resultado retornado do cálculo');
      }

      // Processar resultados
      const itens: ItemCalculadoShingleCompleto[] = data;
      const valor_total_geral = itens.reduce((sum, item) => sum + item.valor_total, 0);
      const valor_por_m2 = valor_total_geral / parametros.area_telhado;

      // Agrupar por categoria
      const resumo_por_categoria = itens.reduce((acc, item) => {
        const categoria = item.categoria;
        if (!acc[categoria]) {
          acc[categoria] = {
            quantidade_itens: 0,
            valor_total: 0
          };
        }
        acc[categoria].quantidade_itens += 1;
        acc[categoria].valor_total += item.valor_total;
        return acc;
      }, {} as ResumoOrcamentoShingleCompleto['resumo_por_categoria']);

      // Calcular economia de peso vs cerâmica
      const economia_peso_vs_ceramica = parametros.area_telhado * (40 - 12); // 40kg/m² cerâmica vs 12kg/m² shingle

      // Observações técnicas
      const observacoes_tecnicas = [
        'OSB 11,1mm obrigatório como base estrutural',
        'Subcobertura TYVEK Protec 120 para impermeabilização',
        'Inclinação mínima recomendada: 15% (8,5°)',
        'Ventilação de cumeeira recomendada para melhor desempenho',
        `Economia de peso: ${economia_peso_vs_ceramica.toFixed(0)}kg vs telha cerâmica`,
        'Instalação deve seguir normas técnicas do fabricante'
      ];

      const resultado: ResumoOrcamentoShingleCompleto = {
        itens,
        resumo_por_categoria,
        valor_total_geral,
        valor_por_m2,
        area_telhado: parametros.area_telhado,
        economia_peso_vs_ceramica,
        observacoes_tecnicas
      };

      return resultado;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao calcular orçamento';
      setError(errorMessage);
      console.error('Erro ao calcular orçamento:', err);
      
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

  // Buscar produto por ID
  const buscarProduto = async (id: string): Promise<ProdutoShingleCompleto | null> => {
    try {
      const { data, error: dbError } = await supabase
        .from('produtos_shingle_novo')
        .select('*')
        .eq('id', id)
        .single();

      if (dbError) throw dbError;
      return data;
    } catch (err) {
      console.error('Erro ao buscar produto:', err);
      return null;
    }
  };

  // Buscar produtos por categoria
  const buscarProdutosPorCategoria = async () => {
    const categorias = [
      'TELHA', 'OSB', 'SUBCOBERTURA', 'MANTA_STARTER',
      'CUMEEIRA', 'VENTILACAO', 'RUFO_LATERAL', 'RUFO_CAPA',
      'CALHA', 'PREGO', 'GRAMPO', 'SELANTE', 'FLASH'
    ];

    const resultado: { [categoria: string]: ProdutoShingleCompleto[] } = {};

    for (const categoria of categorias) {
      resultado[categoria] = await buscarProdutos(categoria);
    }

    return resultado;
  };

  // Validar parâmetros de cálculo
  const validarParametros = (parametros: ParametrosCalculoShingle): string[] => {
    const erros: string[] = [];

    if (!parametros.area_telhado || parametros.area_telhado <= 0) {
      erros.push('Área do telhado deve ser maior que zero');
    }

    if (parametros.area_telhado && parametros.area_telhado > 10000) {
      erros.push('Área do telhado muito grande (máximo 10.000m²)');
    }

    if (parametros.comprimento_cumeeira && parametros.comprimento_cumeeira < 0) {
      erros.push('Comprimento da cumeeira não pode ser negativo');
    }

    if (parametros.perimetro_telhado && parametros.perimetro_telhado < 0) {
      erros.push('Perímetro do telhado não pode ser negativo');
    }

    if (parametros.comprimento_calha && parametros.comprimento_calha < 0) {
      erros.push('Comprimento da calha não pode ser negativo');
    }

    return erros;
  };

  // Effect para carregar dados iniciais
  useEffect(() => {
    buscarTelhas();
    buscarProdutos();
  }, []);

  return {
    // Estado
    produtos,
    telhas,
    loading,
    error,

    // Funções
    buscarProdutos,
    buscarTelhas,
    buscarProduto,
    buscarProdutosPorCategoria,
    calcularOrcamentoShingleCompleto,
    validarParametros,

    // Utilidades
    clearError: () => setError(null)
  };
}