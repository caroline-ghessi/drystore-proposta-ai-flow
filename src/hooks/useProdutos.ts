import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  fabricante: string | null;
  potencia_wp: number | null;
  preco_unitario: number | null;
  especificacoes_tecnicas: any;
  compatibilidades: any;
  ativo: boolean;
}

export interface TelhaShingle {
  id: string;
  codigo: string;
  linha: 'SUPREME' | 'DURATION';
  descricao: string;
  cor: string | null;
  consumo_m2: number;
  qtd_unidade_venda: number;
  fator_multiplicador: number;
  quebra_padrao: number;
  preco_unitario: number;
  peso_kg_m2: number;
  garantia_anos: number;
  resistencia_vento_kmh: number;
  ativo: boolean;
}

export interface ProdutoShingleCompleto {
  id: string;
  tipo_componente: 'TELHA' | 'CUMEEIRA' | 'RUFO_LATERAL' | 'RUFO_CAPA' | 'CALHA' | 'PREGO' | 'MANTA' | 'STARTER';
  codigo: string;
  linha: 'SUPREME' | 'DURATION' | 'UNIVERSAL' | null;
  descricao: string;
  cor: string | null;
  unidade_medida: string;
  conteudo_unidade: number;
  quebra_padrao: number;
  preco_unitario: number;
  peso_unitario: number | null;
  especificacoes_tecnicas: any;
  ativo: boolean;
}

export interface ItemCalculadoShingle {
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
  categoria?: string;
  ordem?: number;
}

export interface ResumoOrcamentoShingle {
  valorTelhas: number;
  valorAcessorios: number;
  valorCalhas: number;
  valorComplementos: number;
  valorTotal: number;
  valorPorM2: number;
  itens: ItemCalculadoShingle[];
}

export const useProdutos = () => {
  const [paineis, setPaineis] = useState<Produto[]>([]);
  const [inversores, setInversores] = useState<Produto[]>([]);
  const [telhasShingle, setTelhasShingle] = useState<TelhaShingle[]>([]);
  const [produtosShingleCompletos, setProdutosShingleCompletos] = useState<ProdutoShingleCompleto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscarPaineis = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('categoria', 'painel-solar')
        .eq('ativo', true)
        .order('potencia_wp', { ascending: false });

      if (error) throw error;
      setPaineis(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar painéis');
    } finally {
      setLoading(false);
    }
  };

  const buscarInversores = async (potenciaMinima?: number, potenciaMaxima?: number) => {
    try {
      setLoading(true);
      let query = supabase
        .from('produtos')
        .select('*')
        .eq('categoria', 'inversor')
        .eq('ativo', true);

      if (potenciaMinima) {
        query = query.gte('potencia_wp', potenciaMinima);
      }
      if (potenciaMaxima) {
        query = query.lte('potencia_wp', potenciaMaxima);
      }

      const { data, error } = await query.order('potencia_wp', { ascending: true });

      if (error) throw error;
      setInversores(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar inversores');
    } finally {
      setLoading(false);
    }
  };

  const buscarTelhasShingle = async (linha?: 'SUPREME' | 'DURATION') => {
    try {
      setLoading(true);
      let query = supabase
        .from('telhas_shingle')
        .select('*')
        .eq('ativo', true);

      if (linha) {
        query = query.eq('linha', linha);
      }

      const { data, error } = await query.order('linha').order('preco_unitario');

      if (error) throw error;
      setTelhasShingle((data || []) as TelhaShingle[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar telhas shingle');
    } finally {
      setLoading(false);
    }
  };

  const calcularOrcamentoShingle = async (
    areaTelhado: number,
    telhaId: string,
    quebraPercentual?: number,
    inclinacao?: number
  ) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('calcular_orcamento_shingle', {
        p_area_telhado: areaTelhado,
        p_telha_id: telhaId,
        p_quebra_percentual: quebraPercentual,
        p_inclinacao: inclinacao
      });

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao calcular orçamento');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const buscarProduto = async (id: string): Promise<Produto | null> => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Erro ao buscar produto:', err);
      return null;
    }
  };

  const buscarProdutosShingleCompletos = async (tipoComponente?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('produtos_shingle_completos')
        .select('*')
        .eq('ativo', true);

      if (tipoComponente) {
        query = query.eq('tipo_componente', tipoComponente);
      }

      const { data, error } = await query.order('tipo_componente').order('preco_unitario');

      if (error) throw error;
      setProdutosShingleCompletos((data || []) as ProdutoShingleCompleto[]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar produtos shingle');
    } finally {
      setLoading(false);
    }
  };

  const calcularOrcamentoShingleCompleto = async (
    areaTelhado: number,
    comprimentoCumeeira: number = 0,
    perimetroTelhado: number = 0,
    comprimentoCalha: number = 0,
    telhaCodigo: string = '1.16',
    corAcessorios: string = 'CINZA',
    incluirManta: boolean = true,
    incluirCalha: boolean = true
  ): Promise<ResumoOrcamentoShingle> => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.rpc('calcular_por_mapeamento', {
        p_tipo_proposta: 'telhas-shingle',
        p_area_base: areaTelhado,
        p_dados_extras: {
          comprimento_cumeeira: comprimentoCumeeira,
          perimetro_telhado: perimetroTelhado,
          comprimento_calha: comprimentoCalha,
          telha_codigo: telhaCodigo,
          cor_acessorios: corAcessorios,
          incluir_manta: incluirManta,
          incluir_calha: incluirCalha
        }
      });

      if (error) throw error;
      
      const itens = data.map((item: any) => ({
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
        valor_total: item.valor_total
      })) as ItemCalculadoShingle[];
      
      // Calcular resumo por categoria
      const resumo: ResumoOrcamentoShingle = {
        valorTelhas: 0,
        valorAcessorios: 0,
        valorCalhas: 0,
        valorComplementos: 0,
        valorTotal: 0,
        valorPorM2: 0,
        itens
      };

      itens.forEach(item => {
        switch(item.tipo_item) {
          case 'telhas-shingle':
            resumo.valorTelhas += item.valor_total;
            break;
          case 'cumeeira':
          case 'rufo-lateral':
          case 'rufo-capa':
            resumo.valorAcessorios += item.valor_total;
            break;
          case 'calha':
            resumo.valorCalhas += item.valor_total;
            break;
          case 'pregos':
          case 'manta-starter':
            resumo.valorComplementos += item.valor_total;
            break;
        }
        resumo.valorTotal += item.valor_total;
      });

      resumo.valorPorM2 = resumo.valorTotal / areaTelhado;
      
      return resumo;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao calcular orçamento completo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarPaineis();
    buscarInversores();
    buscarTelhasShingle();
  }, []);

  return {
    paineis,
    inversores,
    telhasShingle,
    produtosShingleCompletos,
    loading,
    error,
    buscarPaineis,
    buscarInversores,
    buscarTelhasShingle,
    buscarProdutosShingleCompletos,
    calcularOrcamentoShingle,
    calcularOrcamentoShingleCompleto,
    buscarProduto,
    clearError: () => setError(null)
  };
};