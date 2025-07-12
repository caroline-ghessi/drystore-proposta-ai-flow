import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DadosEntradaSolar {
  consumo_mensal_kwh: number;
  cidade: string;
  estado: string;
  tipo_instalacao: 'residencial' | 'comercial' | 'industrial';
  tipo_telha: 'ceramica' | 'concreto' | 'metalica' | 'fibrocimento';
  area_disponivel?: number;
  tarifa_energia?: number;
}

export interface ResultadoDimensionamento {
  potencia_necessaria_kwp: number;
  irradiacao_local: number;
  geracao_estimada_anual: number;
  economia_mensal_estimada: number;
  economia_anual_estimada: number;
  fatores_utilizados: {
    fator_perdas: number;
    fator_seguranca: number;
    irradiacao: number;
  };
}

export interface EquipamentosSelecionados {
  painel: {
    id: string;
    modelo: string;
    fabricante: string;
    quantidade: number;
    potencia_unitaria: number;
    potencia_total: number;
    preco_unitario: number;
    preco_total: number;
  };
  inversor: {
    id: string;
    modelo: string;
    fabricante: string;
    potencia: number;
    preco: number;
  };
  resumo: {
    potencia_sistema: number;
    quantidade_paineis: number;
    area_estimada: number;
  };
}

export interface OrcamentoCompleto {
  equipamentos: {
    paineis: number;
    inversor: number;
  };
  instalacao: number;
  subtotal: number;
  margem_aplicada: number;
  valor_total: number;
  valor_kwp_instalado: number;
}

export interface AnaliseFinanceira {
  payback_simples_anos: number;
  payback_descontado_anos: number;
  vpl_25_anos: number;
  economia_anual: number;
  tir_estimada: number;
}

export interface CalculoCompleto {
  dimensionamento: ResultadoDimensionamento;
  equipamentos: EquipamentosSelecionados;
  orcamento: OrcamentoCompleto;
  analise_financeira: AnaliseFinanceira;
  resumo_proposta: {
    economia_percentual: number;
    retorno_investimento: string;
    vida_util_sistema: number;
  };
}

export const useEnergiaSolar = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calcularSistemaCompleto = async (dados: DadosEntradaSolar): Promise<CalculoCompleto> => {
    setLoading(true);
    setError(null);

    try {
      // 1. Dimensionamento do sistema
      const { data: dimensionamento, error: errorDimensionamento } = await supabase
        .rpc('dimensionar_sistema', {
          p_consumo_kwh: dados.consumo_mensal_kwh,
          p_cidade: dados.cidade,
          p_estado: dados.estado,
          p_tipo_instalacao: dados.tipo_instalacao
        });

      if (errorDimensionamento) {
        throw new Error(`Erro no dimensionamento: ${errorDimensionamento.message}`);
      }

      // 2. Seleção de equipamentos
      const { data: equipamentos, error: errorEquipamentos } = await supabase
        .rpc('selecionar_equipamentos', {
          p_potencia_kwp: (dimensionamento as any).potencia_necessaria_kwp,
          p_tipo_telha: dados.tipo_telha,
          p_area_disponivel: dados.area_disponivel
        });

      if (errorEquipamentos) {
        throw new Error(`Erro na seleção de equipamentos: ${errorEquipamentos.message}`);
      }

      // 3. Cálculo do orçamento
      const { data: orcamento, error: errorOrcamento } = await supabase
        .rpc('calcular_orcamento', {
          p_painel_id: (equipamentos as any).painel.id,
          p_quantidade_paineis: (equipamentos as any).painel.quantidade,
          p_inversor_id: (equipamentos as any).inversor.id,
          p_potencia_sistema: (dimensionamento as any).potencia_necessaria_kwp
        });

      if (errorOrcamento) {
        throw new Error(`Erro no cálculo do orçamento: ${errorOrcamento.message}`);
      }

      // 4. Análise financeira
      const { data: analiseFinanceira, error: errorAnalise } = await supabase
        .rpc('calcular_payback', {
          p_valor_investimento: (orcamento as any).valor_total,
          p_economia_mensal: (dimensionamento as any).economia_mensal_estimada,
          p_tarifa_energia: dados.tarifa_energia || 0.75,
          p_taxa_desconto: 0.06
        });

      if (errorAnalise) {
        throw new Error(`Erro na análise financeira: ${errorAnalise.message}`);
      }

      // 5. Compilar resultado completo
      const resultado: CalculoCompleto = {
        dimensionamento: dimensionamento as unknown as ResultadoDimensionamento,
        equipamentos: equipamentos as unknown as EquipamentosSelecionados,
        orcamento: orcamento as unknown as OrcamentoCompleto,
        analise_financeira: analiseFinanceira as unknown as AnaliseFinanceira,
        resumo_proposta: {
          economia_percentual: Math.round(((dimensionamento as any).economia_mensal_estimada / dados.consumo_mensal_kwh) * 100),
          retorno_investimento: `${(analiseFinanceira as any).payback_simples_anos} anos`,
          vida_util_sistema: 25
        }
      };

      return resultado;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido no cálculo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const salvarCalculos = async (
    dados: DadosEntradaSolar, 
    resultado: CalculoCompleto,
    propostaId?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('energia_solar_calculos')
        .insert({
          proposta_id: propostaId,
          consumo_mensal_kwh: dados.consumo_mensal_kwh,
          irradiacao_local: resultado.dimensionamento.irradiacao_local,
          tipo_instalacao: dados.tipo_instalacao,
          tipo_telha: dados.tipo_telha,
          area_disponivel: dados.area_disponivel,
          potencia_sistema_kwp: resultado.dimensionamento.potencia_necessaria_kwp,
          quantidade_paineis: resultado.equipamentos.painel.quantidade,
          painel_selecionado_id: resultado.equipamentos.painel.id,
          inversor_selecionado_id: resultado.equipamentos.inversor.id,
          geracao_estimada_mensal_kwh: resultado.dimensionamento.economia_mensal_estimada,
          geracao_estimada_anual_kwh: resultado.dimensionamento.geracao_estimada_anual,
          economia_mensal_estimada: resultado.dimensionamento.economia_mensal_estimada,
          economia_anual_estimada: resultado.dimensionamento.economia_anual_estimada,
          valor_equipamentos: resultado.orcamento.equipamentos.paineis + resultado.orcamento.equipamentos.inversor,
          valor_instalacao: resultado.orcamento.instalacao,
          valor_total: resultado.orcamento.valor_total,
          payback_simples_anos: resultado.analise_financeira.payback_simples_anos,
          payback_descontado_anos: resultado.analise_financeira.payback_descontado_anos,
          vpl_25_anos: resultado.analise_financeira.vpl_25_anos,
          area_ocupada_m2: resultado.equipamentos.resumo.area_estimada,
          peso_total_kg: resultado.equipamentos.painel.quantidade * 25 // estimativa 25kg por painel
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao salvar cálculos: ${error.message}`);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar cálculos';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const buscarIrradiacaoPorCidade = async (cidade: string, estado: string) => {
    try {
      const { data, error } = await supabase
        .from('irradiacao_solar')
        .select('irradiacao_media_anual, latitude, longitude')
        .ilike('cidade', `%${cidade}%`)
        .ilike('estado', `%${estado}%`)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Erro ao buscar irradiação: ${error.message}`);
      }

      return data;
    } catch (err) {
      console.warn('Cidade não encontrada na base de irradiação:', cidade, estado);
      return null;
    }
  };

  const listarCidadesDisponiveis = async (estado?: string) => {
    try {
      let query = supabase
        .from('irradiacao_solar')
        .select('cidade, estado, irradiacao_media_anual')
        .order('cidade');

      if (estado) {
        query = query.ilike('estado', `%${estado}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao listar cidades: ${error.message}`);
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao listar cidades');
      return [];
    }
  };

  return {
    calcularSistemaCompleto,
    salvarCalculos,
    buscarIrradiacaoPorCidade,
    listarCidadesDisponiveis,
    loading,
    error,
    clearError: () => setError(null)
  };
};