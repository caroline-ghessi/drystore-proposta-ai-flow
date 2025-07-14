import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProdutoVentilacao {
  id: string;
  codigo: string;
  nome: string;
  nfva: number;
  unidade: string;
  tipo: 'intake' | 'exhaust';
  linear?: boolean;
  observacao?: string;
  preco_unitario: number;
  especificacoes?: any;
}

export interface DadosVentilacao {
  comprimento_sotao: number;
  largura_sotao: number;
  area_sotao: number;
  razao_ventilacao: number;
  percentual_intake: number;
  ajuste_regional: boolean;
  nfva_total: number;
  nfva_intake: number;
  nfva_exhaust: number;
  produto_intake_selecionado: string;
  produto_exhaust_selecionado: string;
  quantidade_intake: number;
  quantidade_exhaust: number;
  comprimento_linear_disponivel?: number;
}

export interface AlertaVentilacao {
  title: string;
  description: string;
  variant: 'default' | 'destructive';
}

export const useVentilacao = () => {
  const [produtos, setProdutos] = useState<ProdutoVentilacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const buscarProdutos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('produtos_shingle_novo')
        .select('*')
        .eq('tipo_componente', 'VENTILACAO')
        .eq('ativo', true)
        .order('codigo');

      if (error) throw error;

      const produtosFormatados: ProdutoVentilacao[] = data.map(produto => {
        const specs = produto.especificacoes_tecnicas as any;
        return {
          id: produto.id,
          codigo: produto.codigo,
          nome: produto.descricao,
          nfva: specs?.nfva_m2 ? parseFloat(specs.nfva_m2) : 0,
          unidade: produto.unidade_medida,
          tipo: produto.codigo.includes('INFLOW') || produto.codigo.includes('BEIRAL') ? 'intake' : 'exhaust',
          linear: produto.codigo.includes('CUMEEIRA'),
          preco_unitario: produto.preco_unitario,
          especificacoes: produto.especificacoes_tecnicas
        };
      });

      setProdutos(produtosFormatados);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar produtos');
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos de ventilação.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularVentilacao = (dados: DadosVentilacao, areaTelhado: number) => {
    const razao = dados.ajuste_regional ? 150 : dados.razao_ventilacao;
    const nfva_total = dados.area_sotao / razao;
    const nfva_intake = nfva_total * (dados.percentual_intake / 100);
    const nfva_exhaust = nfva_total - nfva_intake;

    return {
      nfva_total,
      nfva_intake,
      nfva_exhaust
    };
  };

  const calcularQuantidades = (dados: DadosVentilacao): { 
    quantidade_intake: number; 
    quantidade_exhaust: number;
    alertas: AlertaVentilacao[];
  } => {
    const produtoIntake = produtos.find(p => p.id === dados.produto_intake_selecionado);
    const produtoExhaust = produtos.find(p => p.id === dados.produto_exhaust_selecionado);

    let quantidade_intake = 0;
    let quantidade_exhaust = 0;
    let alertas: AlertaVentilacao[] = [];

    if (produtoIntake?.nfva) {
      quantidade_intake = Math.ceil(dados.nfva_intake / produtoIntake.nfva);
    }

    if (produtoExhaust?.nfva) {
      if (produtoExhaust.linear && dados.comprimento_linear_disponivel) {
        const comprimento_necessario = dados.nfva_exhaust / produtoExhaust.nfva;
        if (comprimento_necessario > dados.comprimento_linear_disponivel) {
          alertas.push({
            title: "Comprimento Insuficiente",
            description: `Comprimento necessário (${comprimento_necessario.toFixed(2)}m) excede o disponível (${dados.comprimento_linear_disponivel}m). Considere mais camadas ou produtos adicionais.`,
            variant: "destructive"
          });
        }
        quantidade_exhaust = Math.ceil(comprimento_necessario);
      } else {
        quantidade_exhaust = Math.ceil(dados.nfva_exhaust / produtoExhaust.nfva);
      }
    }

    // Validações de densidade
    const densidadeIntake = quantidade_intake / dados.area_sotao;
    const densidadeExhaust = quantidade_exhaust / dados.area_sotao;

    // Validações específicas
    if (produtoIntake?.codigo?.includes('AERADOR') && quantidade_intake > dados.area_sotao * 0.2) {
      alertas.push({
        title: "Quantidade Excessiva - Aerador",
        description: `${quantidade_intake} aeradores para ${dados.area_sotao.toFixed(2)}m² é excessivo. Recomendado máximo: ${Math.ceil(dados.area_sotao * 0.2)} unidades.`,
        variant: "destructive"
      });
    }

    if (produtoExhaust?.codigo?.includes('AERADOR') && quantidade_exhaust > dados.area_sotao * 0.2) {
      alertas.push({
        title: "Quantidade Excessiva - Aerador",
        description: `${quantidade_exhaust} aeradores para ${dados.area_sotao.toFixed(2)}m² é excessivo. Recomendado máximo: ${Math.ceil(dados.area_sotao * 0.2)} unidades.`,
        variant: "destructive"
      });
    }

    // Alertas para altas densidades
    if (densidadeIntake > 0.25) {
      alertas.push({
        title: "Alta Densidade - Intake",
        description: `Densidade de ${densidadeIntake.toFixed(2)} peças/m² é alta. Considere produtos com maior NFVA.`,
        variant: "default"
      });
    }

    if (densidadeExhaust > 0.25) {
      alertas.push({
        title: "Alta Densidade - Exhaust",
        description: `Densidade de ${densidadeExhaust.toFixed(2)} peças/m² é alta. Considere produtos com maior NFVA.`,
        variant: "default"
      });
    }

    return {
      quantidade_intake,
      quantidade_exhaust,
      alertas
    };
  };

  useEffect(() => {
    buscarProdutos();
  }, []);

  return {
    produtos,
    loading,
    error,
    buscarProdutos,
    calcularVentilacao,
    calcularQuantidades
  };
};