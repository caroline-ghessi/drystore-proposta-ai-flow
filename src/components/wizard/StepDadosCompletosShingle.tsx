import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { User, Home, MapPin, Phone, Mail, Building, Ruler, Package } from "lucide-react"
import { PropostaData } from "../PropostaWizard"
import { SistemaShingleSelector } from "./SistemaShingleSelector"
import { useTelhasShingleCompleto } from "@/hooks/useTelhasShingleCompleto"

interface StepDadosCompletosShingleProps {
  onDataChange: (data: Partial<PropostaData>) => void;
  onNext: () => void;
  onBack: () => void;
  data: Partial<PropostaData>;
}

export function StepDadosCompletosShingle({ 
  onDataChange, 
  onNext, 
  onBack, 
  data 
}: StepDadosCompletosShingleProps) {
  const { sistemasDisponiveis, loading: sistemaLoading } = useTelhasShingleCompleto()
  
  const [formData, setFormData] = useState({
    // Dados do Cliente
    clienteNome: data.clienteNome || '',
    clienteEmail: data.clienteEmail || '',
    clienteWhatsapp: data.clienteWhatsapp || '',
    clienteEndereco: data.clienteEndereco || '',
    
    // Especificações Técnicas
    areaTelhado: data.areaTelhado || 0,
    perimetroTelhado: data.perimetroTelhado || 0,
    inclinacaoTelhado: data.inclinacaoTelhado || 18,
    comprimentoCumeeira: data.comprimentoCumeeira || 0,
    comprimentoEspigao: data.comprimentoEspigao || 0,
    comprimentoAguaFurtada: data.comprimentoAguaFurtada || 0,
    
    // Configurações
    tipoShingleSelecionado: data.tipoShingleSelecionado || '1.16',
    corAcessorios: data.corAcessorios || 'CINZA',
    tipoEstrutura: data.tipoEstrutura || '',
    incluirManta: data.incluirManta ?? true,
    incluirCumeeiraVentilada: data.incluirCumeeiraVentilada ?? false,
    temEncontroAlvenaria: data.temEncontroAlvenaria ?? false,
    perimetroEncontroAlvenaria: data.perimetroEncontroAlvenaria || 0,
    observacoes: data.observacoes || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validação dados do cliente
    if (!formData.clienteNome.trim()) {
      newErrors.clienteNome = 'Nome é obrigatório'
    }
    if (!formData.clienteEmail.trim()) {
      newErrors.clienteEmail = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.clienteEmail)) {
      newErrors.clienteEmail = 'Email inválido'
    }

    // Validação técnica
    if (!formData.areaTelhado || formData.areaTelhado <= 0) {
      newErrors.areaTelhado = 'Área do telhado é obrigatória'
    }
    if (!formData.perimetroTelhado || formData.perimetroTelhado <= 0) {
      newErrors.perimetroTelhado = 'Perímetro do telhado é obrigatório'
    }
    if (formData.inclinacaoTelhado > 0 && formData.inclinacaoTelhado < 18) {
      newErrors.inclinacaoTelhado = 'Inclinação mínima para telhas shingle é de 18%'
    }
    if (!formData.tipoShingleSelecionado) {
      newErrors.tipoShingleSelecionado = 'Selecione o sistema de telhas'
    }
    if (formData.temEncontroAlvenaria && (!formData.perimetroEncontroAlvenaria || formData.perimetroEncontroAlvenaria <= 0)) {
      newErrors.perimetroEncontroAlvenaria = 'Perímetro de encontro com alvenaria é obrigatório quando habilitado'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof typeof formData, value: string | number | boolean) => {
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
      console.log('📋 [StepDadosCompletos] Dados validados:', formData)
      onNext()
    }
  }

  // Atualizar dados quando prop data mudar
  useEffect(() => {
    if (data) {
      setFormData(prev => ({ ...prev, ...data }))
    }
  }, [data])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">
          Dados Completos - Telhas Shingle
        </h3>
        <p className="text-muted-foreground">
          Todas as informações necessárias para gerar sua proposta
        </p>
      </div>

      <div className="grid gap-6 max-w-4xl mx-auto">
        {/* Seleção do Sistema Shingle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Sistema de Telhas Shingle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <SistemaShingleSelector
                sistemas={sistemasDisponiveis}
                sistemaSelecionado={formData.tipoShingleSelecionado}
                onSelecionarSistema={(codigo) => handleInputChange('tipoShingleSelecionado', codigo)}
                loading={sistemaLoading}
              />
              {errors.tipoShingleSelecionado && (
                <p className="text-sm text-red-500">{errors.tipoShingleSelecionado}</p>
              )}
            </div>
          </CardContent>
        </Card>

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
              <Ruler className="h-5 w-5" />
              Dimensões do Telhado
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
                <Label htmlFor="perimetro">Perímetro (m) *</Label>
                <Input
                  id="perimetro"
                  type="number"
                  value={formData.perimetroTelhado || ''}
                  onChange={(e) => handleInputChange('perimetroTelhado', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 232.17"
                  min="1"
                  step="0.01"
                  className={errors.perimetroTelhado ? 'border-red-500' : ''}
                />
                {errors.perimetroTelhado && (
                  <p className="text-sm text-red-500 mt-1">{errors.perimetroTelhado}</p>
                )}
              </div>

              <div>
                <Label htmlFor="inclinacao">Inclinação (%) *</Label>
                <Input
                  id="inclinacao"
                  type="number"
                  value={formData.inclinacaoTelhado || ''}
                  onChange={(e) => handleInputChange('inclinacaoTelhado', parseFloat(e.target.value) || 0)}
                  placeholder="Mínimo: 18%"
                  min="18"
                  max="100"
                  step="1"
                  className={errors.inclinacaoTelhado ? 'border-red-500' : ''}
                />
                {errors.inclinacaoTelhado && (
                  <p className="text-sm text-red-500 mt-1">{errors.inclinacaoTelhado}</p>
                )}
              </div>
            </div>

            {/* Dimensões Específicas */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Dimensões Específicas</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cumeeira">Cumeeira (m)</Label>
                  <Input
                    id="cumeeira"
                    type="number"
                    value={formData.comprimentoCumeeira || ''}
                    onChange={(e) => handleInputChange('comprimentoCumeeira', parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 45"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Comprimento da cumeeira (linha de topo)
                  </p>
                </div>

                <div>
                  <Label htmlFor="espigao">Espigão (m)</Label>
                  <Input
                    id="espigao"
                    type="number"
                    value={formData.comprimentoEspigao || ''}
                    onChange={(e) => handleInputChange('comprimentoEspigao', parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 0"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Comprimento do espigão (se houver)
                  </p>
                </div>

                <div>
                  <Label htmlFor="aguaFurtada">Água Furtada (m)</Label>
                  <Input
                    id="aguaFurtada"
                    type="number"
                    value={formData.comprimentoAguaFurtada || ''}
                    onChange={(e) => handleInputChange('comprimentoAguaFurtada', parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 0"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Comprimento de água furtada (se houver)
                  </p>
                </div>
              </div>
            </div>

            {/* Configurações */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Configurações</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="corAcessorios">Cor dos Acessórios</Label>
                  <Select 
                    value={formData.corAcessorios} 
                    onValueChange={(value) => handleInputChange('corAcessorios', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a cor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CINZA">Cinza</SelectItem>
                      <SelectItem value="PRETO">Preto</SelectItem>
                      <SelectItem value="MARROM">Marrom</SelectItem>
                      <SelectItem value="VERDE">Verde</SelectItem>
                    </SelectContent>
                  </Select>
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

              <div className="mt-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="incluirManta"
                    checked={formData.incluirManta}
                    onCheckedChange={(checked) => handleInputChange('incluirManta', checked)}
                  />
                  <Label htmlFor="incluirManta">Incluir manta starter</Label>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="incluirCumeeiraVentilada"
                      checked={formData.incluirCumeeiraVentilada}
                      onCheckedChange={(checked) => handleInputChange('incluirCumeeiraVentilada', checked)}
                    />
                    <Label htmlFor="incluirCumeeiraVentilada">Incluir cumeeira ventilada</Label>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    Sistema de ventilação para controle de umidade no sótão. Recomendado para melhor circulação de ar.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="temEncontroAlvenaria"
                      checked={formData.temEncontroAlvenaria}
                      onCheckedChange={(checked) => handleInputChange('temEncontroAlvenaria', checked)}
                    />
                    <Label htmlFor="temEncontroAlvenaria">Há encontro com alvenaria?</Label>
                  </div>
                  
                  {formData.temEncontroAlvenaria && (
                    <div>
                      <Label htmlFor="perimetroEncontroAlvenaria">Perímetro de encontro com alvenaria (m) *</Label>
                      <Input
                        id="perimetroEncontroAlvenaria"
                        type="number"
                        value={formData.perimetroEncontroAlvenaria || ''}
                        onChange={(e) => handleInputChange('perimetroEncontroAlvenaria', parseFloat(e.target.value) || 0)}
                        placeholder="Ex: 15.5"
                        min="0"
                        step="0.01"
                        className={errors.perimetroEncontroAlvenaria ? 'border-red-500' : ''}
                      />
                      {errors.perimetroEncontroAlvenaria && (
                        <p className="text-sm text-red-500 mt-1">{errors.perimetroEncontroAlvenaria}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Medida linear onde o telhado encontra com paredes, muros ou outras alvenarias
                      </p>
                    </div>
                  )}
                </div>
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
                  <li>• <strong>Obrigatório:</strong> As telhas shingle exigem inclinação mínima de 18%</li>
                  <li>• O cálculo incluirá automaticamente margem de segurança de 5%</li>
                  <li>• Cumeeira, espigão e água furtada são opcionais mas melhoram a precisão</li>
                  <li>• <strong>Encontro com alvenaria:</strong> Necessário para calcular bobina de step flash</li>
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
          Calcular Quantitativos
        </Button>
      </div>
    </div>
  )
}