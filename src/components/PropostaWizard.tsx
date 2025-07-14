import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { StepSelector } from "./wizard/StepSelector"
import { StepUpload } from "./wizard/StepUpload"
import { StepProcessing } from "./wizard/StepProcessing"
import { StepReview } from "./wizard/StepReview"
import { StepCalculoSolar } from "./wizard/StepCalculoSolar"
import { StepCalculoTelhas } from "./wizard/StepCalculoTelhas"
import { StepCalculoTelhasCompleto } from "./wizard/StepCalculoTelhasCompleto"
import { StepDadosManuaisTelhas } from "./wizard/StepDadosManuaisTelhas"
import { StepCalculoVentilacao } from "./wizard/StepCalculoVentilacao"
import { StepGenerate } from "./wizard/StepGenerate"
import { StepCalculoDivisorias } from "./wizard/StepCalculoDivisorias"

export type TipoProposta = 'energia-solar' | 'telhas' | 'divisorias' | 'pisos' | 'forros' | 'materiais-construcao' | 'tintas-texturas' | 'verga-fibra' | 'argamassa-silentfloor' | 'light-steel-frame' | 'impermeabilizacao'

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
  // Dados manuais para telhas
  areaTelhado?: number;
  inclinacaoTelhado?: number;
  tipoEstrutura?: string;
  // Dados para impermeabilização
  areaImpermeabilizacao?: number;
  tipoSuperficie?: string;
  sistemaImpermeabilizacao?: string;
}

interface PropostaWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: PropostaData) => Promise<void>;
}

const STEPS_DEFAULT = [
  { title: "Tipo de Proposta", description: "Selecione o tipo de proposta" },
  { title: "Upload de PDF", description: "Envie o documento" },
  { title: "Extração de Dados", description: "Processamento automático" },
  { title: "Validar Dados", description: "Revisar e completar informações" },
  { title: "Gerar Proposta", description: "Confirmar e criar proposta" }
]

const STEPS_ENERGIA_SOLAR = [
  { title: "Tipo de Proposta", description: "Selecione o tipo de proposta" },
  { title: "Upload da Conta de Luz", description: "Envie a conta de luz" },
  { title: "Extração de Dados", description: "Processamento automático" },
  { title: "Confirmação dos Dados", description: "Validar dados do cliente" },
  { title: "Cálculos da Usina Solar", description: "Dimensionamento automático" },
  { title: "Gerar Proposta", description: "Confirmar e criar proposta" }
]

const STEPS_TELHAS_UPLOAD = [
  { title: "Tipo de Proposta", description: "Selecione o tipo de proposta" },
  { title: "Upload de Especificações", description: "Envie as especificações" },
  { title: "Extração de Dados", description: "Processamento automático" },
  { title: "Confirmação dos Dados", description: "Validar dados do cliente" },
  { title: "Cálculos de Cobertura", description: "Dimensionamento automático" },
  { title: "Gerar Proposta", description: "Confirmar e criar proposta" }
]

const STEPS_TELHAS_MANUAL = [
  { title: "Tipo de Proposta", description: "Selecione o tipo de proposta" },
  { title: "Entrada de Dados", description: "Upload ou dados manuais" },
  { title: "Dados do Cliente", description: "Informações do projeto" },
  { title: "Cálculos de Cobertura", description: "Dimensionamento automático" },
  { title: "Ventilação do Telhado", description: "Cálculo de acessórios de ventilação" },
  { title: "Gerar Proposta", description: "Confirmar e criar proposta" }
]

const STEPS_DIVISORIAS_UPLOAD = [
  { title: "Tipo de Proposta", description: "Selecione o tipo de proposta" },
  { title: "Upload de PDF", description: "Envie a planta baixa" },
  { title: "Extração de Dados", description: "Processamento automático" },
  { title: "Confirmação dos Dados", description: "Validar dados do cliente" },
  { title: "Gerar Proposta", description: "Confirmar e criar proposta" }
]

const STEPS_DIVISORIAS_MANUAL = [
  { title: "Tipo de Proposta", description: "Selecione o tipo de proposta" },
  { title: "Entrada de Dados", description: "Upload ou dados manuais" },
  { title: "Cálculo do Drywall", description: "Dimensionamento automático" },
  { title: "Gerar Proposta", description: "Confirmar e criar proposta" }
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
      case 'telhas':
        return propostaData.entradaManual ? STEPS_TELHAS_MANUAL : STEPS_TELHAS_UPLOAD;
      case 'divisorias':
        return propostaData.entradaManual ? STEPS_DIVISORIAS_MANUAL : STEPS_DIVISORIAS_UPLOAD;
      default:
        return STEPS_DEFAULT;
    }
  };
  
  const STEPS = getSteps();
  const progress = ((currentStep + 1) / STEPS.length) * 100

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

          {currentStep === 0 && (
            <StepSelector
              tipoProposta={propostaData.tipoProposta}
              onSelect={(tipo) => handleStepData({ tipoProposta: tipo })}
              onNext={handleNext}
            />
          )}

          {currentStep === 1 && (
            <StepUpload
              tipoProposta={propostaData.tipoProposta}
              onDataChange={handleStepData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {/* Step 2: Processing ou Dados Manuais */}
          {currentStep === 2 && propostaData.tipoProposta === 'telhas' && propostaData.entradaManual && (
            <StepDadosManuaisTelhas
              data={propostaData}
              onDataChange={handleStepData}
              onBack={handleBack}
              onNext={handleNext}
            />
          )}

          {currentStep === 2 && propostaData.tipoProposta === 'divisorias' && propostaData.entradaManual && (
            <StepCalculoDivisorias
              onDataChange={handleStepData}
              onBack={handleBack}
              onNext={handleNext}
            />
          )}

          {currentStep === 2 && 
           !(propostaData.tipoProposta === 'telhas' && propostaData.entradaManual) &&
           !(propostaData.tipoProposta === 'divisorias' && propostaData.entradaManual) && (
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

          {/* Step 3: Review - fluxo normal ou após processing */}
          {currentStep === 3 && !(propostaData.tipoProposta === 'telhas' && propostaData.entradaManual) && (
            <StepReview
              propostaData={propostaData}
              onDataChange={handleStepData}
              onBack={handleBack}
              onComplete={(options) => {
                console.log('StepReview completed with options:', options);
                
                if (options?.dadosCompletos) {
                  const updateData = {
                    ...options.dadosCompletos,
                    ocultar_precos_unitarios: options.ocultarPrecosUnitarios
                  };
                  setPendingStepData(updateData);
                  shouldProceedToNext.current = true;
                  handleStepData(updateData);
                } else {
                  if (options?.ocultarPrecosUnitarios !== undefined) {
                    handleStepData({ ocultar_precos_unitarios: options.ocultarPrecosUnitarios });
                  }
                  handleNext();
                }
              }}
            />
          )}

          {/* Step 3: Cálculo Telhas Completo - fluxo manual */}
          {currentStep === 3 && propostaData.tipoProposta === 'telhas' && propostaData.entradaManual && (
            <StepCalculoTelhasCompleto
              dadosExtraidos={{
                area_total_m2: propostaData.areaTelhado || 0,
                comprimento_cumeeira: 0,
                perimetro_telhado: 0,
                comprimento_calha: 0,
                observacoes_especiais: propostaData.observacoes
              }}
              onCalculoComplete={(orcamento) => {
                handleStepData({
                  dadosExtraidos: {
                    area_total_m2: propostaData.areaTelhado,
                    inclinacao_telhado: propostaData.inclinacaoTelhado,
                    tipo_estrutura: propostaData.tipoEstrutura,
                    regiao_climatica: 'Sul',
                    cor_preferida: 'Marrom',
                    observacoes_especiais: propostaData.observacoes,
                    orcamento_completo: orcamento
                  },
                  valorTotal: orcamento.valorTotal
                });
              }}
              onBack={handleBack}
              onNext={handleNext}
            />
          )}

          {/* Step 4: Cálculo de Ventilação - fluxo manual telhas */}
          {currentStep === 4 && propostaData.tipoProposta === 'telhas' && propostaData.entradaManual && (
            <StepCalculoVentilacao
              areaTelhado={propostaData.areaTelhado || 0}
              onVentilacaoComplete={(dadosVentilacao) => {
                handleStepData({
                  dadosExtraidos: {
                    ...propostaData.dadosExtraidos,
                    ventilacao: dadosVentilacao
                  }
                });
                handleNext();
              }}
              onBack={handleBack}
            />
          )}

          {/* Step 4: Cálculo Solar ou Telhas (fluxo normal) */}
          {currentStep === 4 && propostaData.tipoProposta === 'energia-solar' && (
            <StepCalculoSolar
              propostaData={propostaData}
              onDataChange={handleStepData}
              onBack={handleBack}
              onNext={handleNext}
            />
          )}

          {currentStep === 4 && propostaData.tipoProposta === 'telhas' && !propostaData.entradaManual && (
            <StepCalculoTelhasCompleto
              dadosExtraidos={propostaData.dadosExtraidos}
              onCalculoComplete={(orcamento) => {
                handleStepData({
                  dadosExtraidos: {
                    ...propostaData.dadosExtraidos,
                    orcamento_completo: orcamento
                  },
                  valorTotal: orcamento.valorTotal
                });
              }}
              onBack={handleBack}
              onNext={handleNext}
            />
          )}

          {/* Step Final: Gerar Proposta */}
          {((currentStep === 3 && propostaData.tipoProposta === 'divisorias' && propostaData.entradaManual) ||
            (currentStep === 4 && propostaData.tipoProposta === 'divisorias' && !propostaData.entradaManual) ||
            (currentStep === 5 && propostaData.tipoProposta === 'energia-solar') ||
            (currentStep === 5 && propostaData.tipoProposta === 'telhas' && propostaData.entradaManual) ||
            (currentStep === 5 && propostaData.tipoProposta === 'telhas' && !propostaData.entradaManual)) && (
            <StepGenerate
              propostaData={propostaData}
              onBack={handleBack}
              onComplete={handleComplete}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}