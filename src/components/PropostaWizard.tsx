import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { StepSelector } from "./wizard/StepSelector"
import { StepUpload } from "./wizard/StepUpload"
import { StepProcessing } from "./wizard/StepProcessing"
import { StepReview } from "./wizard/StepReview"

export type TipoProposta = 'energia-solar' | 'telhas' | 'divisorias' | 'pisos' | 'forros' | 'materiais-construcao'

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
}

interface PropostaWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: PropostaData) => Promise<void>;
}

const STEPS = [
  { title: "Tipo de Proposta", description: "Selecione o grupo de produtos" },
  { title: "Documento", description: "Faça upload do documento" },
  { title: "Processamento", description: "Extraindo informações" },
  { title: "Revisão", description: "Confirme os dados" }
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
    setPropostaData(prev => ({ ...prev, ...data }))
  }

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
              clienteNome={propostaData.clienteNome}
              clienteEmail={propostaData.clienteEmail}
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
        </div>
      </DialogContent>
    </Dialog>
  )
}