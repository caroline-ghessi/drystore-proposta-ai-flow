
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { PlanilhaQuantitativos, ItemQuantitativo } from './PlanilhaQuantitativos';
import { useQuantitativosShingle } from '@/hooks/useQuantitativosShingle';
import { Card, CardContent } from '@/components/ui/card';

interface StepValidarQuantitativosProps {
  dadosCalculoShingle: {
    area_telhado: number;
    comprimento_cumeeira?: number;
    comprimento_espigao?: number;
    comprimento_agua_furtada?: number;
    perimetro_telhado?: number;
    telha_codigo?: string;
    cor_acessorios?: string;
    incluir_manta?: boolean;
  };
  onBack: () => void;
  onApprove: (quantitativos: ItemQuantitativo[]) => void;
}

export function StepValidarQuantitativos({
  dadosCalculoShingle,
  onBack,
  onApprove
}: StepValidarQuantitativosProps) {
  const [quantitativos, setQuantitativos] = useState<ItemQuantitativo[]>([]);
  const [valorTotal, setValorTotal] = useState(0);
  const { 
    loading, 
    error, 
    calcularQuantitativosComerciais,
    validarQuantitativos 
  } = useQuantitativosShingle();

  useEffect(() => {
    const calcularQuantitativos = async () => {
      console.log('Calculando quantitativos com dados:', dadosCalculoShingle);
      
      const resultado = await calcularQuantitativosComerciais(dadosCalculoShingle);
      
      if (resultado) {
        setQuantitativos(resultado);
        const total = resultado.reduce((sum, item) => sum + item.valor_total, 0);
        setValorTotal(total);
        
        // Validar quantitativos e mostrar alertas se necessário
        const alertas = validarQuantitativos(resultado);
        if (alertas.length > 0) {
          console.warn('Alertas encontrados nos quantitativos:', alertas);
        }
      }
    };

    calcularQuantitativos();
  }, [dadosCalculoShingle]);

  const handleApprove = () => {
    onApprove(quantitativos);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <h3 className="text-lg font-semibold mb-2">Calculando Quantitativos</h3>
          <p className="text-muted-foreground text-center">
            Processando cálculos de materiais e quantidades comerciais...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Erro no Cálculo de Quantitativos
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Voltar e Tentar Novamente
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (quantitativos.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              Nenhum Quantitativo Encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              Não foi possível calcular os quantitativos para os dados informados.
            </p>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Voltar e Ajustar Dados
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <PlanilhaQuantitativos
      itens={quantitativos}
      area_telhado={dadosCalculoShingle.area_telhado}
      valor_total_geral={valorTotal}
      onBack={onBack}
      onApprove={handleApprove}
    />
  );
}
