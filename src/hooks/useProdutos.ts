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

export const useProdutos = () => {
  const [paineis, setPaineis] = useState<Produto[]>([]);
  const [inversores, setInversores] = useState<Produto[]>([]);
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
  }, []);

  return {
    paineis,
    inversores,
    loading,
    error,
    buscarPaineis,
    buscarInversores,
    buscarProduto,
    clearError: () => setError(null)
  };
};