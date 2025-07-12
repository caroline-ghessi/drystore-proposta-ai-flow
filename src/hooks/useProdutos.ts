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

export const useProdutos = () => {
  const [paineis, setPaineis] = useState<Produto[]>([]);
  const [inversores, setInversores] = useState<Produto[]>([]);
  const [telhasShingle, setTelhasShingle] = useState<TelhaShingle[]>([]);
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

  useEffect(() => {
    buscarPaineis();
    buscarInversores();
    buscarTelhasShingle();
  }, []);

  return {
    paineis,
    inversores,
    telhasShingle,
    loading,
    error,
    buscarPaineis,
    buscarInversores,
    buscarTelhasShingle,
    calcularOrcamentoShingle,
    buscarProduto,
    clearError: () => setError(null)
  };
};