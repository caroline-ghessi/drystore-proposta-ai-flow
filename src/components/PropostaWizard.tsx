import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { StepSelector } from "./wizard/StepSelector"
import { StepDadosCompletosShingle } from "./wizard/StepDadosCompletosShingle"
import { StepValidarQuantitativos } from "./wizard/StepValidarQuantitativos"
import { StepGenerate } from "./wizard/StepGenerate"
import { StepUpload } from "./wizard/StepUpload"
import { StepProcessing } from "./wizard/StepProcessing"
import { StepReview } from "./wizard/StepReview"
import { StepCalculoSolar } from "./wizard/StepCalculoSolar"
import { StepCalculoDivisorias } from "./wizard/StepCalculoDivisorias"

export type TipoProposta = 'energia-solar' | 'telhas-shingle-supreme' | 'telhas-shingle-oakridge' | 'divisorias' | 'pisos' | 'forros' | 'materiais-construcao' | 'tintas-texturas' | 'verga-fibra' | 'argamassa-silentfloor' | 'light-steel-frame' | 'impermeabilizacao'

export interface PropostaData {
  tipoProposta: TipoProposta;
  clienteNome: string;
  clienteEmail: string;
  clienteWhatsapp?: string;
  clienteEndereco?: string;
  arquivo?: File;
  arquivoUrl?: string;
  dadosExtraidos?: any;
  valorTotal?: number;
  observacoes?: string;
  ocultar_precos_unitarios?: boolean;
  tipoSistema?: 'on-grid' | 'hibrido' | 'off-grid' | 'baterias_apenas';
  incluiBaterias?: boolean;
  entradaManual?: boolean;
  incluirVentilacao?: boolean;
  quantitativosAprovados?: any[];
  // Dados manuais para telhas
  areaTelhado?: number;
  inclinacaoTelhado?: number;
  tipoEstrutura?: string;
  // Dados específicos do sistema shingle selecionado
  tipoShingleSelecionado?: string;
  // Dimensões específicas para telhas shingle
  comprimentoCumeeira?: number;
  comprimentoEspigao?: number;
  comprimentoAguaFurtada?: number;
  perimetroTelhado?: number;
  corAcessorios?: string;
  incluirManta?: boolean;
  // Dados para impermeabilização
  areaImpermeabilizacao?: number;
  tipoSuperficie?: string;
  sistemaImpermeabilizacao?: string;
  // Dados para encontro com alvenaria
  temEncontroAlvenaria?: boolean;
  perimetroEncontroAlvenaria?: number;
}

interface PropostaWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: PropostaData) => Promise<void>;
}

// Fluxos simplificados
const STEPS_ENERGIA_SOLAR = [
  { title: "Tipo de Proposta", description: "Selecione energia solar" },
  { title: "Upload", description: "Conta de luz ou dados manuais" },
  { title: "Processamento", description: "Análise da conta" },
  { title: "Cálculo Solar", description: "Dimensionamento do sistema" },
  { title: "Revisão", description: "Confirme as informações" },
  { title: "Geração", description: "Criar proposta" }
]

// NOVO: Fluxo simplificado para telhas shingle - apenas 4 etapas
const STEPS_TELHAS_SHINGLE = [
  { title: "Sistema Shingle", description: "Supreme ou Oakridge" },
  { title: "Dados Completos", description: "Cliente e especificações técnicas" },
  { title: "Validar Quantitativos", description: "Revisar cálculos" },
  { title: "Geração", description: "Criar proposta" }
]

const STEPS_DIVISORIAS = [
  { title: "Tipo de Proposta", description: "Selecione divisórias" },
  { title: "Upload", description: "Envie projeto ou especificação" },
  { title: "Processamento", description: "Análise do documento" },
  { title: "Cálculo Divisórias", description: "Cálculo de materiais" },
  { title: "Revisão", description: "Confirme as informações" },
  { title: "Geração", description: "Criar proposta" }
]

const STEPS_DEFAULT = [
  { title: "Tipo de Proposta", description: "Selecione o tipo de sistema" },
  { title: "Upload", description: "Envie os documentos" },
  { title: "Processamento", description: "Análise dos dados" },
  { title: "Revisão", description: "Confirme as informações" },
  { title: "Geração", description: "Criar proposta" }
]

export function PropostaWizard({ open, onOpenChange, onComplete }: PropostaWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [propostaData, setPropostaData] = useState<PropostaData>({
    tipoProposta: 'energia-solar',
    clienteNome: '',
    clienteEmail: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingStepData, setPendingStepData] = useState<Partial<PropostaData> | null>(null)
  const shouldProceedToNext = useRef(false)

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepData = (data: Partial<PropostaData>) => {
    setPropostaData(prev => {
      const updated = { ...prev, ...data };
      console.log('PropostaWizard - Updating data:', data, 'New state:', updated);
      return updated;
    });
  }

  // Effect to handle state updates and proceed to next step when needed
  useEffect(() => {
    if (shouldProceedToNext.current && pendingStepData) {
      console.log('State updated, proceeding to next step with data:', propostaData);
      shouldProceedToNext.current = false;
      setPendingStepData(null);
      handleNext();
    }
  }, [propostaData])

  const handleReset = () => {
    setCurrentStep(0)
    setPropostaData({
      tipoProposta: 'energia-solar',
      clienteNome: '',
      clienteEmail: ''
    })
    setError(null)
    setIsProcessing(false)
  }

  const handleClose = () => {
    handleReset()
    onOpenChange(false)
  }

  const handleComplete = async () => {
    try {
      await onComplete(propostaData)
      handleClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao criar proposta')
    }
  }

  const getSteps = () => {
    switch (propostaData.tipoProposta) {
      case 'energia-solar':
        return STEPS_ENERGIA_SOLAR;
      case 'telhas-shingle-supreme':
      case 'telhas-shingle-oakridge':
        return STEPS_TELHAS_SHINGLE;
      case 'divisorias':
        return STEPS_DIVISORIAS;
      default:
        return STEPS_DEFAULT;
    }
  };
  
  const STEPS = getSteps();
  const progress = ((currentStep + 1) / STEPS.length) * 100

  // Funções auxiliares para determinar os dados de cálculo
  const getDadosCalculoShingle = () => {
    console.log('🔧 [PropostaWizard] getDadosCalculoShingle - propostaData:', propostaData);
    
    const dadosCalculoShingle = {
      area_telhado: propostaData.areaTelhado || 0,
      perimetro_telhado: propostaData.perimetroTelhado || 0,
      comprimento_cumeeira: propostaData.comprimentoCumeeira || 0,
      comprimento_espigao: propostaData.comprimentoEspigao || 0,
      comprimento_agua_furtada: propostaData.comprimentoAguaFurtada || 0,
      telha_codigo: propostaData.tipoShingleSelecionado || '1.16',
      cor_acessorios: propostaData.corAcessorios || 'CINZA',
      incluir_manta: propostaData.incluirManta ?? true,
      inclinacao_telhado: propostaData.inclinacaoTelhado || 18,
      tipo_estrutura: propostaData.tipoEstrutura || 'madeira'
    };

    console.log('🔧 [PropostaWizard] Dados calculados:', dadosCalculoShingle);
    return dadosCalculoShingle;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Nova Proposta - {STEPS[currentStep].title}</DialogTitle>
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              {STEPS.map((step, index) => (
                <div 
                  key={index} 
                  className={`flex items-center ${
                    index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs mr-2
                    ${index < currentStep ? 'bg-primary border-primary text-primary-foreground' : 
                      index === currentStep ? 'border-primary text-primary' : 'border-muted'}
                  `}>
                    {index + 1}
                  </div>
                  <span>{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-md mb-4">
              {error}
            </div>
          )}

          {/* ETAPA 0: Seleção do Tipo */}
          {currentStep === 0 && (
            <StepSelector
              tipoProposta={propostaData.tipoProposta}
              tipoShingleSelecionado={propostaData.tipoProposta === 'telhas-shingle-supreme' ? 'supreme' : 'oakridge'}
              onSelect={(tipo, tipoShingle) => {
                console.log('🎯 [StepSelector] Selecionado:', tipo, tipoShingle);
                handleStepData({ 
                  tipoProposta: tipo,
                  tipoShingleSelecionado: tipo === 'telhas-shingle-supreme' ? '1.16' : '1.17',
                  entradaManual: true // Para shingle, sempre manual
                });
              }}
              onNext={handleNext}
            />
          )}

          {/* FLUXO TELHAS SHINGLE SIMPLIFICADO */}
          {(propostaData.tipoProposta === 'telhas-shingle-supreme' || propostaData.tipoProposta === 'telhas-shingle-oakridge') && (
            <>
              {/* ETAPA 1: Dados Completos */}
              {currentStep === 1 && (
                <StepDadosCompletosShingle
                  data={propostaData}
                  onDataChange={handleStepData}
                  onBack={handleBack}
                  onNext={handleNext}
                />
              )}

              {/* ETAPA 2: Validar Quantitativos */}
              {currentStep === 2 && (
                <StepValidarQuantitativos
                  dadosCalculoShingle={getDadosCalculoShingle()}
                  onBack={handleBack}
                  onApprove={(quantitativos) => {
                    console.log('📊 [StepValidarQuantitativos] Quantitativos aprovados:', quantitativos);
                    handleStepData({ 
                      quantitativosAprovados: quantitativos,
                      dadosExtraidos: {
                        ...propostaData.dadosExtraidos,
                        quantitativos_calculados: quantitativos,
                        tipo_proposta_especifico: propostaData.tipoProposta
                      }
                    });
                    handleNext();
                  }}
                />
              )}

              {/* ETAPA 3: Geração */}
              {currentStep === 3 && (
                <StepGenerate
                  propostaData={propostaData}
                  onComplete={handleComplete}
                  onBack={handleBack}
                />
              )}
            </>
          )}

          {/* FLUXO ENERGIA SOLAR */}
          {propostaData.tipoProposta === 'energia-solar' && (
            <>
              {currentStep === 1 && (
                <StepUpload
                  tipoProposta={propostaData.tipoProposta}
                  onDataChange={handleStepData}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}

              {currentStep === 2 && (
                <StepProcessing
                  propostaData={propostaData}
                  isProcessing={isProcessing}
                  onProcessingChange={setIsProcessing}
                  onDataChange={handleStepData}
                  onNext={handleNext}
                  onBack={handleBack}
                  onError={setError}
                />
              )}

              {currentStep === 3 && (
                <StepCalculoSolar
                  propostaData={propostaData}
                  onDataChange={handleStepData}
                  onBack={handleBack}
                  onNext={handleNext}
                />
              )}

              {currentStep === 4 && (
                <StepReview
                  propostaData={propostaData}
                  onDataChange={handleStepData}
                  onBack={handleBack}
                  onComplete={handleComplete}
                />
              )}

              {currentStep === 5 && (
                <StepGenerate
                  propostaData={propostaData}
                  onComplete={handleComplete}
                  onBack={handleBack}
                />
              )}
            </>
          )}

          {/* FLUXO DIVISÓRIAS */}
          {propostaData.tipoProposta === 'divisorias' && (
            <>
              {currentStep === 1 && (
                <StepUpload
                  tipoProposta={propostaData.tipoProposta}
                  onDataChange={handleStepData}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}

              {currentStep === 2 && (
                <StepProcessing
                  propostaData={propostaData}
                  isProcessing={isProcessing}
                  onProcessingChange={setIsProcessing}
                  onDataChange={handleStepData}
                  onNext={handleNext}
                  onBack={handleBack}
                  onError={setError}
                />
              )}

              {currentStep === 3 && (
                <StepCalculoDivisorias
                  onDataChange={handleStepData}
                  onBack={handleBack}
                  onNext={handleNext}
                />
              )}

              {currentStep === 4 && (
                <StepReview
                  propostaData={propostaData}
                  onDataChange={handleStepData}
                  onBack={handleBack}
                  onComplete={handleComplete}
                />
              )}

              {currentStep === 5 && (
                <StepGenerate
                  propostaData={propostaData}
                  onComplete={handleComplete}
                  onBack={handleBack}
                />
              )}
            </>
          )}

          {/* FLUXO DEFAULT */}
          {!['energia-solar', 'telhas-shingle-supreme', 'telhas-shingle-oakridge', 'divisorias'].includes(propostaData.tipoProposta) && (
            <>
              {currentStep === 1 && (
                <StepUpload
                  tipoProposta={propostaData.tipoProposta}
                  onDataChange={handleStepData}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}

              {currentStep === 2 && (
                <StepProcessing
                  propostaData={propostaData}
                  isProcessing={isProcessing}
                  onProcessingChange={setIsProcessing}
                  onDataChange={handleStepData}
                  onNext={handleNext}
                  onBack={handleBack}
                  onError={setError}
                />
              )}

              {currentStep === 3 && (
                <StepReview
                  propostaData={propostaData}
                  onDataChange={handleStepData}
                  onBack={handleBack}
                  onComplete={handleComplete}
                />
              )}

              {currentStep === 4 && (
                <StepGenerate
                  propostaData={propostaData}
                  onComplete={handleComplete}
                  onBack={handleBack}
                />
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}