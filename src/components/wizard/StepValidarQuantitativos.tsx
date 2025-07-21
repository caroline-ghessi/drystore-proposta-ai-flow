
import { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { PlanilhaQuantitativos, ItemQuantitativo } from './PlanilhaQuantitativos';
import { useQuantitativosShingle } from '@/hooks/useQuantitativosShingle';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
    validarQuantitativos,
    clearError
  } = useQuantitativosShingle();

  const calcularQuantitativos = async () => {
    console.log('Iniciando cálculo de quantitativos com dados:', dadosCalculoShingle);
    
    clearError();
    
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

  useEffect(() => {
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
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Erro no Cálculo de Quantitativos
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={onBack}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Voltar e Ajustar Dados
              </Button>
              <Button
                onClick={calcularQuantitativos}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
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
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum Quantitativo Encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              Não foi possível calcular os quantitativos para os dados informados.
              Verifique se a área do telhado foi informada corretamente.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={onBack}
                variant="outline"
              >
                Voltar e Ajustar Dados
              </Button>
              <Button
                onClick={calcularQuantitativos}
                className="bg-primary text-white hover:bg-primary/90"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recalcular
              </Button>
            </div>
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
