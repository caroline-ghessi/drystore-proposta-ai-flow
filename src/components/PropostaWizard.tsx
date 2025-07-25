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
import { StepVentilacaoConfirmacao } from "./wizard/StepVentilacaoConfirmacao"
import { StepGenerate } from "./wizard/StepGenerate"
import { StepCalculoDivisorias } from "./wizard/StepCalculoDivisorias"
import { StepValidarQuantitativos } from "./wizard/StepValidarQuantitativos"

export type TipoProposta = 'energia-solar' | 'telhas-shingle' | 'divisorias' | 'pisos' | 'forros' | 'materiais-construcao' | 'tintas-texturas' | 'verga-fibra' | 'argamassa-silentfloor' | 'light-steel-frame' | 'impermeabilizacao'

export type TipoShingleSelecionado = 'supreme' | 'oakridge';

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
  tipoShingleSelecionado?: TipoShingleSelecionado;
  // Dimensões específicas para telhas shingle (dados da etapa 3/4)
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
  { title: "Confirmação de Ventilação", description: "Incluir cálculo de ventilação?" },
  { title: "Ventilação do Telhado", description: "Cálculo de acessórios de ventilação" },
  { title: "Validar Quantitativos", description: "Conferir materiais calculados" },
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
      case 'telhas-shingle':
        if (propostaData.entradaManual) {
          let steps = [...STEPS_TELHAS_MANUAL];
          // Se não incluir ventilação, remover a etapa de ventilação
          if (propostaData.incluirVentilacao === false) {
            steps = steps.filter(step => step.title !== "Ventilação do Telhado");
          }
          return steps;
        }
        return STEPS_TELHAS_UPLOAD;
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
              tipoShingleSelecionado={propostaData.tipoShingleSelecionado}
              onSelect={(tipo, tipoShingle) => handleStepData({ 
                tipoProposta: tipo,
                tipoShingleSelecionado: tipoShingle
              })}
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
          {currentStep === 2 && propostaData.tipoProposta === 'telhas-shingle' && propostaData.entradaManual && (
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
           !(propostaData.tipoProposta === 'telhas-shingle' && propostaData.entradaManual) &&
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

          {/* Step 3: Review ou Cálculo Telhas Completo */}
          {currentStep === 3 && !(propostaData.tipoProposta === 'telhas-shingle' && propostaData.entradaManual) && (
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
          {currentStep === 3 && propostaData.tipoProposta === 'telhas-shingle' && propostaData.entradaManual && (
            <StepCalculoTelhasCompleto
              dadosExtraidos={{
                area_total_m2: propostaData.areaTelhado || 0,
                comprimento_cumeeira: 0,
                comprimento_espigao: 0,
                comprimento_agua_furtada: 0,
                perimetro_telhado: 0,
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
                    orcamento_completo: orcamento,
                    // ✅ CORREÇÃO: Salvar dimensões editadas pelo usuário
                    comprimento_cumeeira: orcamento.parametros?.comprimento_cumeeira || 0,
                    comprimento_espigao: orcamento.parametros?.comprimento_espigao || 0,
                    comprimento_agua_furtada: orcamento.parametros?.comprimento_agua_furtada || 0,
                    perimetro_telhado: orcamento.parametros?.perimetro_telhado || 0,
                  },
                  valorTotal: orcamento.valorTotal
                });
              }}
              onBack={handleBack}
              onNext={handleNext}
            />
          )}

          {/* Step 4: Confirmação de Ventilação - fluxo manual telhas */}
          {currentStep === 4 && propostaData.tipoProposta === 'telhas-shingle' && propostaData.entradaManual && (
            <StepVentilacaoConfirmacao
              onConfirm={(incluirVentilacao) => {
                handleStepData({ incluirVentilacao });
                handleNext();
              }}
              onBack={handleBack}
            />
          )}

          {/* Step 4: Cálculo Solar (outros fluxos) */}
          {currentStep === 4 && propostaData.tipoProposta === 'energia-solar' && (
            <StepCalculoSolar
              propostaData={propostaData}
              onDataChange={handleStepData}
              onBack={handleBack}
              onNext={handleNext}
            />
          )}

          {currentStep === 4 && propostaData.tipoProposta === 'telhas-shingle' && !propostaData.entradaManual && (
            <StepCalculoTelhasCompleto
              dadosExtraidos={propostaData.dadosExtraidos}
              onCalculoComplete={(orcamento) => {
                // CORREÇÃO: Salvar todos os dados da etapa 4 incluindo os parâmetros
                const dadosCompletos = {
                  ...propostaData.dadosExtraidos,
                  // Dados da etapa 4 (os valores que o usuário inseriu)
                  area_total_m2: orcamento.parametros?.area_telhado,
                  comprimento_cumeeira: orcamento.parametros?.comprimento_cumeeira,
                  comprimento_espigao: orcamento.parametros?.comprimento_espigao,
                  comprimento_agua_furtada: orcamento.parametros?.comprimento_agua_furtada,
                  perimetro_telhado: orcamento.parametros?.perimetro_telhado,
                  telha_codigo: orcamento.parametros?.telha_codigo,
                  incluir_manta: orcamento.parametros?.incluir_manta,
                  orcamento_completo: orcamento
                };
                
                handleStepData({
                  dadosExtraidos: dadosCompletos,
                  valorTotal: orcamento.valorTotal
                });
              }}
              onBack={handleBack}
              onNext={handleNext}
            />
          )}

          {/* Step 5: Cálculo de Ventilação - fluxo manual telhas (condicional) */}
          {currentStep === 5 && propostaData.tipoProposta === 'telhas-shingle' && propostaData.entradaManual && propostaData.incluirVentilacao && (
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

          {/* Validar Quantitativos - fluxo manual telhas */}
          {STEPS[currentStep]?.title === "Validar Quantitativos" && propostaData.tipoProposta === 'telhas-shingle' && propostaData.entradaManual && (
            <StepValidarQuantitativos
              dadosCalculoShingle={{
                // CORREÇÃO DEFINITIVA: Usar dados reais inseridos nas etapas anteriores
                area_telhado: propostaData.areaTelhado || propostaData.dadosExtraidos?.area_total_m2 || 0,
                // USAR DADOS MANUAIS SALVOS - principais correções aqui
                comprimento_cumeeira: propostaData.comprimentoCumeeira || propostaData.dadosExtraidos?.comprimento_cumeeira || 0,
                comprimento_espigao: propostaData.comprimentoEspigao || propostaData.dadosExtraidos?.comprimento_espigao || 0,
                comprimento_agua_furtada: propostaData.comprimentoAguaFurtada || propostaData.dadosExtraidos?.comprimento_agua_furtada || 0,
                perimetro_telhado: propostaData.perimetroTelhado || propostaData.dadosExtraidos?.perimetro_telhado || 0,
                // CORREÇÃO CRUCIAL: Usar o código correto baseado no tipo selecionado
                telha_codigo: propostaData.tipoShingleSelecionado === 'oakridge' ? '1.17' : '1.16',
                cor_acessorios: propostaData.corAcessorios || propostaData.dadosExtraidos?.cor_acessorios || 'CINZA',
                incluir_manta: propostaData.incluirManta ?? propostaData.dadosExtraidos?.incluir_manta ?? true
              }}
              onBack={handleBack}
              onApprove={(quantitativos) => {
                console.log('✅ Quantitativos aprovados:', quantitativos);
                console.log('💰 Valor total calculado:', quantitativos.reduce((sum, item) => sum + item.valor_total, 0));
                handleStepData({ 
                  quantitativosAprovados: quantitativos,
                  valorTotal: quantitativos.reduce((sum, item) => sum + item.valor_total, 0)
                });
                handleNext();
              }}
            />
          )}

          {/* Step Final: Gerar Proposta */}
          {STEPS[currentStep]?.title === "Gerar Proposta" && (
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
