import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ProdutoShingleCompleto {
  id: string;
  categoria: string;
  codigo: string;
  descricao: string;
  aplicacao?: string;
  unidade_medida: string;
  quebra_padrao: number;
  preco_unitario: number;
  quantidade_embalagem: number;
  icms_percentual?: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComposicaoMestre {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  descricao?: string;
  aplicacao?: string;
  valor_total_m2: number;
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
  comprimento_espigao?: number;
  comprimento_agua_furtada?: number;
  perimetro_telhado?: number;
  telha_codigo?: string;
  cor_acessorios?: string;
  incluir_manta?: boolean;
}

export interface SistemaShingle {
  codigo: string;
  nome: string;
  valor_m2: number;
  descricao: string;
  linha: 'SUPREME' | 'OAKRIDGE';
}

export function useTelhasShingleCompleto() {
  const [produtos, setProdutos] = useState<ProdutoShingleCompleto[]>([]);
  const [telhas, setTelhas] = useState<ComposicaoMestre[]>([]);
  const [sistemasDisponiveis, setSistemasDisponiveis] = useState<SistemaShingle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Buscar sistemas disponíveis (Supreme e Oakridge)
  const buscarSistemasDisponiveis = async () => {
    try {
      setLoading(true);
      
      const { data, error: dbError } = await supabase
        .from('composicoes_mestre')
        .select('*')
        .eq('categoria', 'telhas-shingle')
        .eq('ativo', true)
        .in('codigo', ['1.16', '1.17'])
        .order('codigo');

      if (dbError) throw dbError;

      const sistemas: SistemaShingle[] = (data || []).map(comp => ({
        codigo: comp.codigo,
        nome: comp.nome,
        valor_m2: comp.valor_total_m2,
        descricao: comp.descricao || '',
        linha: comp.codigo === '1.16' ? 'SUPREME' : 'OAKRIDGE'
      }));

      setSistemasDisponiveis(sistemas);
      return sistemas;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar sistemas';
      setError(errorMessage);
      console.error('Erro ao buscar sistemas:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Carregar todos os produtos usando composicoes_mestre
  const buscarProdutos = async (tipo_componente?: string) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('produtos_mestre')
        .select('*')
        .eq('ativo', true)
        .order('categoria', { ascending: true })
        .order('descricao', { ascending: true });

      if (tipo_componente) {
        query = query.eq('categoria', tipo_componente);
      }

      const { data, error: dbError } = await query;

      if (dbError) throw dbError;

      if (tipo_componente) {
        // Para telhas, já é buscado pela buscarTelhas
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

  // Buscar apenas telhas usando composicoes_mestre
  const buscarTelhas = async (linha?: 'SUPREME' | 'DURATION') => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('composicoes_mestre')
        .select('*')
        .eq('categoria', 'telhas-shingle')
        .eq('ativo', true)
        .order('codigo', { ascending: true })
        .order('nome', { ascending: true });

      if (linha) {
        query = query.ilike('nome', `%${linha}%`);
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

  // Calcular orçamento completo usando calcular_por_mapeamento
  const calcularOrcamentoShingleCompleto = async (
    parametros: ParametrosCalculoShingle
  ): Promise<ResumoOrcamentoShingleCompleto | null> => {
    try {
      setLoading(true);
      setError(null);

      // Determinar o tipo de proposta baseado no código da telha
      const tipoProposta = parametros.telha_codigo === '1.17' ? 'telhas-shingle-oakridge' : 'telhas-shingle-supreme';

      const { data, error: dbError } = await supabase.rpc('calcular_por_mapeamento', {
        p_tipo_proposta: tipoProposta,
        p_area_base: parametros.area_telhado,
        p_dados_extras: {
          comprimento_cumeeira: parametros.comprimento_cumeeira || 0,
          comprimento_espigao: parametros.comprimento_espigao || 0,
          comprimento_agua_furtada: parametros.comprimento_agua_furtada || 0,
          perimetro_telhado: parametros.perimetro_telhado || 0,
          telha_codigo: parametros.telha_codigo || '1.16',
          cor_acessorios: parametros.cor_acessorios || 'CINZA',
          incluir_manta: parametros.incluir_manta ?? true
        }
      });

      if (dbError) throw dbError;

      if (!data || data.length === 0) {
        throw new Error('Nenhum resultado retornado do cálculo');
      }

      // Processar resultados do mapeamento
      const itens: ItemCalculadoShingleCompleto[] = data.map((item: any) => ({
        tipo_item: item.categoria,
        codigo: item.item_codigo,
        descricao: item.item_descricao,
        dimensao_base: item.area_aplicacao,
        unidade_dimensao: 'm²',
        fator_conversao: item.fator_aplicacao,
        quebra_percentual: (item.quantidade_com_quebra - item.quantidade_liquida) / item.quantidade_liquida * 100,
        quantidade_calculada: item.quantidade_liquida,
        quantidade_final: item.quantidade_com_quebra,
        unidade_venda: 'un',
        preco_unitario: item.preco_unitario,
        valor_total: item.valor_total,
        categoria: item.categoria,
        ordem: item.ordem_calculo
      }));

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

  // Buscar produto por ID usando produtos_mestre
  const buscarProduto = async (id: string): Promise<ProdutoShingleCompleto | null> => {
    try {
      const { data, error: dbError } = await supabase
        .from('produtos_mestre')
        .select('*')
        .eq('id', id)
        .single();

      if (dbError) throw dbError;
      return data as ProdutoShingleCompleto;
    } catch (err) {
      console.error('Erro ao buscar produto:', err);
      return null;
    }
  };

  // Buscar produtos por categoria usando produtos_mestre
  const buscarProdutosPorCategoria = async () => {
    const categorias = [
      'telhas-shingle', 'osb', 'subcobertura', 'manta-starter',
      'cumeeira', 'ventilacao', 'rufo-lateral', 'rufo-capa',
      'calha', 'pregos', 'grampos', 'selante', 'flash'
    ];

    const resultado: { [categoria: string]: ProdutoShingleCompleto[] } = {};

    for (const categoria of categorias) {
      resultado[categoria] = await buscarProdutos(categoria) as ProdutoShingleCompleto[];
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

    if (parametros.comprimento_espigao && parametros.comprimento_espigao < 0) {
      erros.push('Comprimento do espigão não pode ser negativo');
    }

    if (parametros.comprimento_agua_furtada && parametros.comprimento_agua_furtada < 0) {
      erros.push('Comprimento da água furtada não pode ser negativo');
    }

    if (parametros.perimetro_telhado && parametros.perimetro_telhado < 0) {
      erros.push('Perímetro do telhado não pode ser negativo');
    }

    return erros;
  };

  // Effect para carregar dados iniciais
  useEffect(() => {
    buscarSistemasDisponiveis();
    buscarTelhas();
    buscarProdutos();
  }, []);

  return {
    // Estado
    produtos,
    telhas,
    sistemasDisponiveis,
    loading,
    error,

    // Funções
    buscarProdutos,
    buscarTelhas,
    buscarSistemasDisponiveis,
    buscarProduto,
    buscarProdutosPorCategoria,
    calcularOrcamentoShingleCompleto,
    validarParametros,

    // Utilidades
    clearError: () => setError(null)
  };
}
