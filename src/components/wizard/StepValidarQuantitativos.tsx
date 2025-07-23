
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
    console.log('🚀 [StepValidarQuantitativos] Iniciando cálculo de quantitativos');
    console.log('📋 [StepValidarQuantitativos] Dados recebidos:', JSON.stringify(dadosCalculoShingle, null, 2));
    
    // Validação inicial dos dados - o hook já faz as validações
    if (!dadosCalculoShingle) {
      console.error('❌ [StepValidarQuantitativos] Dados não fornecidos');
      return;
    }
    
    if (!dadosCalculoShingle.area_telhado || dadosCalculoShingle.area_telhado <= 0) {
      console.error('❌ [StepValidarQuantitativos] Área inválida:', dadosCalculoShingle.area_telhado);
      return;
    }
    
    clearError();
    console.log('🔄 [StepValidarQuantitativos] Chamando calcularQuantitativosComerciais...');
    
    const resultado = await calcularQuantitativosComerciais(dadosCalculoShingle);
    
    console.log('📊 [StepValidarQuantitativos] Resultado recebido:', resultado);
    
    if (resultado && resultado.length > 0) {
      console.log('✅ [StepValidarQuantitativos] Definindo quantitativos no estado');
      setQuantitativos(resultado);
      
      const total = resultado.reduce((sum, item) => sum + item.valor_total, 0);
      setValorTotal(total);
      console.log(`💰 [StepValidarQuantitativos] Valor total calculado: R$ ${total.toFixed(2)}`);
      
      // Validar quantitativos e mostrar alertas se necessário
      const alertas = validarQuantitativos(resultado);
      if (alertas.length > 0) {
        console.warn('⚠️ [StepValidarQuantitativos] Alertas encontrados:', alertas);
      }
      
      console.log('🎯 [StepValidarQuantitativos] Processo concluído com sucesso');
    } else {
      console.warn('⚠️ [StepValidarQuantitativos] Nenhum resultado válido recebido');
      // O hook já gerencia o estado de erro, não precisamos definir aqui
    }
  };

  useEffect(() => {
    console.log('🔄 [StepValidarQuantitativos] useEffect disparado');
    console.log('📋 [StepValidarQuantitativos] dadosCalculoShingle alterados:', dadosCalculoShingle);
    
    if (dadosCalculoShingle?.area_telhado) {
      calcularQuantitativos();
    } else {
      console.warn('⚠️ [StepValidarQuantitativos] Dados insuficientes para calcular');
      // O hook já gerencia o estado de erro
    }
  }, [dadosCalculoShingle]);

  const handleApprove = () => {
    onApprove(quantitativos);
  };

  if (loading) {
    console.log('⏳ [StepValidarQuantitativos] Renderizando estado de loading');
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <h3 className="text-lg font-semibold mb-2">Calculando Quantitativos</h3>
          <p className="text-muted-foreground text-center mb-4">
            Processando cálculos de materiais e quantidades comerciais...
          </p>
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            <p>Área: {dadosCalculoShingle?.area_telhado}m²</p>
            <p>Telha: {dadosCalculoShingle?.telha_codigo || 'Não especificada'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.log('❌ [StepValidarQuantitativos] Renderizando estado de erro:', error);
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Erro no Cálculo de Quantitativos
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            
            {/* Debug info para desenvolvimento */}
            <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded-md mb-4">
              <p><strong>Debug Info:</strong></p>
              <p>Área: {dadosCalculoShingle?.area_telhado || 'N/A'}m²</p>
              <p>Telha: {dadosCalculoShingle?.telha_codigo || 'N/A'}</p>
              <p>Perímetro: {dadosCalculoShingle?.perimetro_telhado || 'N/A'}m</p>
              <p>Cumeeira: {dadosCalculoShingle?.comprimento_cumeeira || 'N/A'}m</p>
            </div>
            
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
    console.log('⚠️ [StepValidarQuantitativos] Renderizando estado de nenhum quantitativo');
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
            
            {/* Debug info para desenvolvimento */}
            <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded-md mb-4">
              <p><strong>Dados Recebidos:</strong></p>
              <p>Área: {dadosCalculoShingle?.area_telhado || 'N/A'}m²</p>
              <p>Telha: {dadosCalculoShingle?.telha_codigo || 'N/A'}</p>
              <p>Loading: {loading ? 'Sim' : 'Não'}</p>
              <p>Error: {error || 'Nenhum'}</p>
              <p>Quantitativos: {quantitativos.length} itens</p>
            </div>
            
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

  console.log('✅ [StepValidarQuantitativos] Renderizando PlanilhaQuantitativos');
  console.log(`📊 [StepValidarQuantitativos] ${quantitativos.length} itens, valor total: R$ ${valorTotal.toFixed(2)}`);
  
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
