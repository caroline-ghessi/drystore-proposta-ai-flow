import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { User, Home, MapPin, Phone, Mail, Building, Ruler, Package, FileText } from "lucide-react"
import { PropostaData } from "../PropostaWizard"
import { useDrywallCalculos } from "@/hooks/useDrywallCalculos"
import { useToast } from "@/hooks/use-toast"

interface StepDadosCompletosDivisoriasProps {
  onDataChange: (data: Partial<PropostaData>) => void;
  onNext: () => void;
  onBack: () => void;
  data: Partial<PropostaData>;
}

// Usar tipos do hook existente
import type { ItemCalculoDrywall, ResumoDrywall } from "@/hooks/useDrywallCalculos"

export function StepDadosCompletosDivisorias({ 
  onDataChange, 
  onNext, 
  onBack, 
  data 
}: StepDadosCompletosDivisoriasProps) {
  const { calcularOrcamentoDrywall, loading } = useDrywallCalculos()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    // Dados do Cliente
    clienteNome: data.clienteNome || '',
    clienteEmail: data.clienteEmail || '',
    clienteWhatsapp: data.clienteWhatsapp || '',
    clienteEndereco: data.clienteEndereco || '',
    
    // Dimensões da Parede
    largura: 0,
    altura: 0,
    
    // Tipo de Parede
    tipoParede: 'ST90_2F_EI30',
    
    // Esquadrias
    temPortas: false,
    numeroPortas: 1,
    larguraPorta: 0.9,
    alturaPorta: 2.1,
    
    temJanelas: false,
    numeroJanelas: 1,
    larguraJanela: 1.2,
    alturaJanela: 1.2,
    
    // Configurações Técnicas
    isolamentoAcustico: false,
    espacamentoMontantes: 600,
    observacoes: data.observacoes || ''
  })

  const [calculoRealizado, setCalculoRealizado] = useState(false)
  const [resumoCalculo, setResumoCalculo] = useState<ResumoDrywall | null>(null)
  const [itensCalculados, setItensCalculados] = useState<ItemCalculoDrywall[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Tipos de parede disponíveis
  const TIPOS_PAREDE = [
    { value: 'ST90_2F_EI30', label: 'ST90 2F EI30', description: 'Parede dupla face EI30 - espessura 90mm' },
    { value: 'ST90_1F_EI30', label: 'ST90 1F EI30', description: 'Parede simples face EI30 - espessura 90mm' },
    { value: 'ST70_2F_EI30', label: 'ST70 2F EI30', description: 'Parede dupla face EI30 - espessura 70mm' },
    { value: 'ST70_1F_EI30', label: 'ST70 1F EI30', description: 'Parede simples face EI30 - espessura 70mm' },
    { value: 'ST48_2F_EI30', label: 'ST48 2F EI30', description: 'Parede dupla face EI30 - espessura 48mm' },
    { value: 'ST48_1F_EI30', label: 'ST48 1F EI30', description: 'Parede simples face EI30 - espessura 48mm' }
  ]

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
    if (!formData.largura || formData.largura <= 0) {
      newErrors.largura = 'Largura da parede é obrigatória'
    }
    if (!formData.altura || formData.altura <= 0) {
      newErrors.altura = 'Altura da parede é obrigatória'
    }
    if (!formData.tipoParede) {
      newErrors.tipoParede = 'Selecione o tipo de parede'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof typeof formData, value: string | number | boolean) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
    
    // Limpar erro do campo quando usuário digita
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }

    // Se mudou dimensões ou tipo, limpar cálculo
    if (['largura', 'altura', 'tipoParede'].includes(field)) {
      setCalculoRealizado(false)
      setResumoCalculo(null)
      setItensCalculados([])
    }
  }

  const calcularArea = () => {
    return formData.largura * formData.altura
  }

  const calcularMetrosLineares = () => {
    return (formData.largura * 2) + (formData.altura * 2)
  }

  const handleCalcular = async () => {
    if (!validateForm()) {
      toast({
        title: "Erro na validação",
        description: "Corrija os campos obrigatórios antes de calcular",
        variant: "destructive"
      })
      return
    }

    try {
      const parametros = {
        largura: formData.largura,
        altura: formData.altura,
        tipo_parede: formData.tipoParede,
        incluir_portas: formData.temPortas,
        quantidade_portas: formData.temPortas ? formData.numeroPortas : 0,
        largura_porta: formData.temPortas ? formData.larguraPorta : 0,
        altura_porta: formData.temPortas ? formData.alturaPorta : 0,
        incluir_janelas: formData.temJanelas,
        quantidade_janelas: formData.temJanelas ? formData.numeroJanelas : 0,
        largura_janela: formData.temJanelas ? formData.larguraJanela : 0,
        altura_janela: formData.temJanelas ? formData.alturaJanela : 0,
        com_isolamento: formData.isolamentoAcustico,
        espacamento_montantes: formData.espacamentoMontantes
      }

      const resultado = await calcularOrcamentoDrywall(parametros)
      
      if (resultado) {
        setItensCalculados(resultado.itens)
        setResumoCalculo(resultado.resumo)
        setCalculoRealizado(true)

        // Atualizar dados da proposta
        onDataChange({
          ...formData,
          dadosExtraidos: {
            tipo_calculo: 'drywall_manual',
            parametros_calculo: parametros,
            itens_calculados: resultado.itens,
            resumo_calculo: resultado.resumo,
            area_total: calcularArea(),
            metros_lineares: calcularMetrosLineares()
          },
          valorTotal: resultado.resumo.valorTotal
        })

        toast({
          title: "Cálculo realizado",
          description: `Orçamento calculado: ${resultado.resumo.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
        })
      }
    } catch (error) {
      console.error('Erro no cálculo:', error)
      toast({
        title: "Erro no cálculo",
        description: "Não foi possível calcular o orçamento. Tente novamente.",
        variant: "destructive"
      })
    }
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const handleNext = () => {
    if (!calculoRealizado) {
      toast({
        title: "Cálculo necessário",
        description: "Execute o cálculo antes de prosseguir",
        variant: "destructive"
      })
      return
    }
    onNext()
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
          Dados Completos - Divisórias Drywall
        </h3>
        <p className="text-muted-foreground">
          Todas as informações necessárias para gerar sua proposta
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

        {/* Dimensões da Parede */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              Dimensões da Parede
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="largura">Largura (m) *</Label>
                <Input
                  id="largura"
                  type="number"
                  value={formData.largura || ''}
                  onChange={(e) => handleInputChange('largura', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 3.5"
                  min="0.1"
                  step="0.1"
                  className={errors.largura ? 'border-red-500' : ''}
                />
                {errors.largura && (
                  <p className="text-sm text-red-500 mt-1">{errors.largura}</p>
                )}
              </div>

              <div>
                <Label htmlFor="altura">Altura (m) *</Label>
                <Input
                  id="altura"
                  type="number"
                  value={formData.altura || ''}
                  onChange={(e) => handleInputChange('altura', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 2.8"
                  min="0.1"
                  step="0.1"
                  className={errors.altura ? 'border-red-500' : ''}
                />
                {errors.altura && (
                  <p className="text-sm text-red-500 mt-1">{errors.altura}</p>
                )}
              </div>

              <div>
                <Label htmlFor="area">Área Total (m²)</Label>
                <Input
                  id="area"
                  type="number"
                  value={calcularArea().toFixed(2)}
                  disabled
                  placeholder="Calculado automaticamente"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Calculado automaticamente: {calcularArea().toFixed(2)} m²
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tipo de Parede */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Tipo de Parede
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="tipoParede">Sistema de Parede *</Label>
              <Select 
                value={formData.tipoParede} 
                onValueChange={(value) => handleInputChange('tipoParede', value)}
              >
                <SelectTrigger className={errors.tipoParede ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o tipo de parede" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_PAREDE.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      <div>
                        <div className="font-medium">{tipo.label}</div>
                        <div className="text-sm text-muted-foreground">{tipo.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipoParede && (
                <p className="text-sm text-red-500 mt-1">{errors.tipoParede}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Esquadrias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Esquadrias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Portas */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="temPortas"
                  checked={formData.temPortas}
                  onCheckedChange={(checked) => handleInputChange('temPortas', checked)}
                />
                <Label htmlFor="temPortas">A parede possui portas?</Label>
              </div>

              {formData.temPortas && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6 border-l-2 border-border">
                  <div>
                    <Label htmlFor="numeroPortas">Número de Portas</Label>
                    <Input
                      id="numeroPortas"
                      type="number"
                      value={formData.numeroPortas}
                      onChange={(e) => handleInputChange('numeroPortas', parseInt(e.target.value) || 1)}
                      min="1"
                      max="10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="larguraPorta">Largura (m)</Label>
                    <Input
                      id="larguraPorta"
                      type="number"
                      value={formData.larguraPorta}
                      onChange={(e) => handleInputChange('larguraPorta', parseFloat(e.target.value) || 0)}
                      step="0.1"
                      min="0.6"
                      max="3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="alturaPorta">Altura (m)</Label>
                    <Input
                      id="alturaPorta"
                      type="number"
                      value={formData.alturaPorta}
                      onChange={(e) => handleInputChange('alturaPorta', parseFloat(e.target.value) || 0)}
                      step="0.1"
                      min="1.8"
                      max="3"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Janelas */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="temJanelas"
                  checked={formData.temJanelas}
                  onCheckedChange={(checked) => handleInputChange('temJanelas', checked)}
                />
                <Label htmlFor="temJanelas">A parede possui janelas?</Label>
              </div>

              {formData.temJanelas && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6 border-l-2 border-border">
                  <div>
                    <Label htmlFor="numeroJanelas">Número de Janelas</Label>
                    <Input
                      id="numeroJanelas"
                      type="number"
                      value={formData.numeroJanelas}
                      onChange={(e) => handleInputChange('numeroJanelas', parseInt(e.target.value) || 1)}
                      min="1"
                      max="10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="larguraJanela">Largura (m)</Label>
                    <Input
                      id="larguraJanela"
                      type="number"
                      value={formData.larguraJanela}
                      onChange={(e) => handleInputChange('larguraJanela', parseFloat(e.target.value) || 0)}
                      step="0.1"
                      min="0.4"
                      max="3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="alturaJanela">Altura (m)</Label>
                    <Input
                      id="alturaJanela"
                      type="number"
                      value={formData.alturaJanela}
                      onChange={(e) => handleInputChange('alturaJanela', parseFloat(e.target.value) || 0)}
                      step="0.1"
                      min="0.4"
                      max="2"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configurações Técnicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Configurações Técnicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isolamentoAcustico"
                checked={formData.isolamentoAcustico}
                onCheckedChange={(checked) => handleInputChange('isolamentoAcustico', checked)}
              />
              <Label htmlFor="isolamentoAcustico">Incluir isolamento acústico</Label>
            </div>

            <div>
              <Label htmlFor="espacamentoMontantes">Espaçamento entre Montantes (mm)</Label>
              <Select 
                value={formData.espacamentoMontantes.toString()} 
                onValueChange={(value) => handleInputChange('espacamentoMontantes', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="400">400mm</SelectItem>
                  <SelectItem value="600">600mm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder="Observações adicionais sobre o projeto..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botão de Cálculo */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Button 
                onClick={handleCalcular} 
                disabled={loading}
                size="lg"
                className="w-full md:w-auto"
              >
                {loading ? 'Calculando...' : 'Calcular Orçamento'}
              </Button>
              <p className="text-sm text-muted-foreground">
                Execute o cálculo para visualizar os materiais e custos
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Resumo do Cálculo */}
        {resumoCalculo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resumo do Orçamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-primary/5 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(resumoCalculo.valorTotal)}</p>
                </div>
                <div className="bg-secondary/5 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Valor por m²</p>
                  <p className="text-lg font-bold">{formatCurrency(resumoCalculo.valorPorM2)}</p>
                </div>
                <div className="bg-accent/5 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Área Total</p>
                  <p className="text-lg font-bold">{resumoCalculo.areaLiquida.toFixed(2)} m²</p>
                </div>
                <div className="bg-muted/5 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Peso Total</p>
                  <p className="text-lg font-bold">{resumoCalculo.pesoTotal.toFixed(0)} kg</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-primary">Lista de Materiais</h4>
                <div className="space-y-1">
                  {itensCalculados.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm py-2 border-b border-border/50">
                      <div>
                        <span className="font-medium">{item.item_descricao}</span>
                        <span className="text-muted-foreground ml-2">({item.quantidade_comercial.toFixed(2)} {item.unidade_comercial})</span>
                      </div>
                      <span className="font-medium">{formatCurrency(item.valor_total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!calculoRealizado}
        >
          Gerar Proposta
        </Button>
      </div>
    </div>
  )
}