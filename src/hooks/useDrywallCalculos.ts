import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface ParametrosDrywall {
  largura: number;
  altura: number;
  tipo_parede?: string;
  incluir_portas?: boolean;
  quantidade_portas?: number;
  incluir_janelas?: boolean;
  quantidade_janelas?: number;
  largura_porta?: number;
  altura_porta?: number;
  largura_janela?: number;
  altura_janela?: number;
  espessura_isolamento?: number;
  espacamento_montantes?: number;
  com_isolamento?: boolean;
  quebra_customizada?: number | null;
}

export interface ItemCalculoDrywall {
  categoria: string;
  item_codigo: string;
  item_descricao: string;
  especificacao: string;
  quantidade_liquida: number;
  quebra_percentual: number;
  quantidade_com_quebra: number;
  quantidade_comercial: number;
  unidade_comercial: string;
  preco_unitario: number;
  valor_total: number;
  peso_total_kg: number;
  observacoes: string;
  ordem_categoria: number;
}

export interface ResumoDrywall {
  valorTotal: number;
  valorPorM2: number;
  pesoTotal: number;
  areaLiquida: number;
  areaBruta: number;
  valorPorCategoria: {
    [categoria: string]: number;
  };
}

export const useDrywallCalculos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const calcularOrcamentoDrywall = async (
    parametros: ParametrosDrywall
  ): Promise<{
    itens: ItemCalculoDrywall[];
    resumo: ResumoDrywall;
  } | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('calcular_orcamento_drywall_completo', {
        p_largura: parametros.largura,
        p_altura: parametros.altura,
        p_tipo_parede: parametros.tipo_parede || 'Parede Simples ST 73mm',
        p_incluir_portas: parametros.incluir_portas || false,
        p_quantidade_portas: parametros.quantidade_portas || 0,
        p_incluir_janelas: parametros.incluir_janelas || false,
        p_quantidade_janelas: parametros.quantidade_janelas || 0,
        p_largura_porta: parametros.largura_porta || 0.80,
        p_altura_porta: parametros.altura_porta || 2.10,
        p_largura_janela: parametros.largura_janela || 1.20,
        p_altura_janela: parametros.altura_janela || 1.20,
        p_espessura_isolamento: parametros.espessura_isolamento || 50,
        p_espacamento_montantes: parametros.espacamento_montantes || 0.60,
        p_com_isolamento: parametros.com_isolamento !== false,
        p_quebra_customizada: parametros.quebra_customizada
      });

      if (rpcError) throw rpcError;

      if (!data || data.length === 0) {
        throw new Error('Nenhum resultado retornado do cálculo');
      }

      // Calcular resumo
      const valorTotal = data.reduce((acc: number, item: any) => acc + item.valor_total, 0);
      const pesoTotal = data.reduce((acc: number, item: any) => acc + item.peso_total_kg, 0);
      
      const areaEsquadrias = 
        (parametros.incluir_portas ? (parametros.quantidade_portas || 0) * (parametros.largura_porta || 0.80) * (parametros.altura_porta || 2.10) : 0) +
        (parametros.incluir_janelas ? (parametros.quantidade_janelas || 0) * (parametros.largura_janela || 1.20) * (parametros.altura_janela || 1.20) : 0);
      
      const areaLiquida = parametros.largura * parametros.altura - (areaEsquadrias * 0.5);
      const areaBruta = parametros.largura * parametros.altura;

      // Calcular valor por categoria
      const valorPorCategoria: { [categoria: string]: number } = {};
      data.forEach((item: any) => {
        if (!valorPorCategoria[item.categoria]) {
          valorPorCategoria[item.categoria] = 0;
        }
        valorPorCategoria[item.categoria] += item.valor_total;
      });

      const resumo: ResumoDrywall = {
        valorTotal,
        valorPorM2: valorTotal / areaLiquida,
        pesoTotal,
        areaLiquida,
        areaBruta,
        valorPorCategoria
      };

      return {
        itens: data,
        resumo
      };

    } catch (error: any) {
      console.error('Erro ao calcular orçamento drywall:', error);
      const errorMessage = error.message || 'Erro desconhecido no cálculo';
      setError(errorMessage);
      
      toast({
        title: "Erro no cálculo",
        description: errorMessage,
        variant: "destructive"
      });

      return null;
    } finally {
      setLoading(false);
    }
  };

  const validarExemploGuia = async (): Promise<boolean> => {
    // Validar com exemplo do guia: 6m × 3m com porta e janela
    const parametrosExemplo: ParametrosDrywall = {
      largura: 6,
      altura: 3,
      incluir_portas: true,
      quantidade_portas: 1,
      incluir_janelas: true,
      quantidade_janelas: 1,
      largura_porta: 0.80,
      altura_porta: 2.10,
      largura_janela: 1.20,
      altura_janela: 1.20,
      tipo_parede: 'Parede Simples ST 73mm',
      com_isolamento: true
    };

    const resultado = await calcularOrcamentoDrywall(parametrosExemplo);
    
    if (!resultado) {
      toast({
        title: "Erro na validação",
        description: "Não foi possível validar o exemplo do guia",
        variant: "destructive"
      });
      return false;
    }

    // Validações básicas conforme o guia
    const { itens, resumo } = resultado;
    
    // Verificar se temos os itens principais
    const temPlacas = itens.some(item => item.categoria === 'VEDAÇÃO');
    const temGuias = itens.some(item => item.categoria === 'ESTRUTURA' && item.item_codigo.includes('GUIA'));
    const temMontantes = itens.some(item => item.categoria === 'ESTRUTURA' && item.item_codigo.includes('MONT'));
    const temParafusos = itens.some(item => item.categoria === 'FIXAÇÃO');
    const temAcabamento = itens.some(item => item.categoria === 'ACABAMENTO');

    if (!temPlacas || !temGuias || !temMontantes || !temParafusos || !temAcabamento) {
      toast({
        title: "Validação falhou",
        description: "Alguns itens essenciais não foram encontrados no cálculo",
        variant: "destructive"
      });
      return false;
    }

    // Verificar se o valor está em uma faixa razoável (baseado em valores de mercado)
    const valorMinimo = 800; // R$ por m²
    const valorMaximo = 2000; // R$ por m²
    
    if (resumo.valorPorM2 < valorMinimo || resumo.valorPorM2 > valorMaximo) {
      toast({
        title: "Atenção",
        description: `Valor por m² (${resumo.valorPorM2.toFixed(2)}) fora da faixa esperada (R$ ${valorMinimo}-${valorMaximo}/m²)`,
        variant: "destructive"
      });
    }

    toast({
      title: "Validação concluída",
      description: `Exemplo validado com sucesso! Valor: R$ ${resumo.valorTotal.toFixed(2)} (R$ ${resumo.valorPorM2.toFixed(2)}/m²)`,
    });

    return true;
  };

  return {
    calcularOrcamentoDrywall,
    validarExemploGuia,
    loading,
    error
  };
};