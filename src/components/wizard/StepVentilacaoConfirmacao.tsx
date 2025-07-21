
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wind, CheckCircle, XCircle, Info } from "lucide-react"

interface StepVentilacaoConfirmacaoProps {
  onConfirm: (incluirVentilacao: boolean) => void
  onBack: () => void
}

export function StepVentilacaoConfirmacao({ onConfirm, onBack }: StepVentilacaoConfirmacaoProps) {
  const [selecao, setSelecao] = useState<boolean | null>(null)

  const handleConfirm = () => {
    if (selecao !== null) {
      onConfirm(selecao)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Cálculo de Ventilação</h2>
        <p className="text-muted-foreground">
          Deseja incluir o cálculo dos acessórios de ventilação do telhado?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Opção: Sim, calcular ventilação */}
        <Card 
          className={`cursor-pointer transition-all ${
            selecao === true ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'
          }`}
          onClick={() => setSelecao(true)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                selecao === true ? 'bg-primary text-primary-foreground' : 'bg-green-100 text-green-600'
              }`}>
                <CheckCircle className="w-5 h-5" />
              </div>
              Sim, calcular ventilação
            </CardTitle>
            <CardDescription>
              Incluir cálculo completo dos acessórios de ventilação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Ventilação adequada do sótão</span>
              </div>
              <div className="space-y-2">
                <Badge variant="outline" className="text-xs">
                  Cumeeira ventilada
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Ventilação de entrada
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Cálculo automático
                </Badge>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-xs text-green-700">
                  <strong>Recomendado:</strong> A ventilação adequada aumenta a vida útil do telhado e melhora o conforto térmico.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opção: Não, pular ventilação */}
        <Card 
          className={`cursor-pointer transition-all ${
            selecao === false ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'
          }`}
          onClick={() => setSelecao(false)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                selecao === false ? 'bg-primary text-primary-foreground' : 'bg-orange-100 text-orange-600'
              }`}>
                <XCircle className="w-5 h-5" />
              </div>
              Não, pular ventilação
            </CardTitle>
            <CardDescription>
              Gerar proposta apenas com telhas e acessórios básicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-orange-600" />
                <span className="text-sm">Proposta mais rápida</span>
              </div>
              <div className="space-y-2">
                <Badge variant="outline" className="text-xs">
                  Telhas Shingle
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Cumeeira básica
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Starter
                </Badge>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <p className="text-xs text-orange-700">
                  <strong>Nota:</strong> Poderá incluir ventilação posteriormente se necessário.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {selecao !== null && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-1">
                {selecao ? 'Ventilação será calculada' : 'Ventilação será omitida'}
              </h4>
              <p className="text-sm text-blue-700">
                {selecao 
                  ? 'Você poderá informar os dados do sótão na próxima etapa para calcular a ventilação adequada.'
                  : 'A proposta será gerada apenas com telhas e acessórios básicos de cobertura.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        
        <Button 
          onClick={handleConfirm}
          disabled={selecao === null}
          className="min-w-32"
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}
