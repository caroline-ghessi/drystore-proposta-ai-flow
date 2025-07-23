
import { useState, useEffect, useCallback, useRef } from 'react';
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
  console.log('🎬 [STEP-DEBUG] === COMPONENTE RENDERIZADO ===');
  console.log('📋 [STEP-DEBUG] Props recebidas:', { dadosCalculoShingle, onBack: !!onBack, onApprove: !!onApprove });
  console.log('📋 [STEP-DEBUG] dadosCalculoShingle:', JSON.stringify(dadosCalculoShingle, null, 2));
  
  const [quantitativos, setQuantitativos] = useState<ItemQuantitativo[]>([]);
  const [valorTotal, setValorTotal] = useState(0);
  const [processando, setProcessando] = useState(false);
  const [inicializando, setInicializando] = useState(true);
  const [tempoInicio, setTempoInicio] = useState<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const calculoExecutadoRef = useRef(false);
  
  const { 
    loading, 
    error, 
    calcularQuantitativosComerciais,
    validarQuantitativos,
    clearError
  } = useQuantitativosShingle();

  console.log('🎯 [STEP-DEBUG] Estados Hook:');
  console.log('🎯 [STEP-DEBUG] - loading:', loading);
  console.log('🎯 [STEP-DEBUG] - error:', error);
  console.log('🎯 [STEP-DEBUG] - processando:', processando);
  console.log('🎯 [STEP-DEBUG] Estados Locais:');
  console.log('🎯 [STEP-DEBUG] - quantitativos.length:', quantitativos.length);
  console.log('🎯 [STEP-DEBUG] - valorTotal:', valorTotal);

  const calcularQuantitativos = useCallback(async () => {
    // Prevenir execuções múltiplas
    if (calculoExecutadoRef.current) {
      console.log('🚫 [STEP-DEBUG] Cálculo já executado, ignorando');
      return;
    }

    console.log('🚀 [STEP-DEBUG] === INICIANDO CÁLCULO LOCAL ===');
    console.log('📋 [STEP-DEBUG] Dados para cálculo:', JSON.stringify(dadosCalculoShingle, null, 2));
    
    calculoExecutadoRef.current = true;
    const inicio = Date.now();
    setTempoInicio(inicio);
    setProcessando(true);
    setInicializando(false);
    clearError();

    // Timeout de segurança
    timeoutRef.current = setTimeout(() => {
      console.error('⏰ [STEP-DEBUG] Timeout - operação muito lenta');
      setProcessando(false);
      calculoExecutadoRef.current = false;
    }, 30000); // 30 segundos
    
    try {
      // Validação inicial dos dados - o hook já faz as validações
      if (!dadosCalculoShingle) {
        console.error('❌ [STEP-DEBUG] Dados não fornecidos');
        return;
      }
      
      if (!dadosCalculoShingle.area_telhado || dadosCalculoShingle.area_telhado <= 0) {
        console.error('❌ [STEP-DEBUG] Área inválida:', dadosCalculoShingle.area_telhado);
        return;
      }
      
      console.log('🔄 [STEP-DEBUG] Executando calcularQuantitativosComerciais...');
      
      const resultado = await calcularQuantitativosComerciais(dadosCalculoShingle);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      const duracao = Date.now() - inicio;
      console.log(`⏱️ [STEP-DEBUG] Operação concluída em ${duracao}ms`);
      
      console.log('📊 [STEP-DEBUG] Resultado retornado do hook:', resultado);
      console.log('📊 [STEP-DEBUG] Tipo do resultado:', typeof resultado);
      console.log('📊 [STEP-DEBUG] É array?', Array.isArray(resultado));
      console.log('📊 [STEP-DEBUG] É null?', resultado === null);
      
      if (resultado && Array.isArray(resultado) && resultado.length > 0) {
        console.log('✅ [STEP-DEBUG] Resultado válido! Atualizando estados...');
        console.table(resultado);
        
        setQuantitativos(resultado);
        
        const total = resultado.reduce((sum, item) => {
          const valor = Number(item.valor_total) || 0;
          console.log(`💰 [STEP-DEBUG] Item ${item.codigo}: R$ ${valor}`);
          return sum + valor;
        }, 0);
        
        setValorTotal(total);
        console.log(`💰 [STEP-DEBUG] Valor total: R$ ${total.toFixed(2)}`);
        
        // Validar quantitativos e mostrar alertas se necessário
        const alertas = validarQuantitativos(resultado);
        if (alertas.length > 0) {
          console.warn('⚠️ [STEP-DEBUG] Alertas encontrados:', alertas);
        }
        
        console.log('🎯 [STEP-DEBUG] Processo concluído com sucesso!');
      } else {
        console.warn('⚠️ [STEP-DEBUG] Resultado inválido ou vazio');
        console.log('⚠️ [STEP-DEBUG] Resultado completo:', resultado);
        setQuantitativos([]);
        setValorTotal(0);
      }
    } catch (calcError) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      console.error('💥 [STEP-DEBUG] Erro durante cálculo:', calcError);
    } finally {
      setProcessando(false);
      calculoExecutadoRef.current = false;
      console.log('🏁 [STEP-DEBUG] === CÁLCULO FINALIZADO ===');
    }
  }, [dadosCalculoShingle, calcularQuantitativosComerciais, validarQuantitativos, clearError]);

  useEffect(() => {
    console.log('🔄 [StepValidarQuantitativos] useEffect disparado');
    console.log('📋 [StepValidarQuantitativos] dadosCalculoShingle alterados:', dadosCalculoShingle);
    
    // Limpar debounce anterior
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (dadosCalculoShingle?.area_telhado) {
      // IMPLEMENTAR DEBOUNCE para evitar execuções múltiplas
      debounceRef.current = setTimeout(() => {
        console.log('⏰ [StepValidarQuantitativos] Executando após debounce');
        calcularQuantitativos();
      }, 300); // 300ms de debounce
    } else {
      console.warn('⚠️ [StepValidarQuantitativos] Dados insuficientes para calcular');
      setInicializando(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      // Reset flag ao desmontar componente
      calculoExecutadoRef.current = false;
    };
  }, [calcularQuantitativos]);

  const handleApprove = useCallback(() => {
    console.log('✅ [STEP-DEBUG] Aprovando quantitativos:', quantitativos.length);
    onApprove(quantitativos);
  }, [quantitativos, onApprove]);

  const handleRetry = useCallback(() => {
    console.log('🔄 [STEP-DEBUG] Tentando novamente');
    // Reset flags e estados
    calculoExecutadoRef.current = false;
    setQuantitativos([]);
    setValorTotal(0);
    setInicializando(true);
    clearError();
    
    // Pequeno delay para garantir que estados foram resetados
    setTimeout(() => {
      calcularQuantitativos();
    }, 100);
  }, [calcularQuantitativos, clearError]);

  // Estados de loading
  if (inicializando || loading || processando) {
    console.log('⏳ [StepValidarQuantitativos] Renderizando estado de loading');
    const mensagem = inicializando 
      ? "Inicializando cálculo de quantitativos..."
      : processando 
        ? "Processando materiais e calculando quantidades..."
        : "Carregando dados...";
    
    const tempoDecorrido = tempoInicio > 0 ? Math.round((Date.now() - tempoInicio) / 1000) : 0;
    
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <h3 className="text-lg font-semibold mb-2">Calculando Quantitativos</h3>
          <p className="text-muted-foreground text-center mb-4">
            {mensagem}
          </p>
          {tempoDecorrido > 5 && (
            <p className="text-xs text-muted-foreground">
              Tempo decorrido: {tempoDecorrido}s
            </p>
          )}
          {tempoDecorrido > 15 && (
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          )}
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md mt-4">
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
                onClick={handleRetry}
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
                onClick={handleRetry}
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
