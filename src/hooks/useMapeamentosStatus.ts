import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type StatusMapeamento = 'completo' | 'parcial' | 'vazio' | 'carregando';

export interface MapeamentoStatus {
  tipo: string;
  status: StatusMapeamento;
  totalComposicoes: number;
  composicoesComItens: number;
  valorTotalEstimado: number;
}

export interface StatusGeral {
  [key: string]: MapeamentoStatus;
}

const TIPOS_SUPORTADOS = [
  'energia-solar',
  'telhas-shingle', 
  'impermeabilizacao',
  'divisorias',
  'forros'
];

export function useMapeamentosStatus() {
  const [status, setStatus] = useState<StatusGeral>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const verificarMapeamentos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const statusResult: StatusGeral = {};

      for (const tipo of TIPOS_SUPORTADOS) {
        try {
          // Buscar composições mapeadas para este tipo
          const { data: mapeamentos, error: mapeamentosError } = await supabase
            .from('tipo_proposta_composicoes')
            .select(`
              composicao_id,
              composicoes_mestre!inner(
                id,
                codigo,
                nome,
                valor_total_m2,
                categoria
              )
            `)
            .eq('tipo_proposta', tipo)
            .eq('ativo', true);

          if (mapeamentosError) {
            console.error(`Erro ao buscar mapeamentos para ${tipo}:`, mapeamentosError);
            statusResult[tipo] = {
              tipo,
              status: 'vazio',
              totalComposicoes: 0,
              composicoesComItens: 0,
              valorTotalEstimado: 0
            };
            continue;
          }

          const totalComposicoes = mapeamentos?.length || 0;
          
          if (totalComposicoes === 0) {
            statusResult[tipo] = {
              tipo,
              status: 'vazio',
              totalComposicoes: 0,
              composicoesComItens: 0,
              valorTotalEstimado: 0
            };
            continue;
          }

          // Verificar quantas composições têm itens configurados
          let composicoesComItens = 0;
          let valorTotalEstimado = 0;

          for (const mapeamento of mapeamentos) {
            const composicao = mapeamento.composicoes_mestre;
            
            // Por enquanto, usar o valor_total_m2 como indicativo de configuração
            // Posteriormente será verificado se tem itens na tabela itens_composicao
            if (composicao.valor_total_m2 && composicao.valor_total_m2 > 0) {
              composicoesComItens++;
              valorTotalEstimado += Number(composicao.valor_total_m2);
            }
          }

          // Determinar status baseado na proporção de composições configuradas
          let status: StatusMapeamento;
          if (composicoesComItens === 0) {
            status = 'vazio';
          } else if (composicoesComItens === totalComposicoes) {
            status = 'completo';
          } else {
            status = 'parcial';
          }

          statusResult[tipo] = {
            tipo,
            status,
            totalComposicoes,
            composicoesComItens,
            valorTotalEstimado
          };

        } catch (err) {
          console.error(`Erro ao processar tipo ${tipo}:`, err);
          statusResult[tipo] = {
            tipo,
            status: 'vazio',
            totalComposicoes: 0,
            composicoesComItens: 0,
            valorTotalEstimado: 0
          };
        }
      }

      setStatus(statusResult);
    } catch (err) {
      console.error('Erro ao verificar mapeamentos:', err);
      setError('Erro ao carregar status dos mapeamentos');
    } finally {
      setIsLoading(false);
    }
  };

  const obterMensagemStatus = (tipo: string): string => {
    const statusTipo = status[tipo];
    if (!statusTipo) return 'Tipo não encontrado';

    switch (statusTipo.status) {
      case 'carregando':
        return 'Carregando configurações...';
      case 'vazio':
        return 'Produtos não configurados';
      case 'parcial':
        return `${statusTipo.composicoesComItens}/${statusTipo.totalComposicoes} produtos configurados`;
      case 'completo':
        return 'Produtos configurados';
      default:
        return 'Status desconhecido';
    }
  };

  const podeCalcular = (tipo: string): boolean => {
    const statusTipo = status[tipo];
    return statusTipo?.status === 'completo' || statusTipo?.status === 'parcial';
  };

  useEffect(() => {
    verificarMapeamentos();
  }, []);

  return {
    status,
    isLoading,
    error,
    verificarMapeamentos,
    obterMensagemStatus,
    podeCalcular
  };
}