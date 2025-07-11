import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Edit3, Calculator } from "lucide-react"
import { PropostaData } from "../PropostaWizard"
import { difyService } from "@/services/difyService"

interface StepReviewProps {
  propostaData: PropostaData;
  onDataChange: (data: Partial<PropostaData>) => void;
  onBack: () => void;
  onComplete: () => void;
}

const TIPO_LABELS = {
  'energia-solar': 'Energia Solar',
  'telhas': 'Telhas Shingle',
  'divisorias': 'Divisórias',
  'pisos': 'Pisos',
  'forros': 'Forros'
}

export function StepReview({ 
  propostaData, 
  onDataChange, 
  onBack, 
  onComplete 
}: StepReviewProps) {
  const [editandoCliente, setEditandoCliente] = useState(false)
  const [editandoValor, setEditandoValor] = useState(false)

  const dadosFormatados = propostaData.dadosExtraidos 
    ? difyService.formatarDadosParaExibicao(propostaData.dadosExtraidos, propostaData.tipoProposta)
    : {}

  const handleValorChange = (novoValor: string) => {
    const valor = parseFloat(novoValor.replace(/[^\d.,]/g, '').replace(',', '.'))
    if (!isNaN(valor)) {
      onDataChange({ valorTotal: valor })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Revisar Proposta</h3>
        <p className="text-muted-foreground">
          Confirme os dados extraídos e complete as informações necessárias
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados Extraídos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Dados Extraídos
              <Badge variant="secondary">{TIPO_LABELS[propostaData.tipoProposta]}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(dadosFormatados).map(([chave, valor]) => (
                <div key={chave} className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {chave}:
                  </span>
                  <span className="text-sm font-medium text-right">
                    {valor || 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dados do Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Dados do Cliente
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditandoCliente(!editandoCliente)}
              >
                {editandoCliente ? 'Salvar' : 'Editar'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="review-nome">Nome Completo</Label>
              <Input
                id="review-nome"
                value={propostaData.clienteNome}
                onChange={(e) => onDataChange({ clienteNome: e.target.value })}
                disabled={!editandoCliente}
              />
            </div>

            <div>
              <Label htmlFor="review-email">Email</Label>
              <Input
                id="review-email"
                value={propostaData.clienteEmail}
                onChange={(e) => onDataChange({ clienteEmail: e.target.value })}
                disabled={!editandoCliente}
              />
            </div>

            <div>
              <Label htmlFor="review-whatsapp">WhatsApp</Label>
              <Input
                id="review-whatsapp"
                value={propostaData.clienteWhatsapp || ''}
                onChange={(e) => onDataChange({ clienteWhatsapp: e.target.value })}
                disabled={!editandoCliente}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <Label htmlFor="review-endereco">Endereço</Label>
              <Input
                id="review-endereco"
                value={propostaData.clienteEndereco || ''}
                onChange={(e) => onDataChange({ clienteEndereco: e.target.value })}
                disabled={!editandoCliente}
                placeholder="Endereço completo"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Valor e Observações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Valor da Proposta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valor-total">Valor Total</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="valor-total"
                  value={propostaData.valorTotal?.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }) || ''}
                  onChange={(e) => handleValorChange(e.target.value)}
                  disabled={!editandoValor}
                  placeholder="R$ 0,00"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditandoValor(!editandoValor)}
                >
                  {editandoValor ? 'OK' : 'Editar'}
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={propostaData.observacoes || ''}
              onChange={(e) => onDataChange({ observacoes: e.target.value })}
              placeholder="Informações adicionais sobre a proposta..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Resumo Final */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h4 className="font-semibold text-lg">Resumo da Proposta</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Cliente:</span>
                <p className="font-medium">{propostaData.clienteNome}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tipo:</span>
                <p className="font-medium">{TIPO_LABELS[propostaData.tipoProposta]}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Valor:</span>
                <p className="font-medium text-lg text-primary">
                  {propostaData.valorTotal?.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }) || 'A calcular'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className="font-medium text-green-600">Pronta para envio</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button 
          onClick={onComplete}
          disabled={!propostaData.clienteNome || !propostaData.clienteEmail}
          className="bg-primary hover:bg-primary/90"
        >
          Criar Proposta
        </Button>
      </div>
    </div>
  )
}