import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Home, MapPin, Phone, Mail, Building } from "lucide-react"
import { PropostaData } from "../PropostaWizard"

interface StepDadosManuaisTelhasProps {
  onDataChange: (data: Partial<PropostaData>) => void;
  onNext: () => void;
  onBack: () => void;
  data: Partial<PropostaData>;
}

export function StepDadosManuaisTelhas({ 
  onDataChange, 
  onNext, 
  onBack, 
  data 
}: StepDadosManuaisTelhasProps) {
  const [formData, setFormData] = useState({
    clienteNome: data.clienteNome || '',
    clienteEmail: data.clienteEmail || '',
    clienteWhatsapp: data.clienteWhatsapp || '',
    clienteEndereco: data.clienteEndereco || '',
    areaTelhado: data.areaTelhado || 0,
    inclinacaoTelhado: data.inclinacaoTelhado || 0,
    tipoEstrutura: data.tipoEstrutura || '',
    observacoes: data.observacoes || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.clienteNome.trim()) {
      newErrors.clienteNome = 'Nome é obrigatório'
    }
    if (!formData.clienteEmail.trim()) {
      newErrors.clienteEmail = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.clienteEmail)) {
      newErrors.clienteEmail = 'Email inválido'
    }
    if (!formData.areaTelhado || formData.areaTelhado <= 0) {
      newErrors.areaTelhado = 'Área do telhado é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
    onDataChange(newFormData)
    
    // Limpar erro do campo quando usuário digita
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">
          Dados da Proposta - Telhas Shingle
        </h3>
        <p className="text-muted-foreground">
          Insira as informações do cliente e especificações técnicas
        </p>
      </div>

      <div className="grid gap-6 max-w-4xl mx-auto">
        {/* Dados do Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.clienteNome}
                  onChange={(e) => handleInputChange('clienteNome', e.target.value)}
                  placeholder="Ex: João Silva"
                  className={errors.clienteNome ? 'border-red-500' : ''}
                />
                {errors.clienteNome && (
                  <p className="text-sm text-red-500 mt-1">{errors.clienteNome}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.clienteEmail}
                    onChange={(e) => handleInputChange('clienteEmail', e.target.value)}
                    placeholder="joao@email.com"
                    className={`pl-10 ${errors.clienteEmail ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.clienteEmail && (
                  <p className="text-sm text-red-500 mt-1">{errors.clienteEmail}</p>
                )}
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <div className="relative">
                  <Phone className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="whatsapp"
                    value={formData.clienteWhatsapp}
                    onChange={(e) => handleInputChange('clienteWhatsapp', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="endereco">Endereço</Label>
                <div className="relative">
                  <MapPin className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="endereco"
                    value={formData.clienteEndereco}
                    onChange={(e) => handleInputChange('clienteEndereco', e.target.value)}
                    placeholder="Rua, número, bairro, cidade"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Especificações Técnicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Especificações Técnicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="area">Área do Telhado (m²) *</Label>
                <Input
                  id="area"
                  type="number"
                  value={formData.areaTelhado || ''}
                  onChange={(e) => handleInputChange('areaTelhado', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 120"
                  min="1"
                  step="0.01"
                  className={errors.areaTelhado ? 'border-red-500' : ''}
                />
                {errors.areaTelhado && (
                  <p className="text-sm text-red-500 mt-1">{errors.areaTelhado}</p>
                )}
              </div>

              <div>
                <Label htmlFor="inclinacao">Inclinação (%)</Label>
                <Input
                  id="inclinacao"
                  type="number"
                  value={formData.inclinacaoTelhado || ''}
                  onChange={(e) => handleInputChange('inclinacaoTelhado', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 30"
                  min="0"
                  max="100"
                  step="1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Opcional - para correção da área
                </p>
              </div>

              <div>
                <Label htmlFor="estrutura">Tipo de Estrutura</Label>
                <Select 
                  value={formData.tipoEstrutura} 
                  onValueChange={(value) => handleInputChange('tipoEstrutura', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="madeira">Madeira</SelectItem>
                    <SelectItem value="metalica">Metálica</SelectItem>
                    <SelectItem value="concreto">Concreto</SelectItem>
                    <SelectItem value="mista">Mista</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder="Informações adicionais sobre o projeto, preferências de cor, detalhes específicos..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações Importantes */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Home className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Informações Importantes</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• A área informada deve ser a área real do telhado</li>
                  <li>• A inclinação ajuda no cálculo mais preciso do material</li>
                  <li>• As telhas shingle são indicadas para inclinações de 18% a 85%</li>
                  <li>• O cálculo incluirá automaticamente margem de segurança de 5%</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button onClick={handleNext}>
          Calcular Orçamento
        </Button>
      </div>
    </div>
  )
}