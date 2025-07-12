import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Loader2, AlertCircle, FileText, Zap } from "lucide-react"
import { PropostaData } from "../PropostaWizard"
import { difyService } from "@/services/difyService"

interface StepProcessingProps {
  propostaData: PropostaData;
  isProcessing: boolean;
  onProcessingChange: (processing: boolean) => void;
  onDataChange: (data: Partial<PropostaData>) => void;
  onNext: () => void;
  onBack: () => void;
  onError: (error: string) => void;
}

const PROCESSING_STEPS = [
  { label: "Upload concluído", icon: CheckCircle },
  { label: "Analisando documento", icon: FileText },
  { label: "Extraindo dados", icon: Zap },
  { label: "Calculando valores", icon: CheckCircle },
]

export function StepProcessing({
  propostaData,
  isProcessing,
  onProcessingChange,
  onDataChange,
  onNext,
  onBack,
  onError
}: StepProcessingProps) {
  useEffect(() => {
    const processDocument = async () => {
      if (!propostaData.arquivoUrl || isProcessing) return

      try {
        onProcessingChange(true)
        onError('')

        let result: any;

        // Para energia solar, usar processamento específico de conta de luz
        if (propostaData.tipoProposta === 'energia-solar') {
          const contaLuzResult = await difyService.processarContaLuz(
            propostaData.arquivoUrl,
            propostaData.clienteNome,
            propostaData.clienteEmail,
            propostaData.tipoSistema,
            propostaData.incluiBaterias
          )

          if (!contaLuzResult.sucesso) {
            throw new Error(contaLuzResult.erro || 'Erro no processamento da conta de luz')
          }

          // Usar os dados extraídos diretamente
          result = contaLuzResult.dados
        } else {
          // Para outros tipos, usar processamento padrão
          result = await difyService.processarDocumento(
            propostaData.arquivoUrl,
            propostaData.tipoProposta,
            propostaData.clienteNome,
            propostaData.clienteEmail
          )
        }

        // Validar dados extraídos
        const validation = difyService.validarDadosExtraidos(
          result,
          propostaData.tipoProposta
        )

        if (!validation.valid) {
          throw new Error(`Erro na validação: ${validation.errors.join(', ')}`)
        }

        // Para energia solar, usar a estrutura correta
        if (propostaData.tipoProposta === 'energia-solar') {
          // result já vem como DadosContaLuz diretamente da edge function
          console.log('Dados da conta de luz extraídos:', result);
          onDataChange({
            dadosExtraidos: result
            // Não definir valorTotal aqui - será definido no StepCalculoSolar
          })
        } else {
          onDataChange({
            dadosExtraidos: result.dados_extraidos,
            valorTotal: result.valor_total
          })
        }

        // Aguardar um pouco para mostrar o progresso
        setTimeout(() => {
          onProcessingChange(false)
          onNext()
        }, 1500)

      } catch (error) {
        onProcessingChange(false)
        const errorMessage = error instanceof Error ? error.message : 'Erro no processamento'
        onError(errorMessage)
        console.error('Erro no processamento:', error)
      }
    }

    processDocument()
  }, [propostaData.arquivoUrl])

  const getStepStatus = (index: number) => {
    if (!isProcessing) return 'pending'
    if (index === 0) return 'completed'
    if (index <= 2) return 'processing'
    return 'pending'
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Processando Documento</h3>
        <p className="text-muted-foreground">
          Aguarde enquanto extraímos os dados e calculamos a proposta
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Análise em Andamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isProcessing && (
            <div className="space-y-4">
              <Progress value={75} className="w-full" />
              <div className="space-y-3">
                {PROCESSING_STEPS.map((step, index) => {
                  const status = getStepStatus(index)
                  const IconComponent = step.icon

                  return (
                    <div key={index} className="flex items-center gap-3">
                      {status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : status === 'processing' ? (
                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted" />
                      )}
                      <span className={`
                        ${status === 'completed' ? 'text-green-700' : 
                          status === 'processing' ? 'text-primary font-medium' : 
                          'text-muted-foreground'}
                      `}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {!isProcessing && propostaData.dadosExtraidos && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Processamento concluído!</span>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800">
                  Dados extraídos com sucesso. Você será redirecionado para revisar as informações.
                </p>
              </div>
            </div>
          )}

          {!isProcessing && !propostaData.dadosExtraidos && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Erro no processamento</span>
              </div>
              <div className="bg-destructive/10 p-4 rounded-lg">
                <p className="text-sm text-destructive">
                  Não foi possível processar o documento. Verifique se o arquivo está correto e tente novamente.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          Voltar
        </Button>
        {!isProcessing && !propostaData.dadosExtraidos && (
          <Button variant="outline" onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        )}
      </div>
    </div>
  )
}