import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DadosEntradaSolar, useEnergiaSolar, CalculoCompleto } from '@/hooks/useEnergiaSolar';
import { FormularioEntradaSolar } from './FormularioEntradaSolar';
import { ResultadoCalculoSolar } from './ResultadoCalculoSolar';

export const CalculadoraSolar = () => {
  const { toast } = useToast();
  const { calcularSistemaCompleto, loading, error } = useEnergiaSolar();
  
  const [dados, setDados] = useState<DadosEntradaSolar>({
    consumo_mensal_kwh: 0,
    cidade: '',
    estado: '',
    tipo_instalacao: 'residencial',
    tipo_telha: 'ceramica'
  });
  
  const [resultado, setResultado] = useState<CalculoCompleto | null>(null);

  const handleCalcular = async () => {
    try {
      const calculoCompleto = await calcularSistemaCompleto(dados);
      setResultado(calculoCompleto);
      
      toast({
        title: "Cálculo realizado com sucesso!",
        description: `Sistema de ${calculoCompleto.dimensionamento.potencia_necessaria_kwp} kWp dimensionado.`
      });
    } catch (err) {
      toast({
        title: "Erro no cálculo",
        description: error || "Erro desconhecido. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleGerarProposta = () => {
    toast({
      title: "Proposta em desenvolvimento",
      description: "Funcionalidade de geração de proposta será implementada em breve."
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <FormularioEntradaSolar
            dados={dados}
            onChange={setDados}
            onCalcular={handleCalcular}
            loading={loading}
          />
        </div>
        
        <div>
          {resultado ? (
            <ResultadoCalculoSolar
              resultado={resultado}
              onGerarProposta={handleGerarProposta}
            />
          ) : (
            <div className="flex items-center justify-center h-96 border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">Preencha os dados ao lado</p>
                <p className="text-sm text-muted-foreground">O resultado do cálculo aparecerá aqui</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};