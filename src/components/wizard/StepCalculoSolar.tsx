import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Calculator, CheckCircle, Loader2, Sun, Zap, Clock, TrendingUp, Edit3, RotateCcw, Eye, EyeOff, ShieldCheck, Wrench, Settings } from "lucide-react"
import { PropostaData } from "../PropostaWizard"
import { DadosContaLuz } from "@/services/difyService"
import { useEnergiaSolar, DadosEntradaSolar, CalculoCompleto } from "@/hooks/useEnergiaSolar"
import { useProdutos } from "@/hooks/useProdutos"
import { useUserRole } from "@/hooks/useUserRole"
import { useToast } from "@/hooks/use-toast"

interface StepCalculoSolarProps {
  propostaData: PropostaData;
  onDataChange: (data: Partial<PropostaData>) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepCalculoSolar({ 
  propostaData, 
  onDataChange, 
  onBack, 
  onNext 
}: StepCalculoSolarProps) {
  const { calcularSistemaCompleto, loading, error } = useEnergiaSolar()
  const { paineis, inversores, buscarInversores, buscarProduto } = useProdutos()
  const { canViewMargins } = useUserRole()
  const { toast } = useToast()
  
  // Parâmetros para o cálculo
  const [tipoInstalacao, setTipoInstalacao] = useState<'residencial' | 'comercial' | 'industrial'>('residencial')
  const [tipoTelha, setTipoTelha] = useState<'ceramica' | 'concreto' | 'metalica' | 'fibrocimento'>('ceramica')
  const [areaDisponivel, setAreaDisponivel] = useState<number | undefined>()
  const [tarifaEnergia, setTarifaEnergia] = useState(0.75)
  
  // Resultado dos cálculos
  const [calculoCompleto, setCalculoCompleto] = useState<CalculoCompleto | null>(null)
  const [calculado, setCalculado] = useState(false)
  
  // Equipamentos editáveis
  const [painelSelecionado, setPainelSelecionado] = useState<string>('')
  const [quantidadePaineis, setQuantidadePaineis] = useState<number>(0)
  const [inversorSelecionado, setInversorSelecionado] = useState<string>('')
  const [editandoEquipamentos, setEditandoEquipamentos] = useState(false)

  const dadosContaLuz = propostaData.dadosExtraidos as DadosContaLuz

  useEffect(() => {
    if (dadosContaLuz && !calculado) {
      handleCalcular()
    }
  }, [dadosContaLuz])

  useEffect(() => {
    if (calculoCompleto) {
      setPainelSelecionado(calculoCompleto.equipamentos.painel.id)
      setQuantidadePaineis(calculoCompleto.equipamentos.painel.quantidade)
      setInversorSelecionado(calculoCompleto.equipamentos.inversor.id)
    }
  }, [calculoCompleto])

  const handleCalcular = async () => {
    if (!dadosContaLuz?.consumo_atual) {
      toast({
        title: "Erro",
        description: "Dados da conta de luz não encontrados",
        variant: "destructive"
      })
      return
    }

    const dadosEntrada: DadosEntradaSolar = {
      consumo_mensal_kwh: dadosContaLuz.consumo_atual,
      cidade: dadosContaLuz.endereco?.split(',')[0]?.trim() || 'São Paulo',
      estado: 'SP', // TODO: extrair do endereço
      tipo_instalacao: tipoInstalacao,
      tipo_telha: tipoTelha,
      area_disponivel: areaDisponivel,
      tarifa_energia: tarifaEnergia
    }

    try {
      const resultado = await calcularSistemaCompleto(dadosEntrada)
      setCalculoCompleto(resultado)
      setCalculado(true)
      
      // Atualizar valor total da proposta
      onDataChange({ 
        valorTotal: resultado.orcamento.valor_total,
        dadosExtraidos: {
          ...dadosContaLuz,
          calculo_solar: resultado
        }
      })

      toast({
        title: "Cálculo realizado com sucesso!",
        description: `Sistema de ${resultado.dimensionamento.potencia_necessaria_kwp}kWp calculado`,
      })
    } catch (err) {
      toast({
        title: "Erro no cálculo",
        description: error || "Erro ao calcular sistema solar",
        variant: "destructive"
      })
    }
  }

  const recalcularComEquipamentos = async () => {
    if (!painelSelecionado || !quantidadePaineis || !inversorSelecionado || !calculoCompleto) {
      toast({
        title: "Erro",
        description: "Selecione todos os equipamentos",
        variant: "destructive"
      })
      return
    }

    try {
      const painelProduto = await buscarProduto(painelSelecionado)
      const inversorProduto = await buscarProduto(inversorSelecionado)
      
      if (!painelProduto || !inversorProduto) {
        throw new Error("Produtos não encontrados")
      }

      const potenciaSistema = (quantidadePaineis * (painelProduto.potencia_wp || 0)) / 1000

      // Usar funções Supabase para recalcular
      const dadosEntrada: DadosEntradaSolar = {
        consumo_mensal_kwh: dadosContaLuz.consumo_atual,
        cidade: dadosContaLuz.endereco?.split(',')[0]?.trim() || 'São Paulo',
        estado: 'SP',
        tipo_instalacao: tipoInstalacao,
        tipo_telha: tipoTelha,
        area_disponivel: areaDisponivel,
        tarifa_energia: tarifaEnergia
      }

      const resultado = await calcularSistemaCompleto(dadosEntrada)
      
      // Substituir equipamentos pelos selecionados
      resultado.equipamentos.painel = {
        id: painelProduto.id,
        modelo: painelProduto.nome,
        fabricante: painelProduto.fabricante || '',
        quantidade: quantidadePaineis,
        potencia_unitaria: painelProduto.potencia_wp || 0,
        potencia_total: potenciaSistema * 1000,
        preco_unitario: painelProduto.preco_unitario || 0,
        preco_total: (painelProduto.preco_unitario || 0) * quantidadePaineis
      }

      resultado.equipamentos.inversor = {
        id: inversorProduto.id,
        modelo: inversorProduto.nome,
        fabricante: inversorProduto.fabricante || '',
        potencia: inversorProduto.potencia_wp || 0,
        preco: inversorProduto.preco_unitario || 0
      }

      // Recalcular orçamento
      resultado.orcamento.equipamentos.paineis = resultado.equipamentos.painel.preco_total
      resultado.orcamento.equipamentos.inversor = resultado.equipamentos.inversor.preco
      resultado.orcamento.subtotal = resultado.orcamento.equipamentos.paineis + resultado.orcamento.equipamentos.inversor + resultado.orcamento.instalacao
      resultado.orcamento.valor_total = resultado.orcamento.subtotal * (1 + resultado.orcamento.margem_aplicada / 100)

      setCalculoCompleto(resultado)
      setEditandoEquipamentos(false)
      
      // Atualizar valor total da proposta
      onDataChange({ 
        valorTotal: resultado.orcamento.valor_total,
        dadosExtraidos: {
          ...dadosContaLuz,
          calculo_solar: resultado
        }
      })

      toast({
        title: "Recálculo realizado!",
        description: `Novo valor: ${formatCurrency(resultado.orcamento.valor_total)}`,
      })
    } catch (err) {
      toast({
        title: "Erro no recálculo",
        description: error || "Erro ao recalcular sistema",
        variant: "destructive"
      })
    }
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Cálculos da Usina Solar</h3>
        <p className="text-muted-foreground">
          Dimensionamento automático baseado no consumo extraído da conta de luz
        </p>
      </div>

      {/* Parâmetros de Entrada */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Parâmetros de Cálculo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Consumo Mensal (kWh)</Label>
              <Input 
                value={dadosContaLuz?.consumo_atual || 0} 
                disabled 
                className="bg-muted"
              />
            </div>
            <div>
              <Label>Tipo de Instalação</Label>
              <Select value={tipoInstalacao} onValueChange={(value: any) => setTipoInstalacao(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residencial">Residencial</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo de Telha</Label>
              <Select value={tipoTelha} onValueChange={(value: any) => setTipoTelha(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ceramica">Cerâmica</SelectItem>
                  <SelectItem value="concreto">Concreto</SelectItem>
                  <SelectItem value="metalica">Metálica</SelectItem>
                  <SelectItem value="fibrocimento">Fibrocimento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Área Disponível (m²) - Opcional</Label>
              <Input 
                type="number"
                value={areaDisponivel || ''}
                onChange={(e) => setAreaDisponivel(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Ex: 50"
              />
            </div>
            <div>
              <Label>Tarifa de Energia (R$/kWh)</Label>
              <Input 
                type="number"
                step="0.01"
                value={tarifaEnergia}
                onChange={(e) => setTarifaEnergia(Number(e.target.value))}
              />
            </div>
          </div>

          {!calculado && (
            <Button 
              onClick={handleCalcular}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  Calcular Sistema Solar
                </>
              )}
            </Button>
          )}

          {calculado && (
            <div className="flex items-center gap-2 justify-center text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Cálculo realizado com sucesso!</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados do Cálculo */}
      {calculoCompleto && (
        <div className="space-y-4">
          {/* Dimensionamento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sun className="h-5 w-5 text-yellow-600" />
                Dimensionamento do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {calculoCompleto.dimensionamento.potencia_necessaria_kwp} kWp
                  </p>
                  <p className="text-sm text-muted-foreground">Potência do Sistema</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {calculoCompleto.equipamentos.painel.quantidade}
                  </p>
                  <p className="text-sm text-muted-foreground">Painéis Solares</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(calculoCompleto.dimensionamento.geracao_estimada_anual)} kWh
                  </p>
                  <p className="text-sm text-muted-foreground">Geração Anual</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Equipamentos Selecionados
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditandoEquipamentos(!editandoEquipamentos)}
                  className="ml-auto"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  {editandoEquipamentos ? 'Cancelar' : 'Editar'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!editandoEquipamentos ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Painéis Solares</h4>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="font-medium">{calculoCompleto.equipamentos.painel.modelo}</p>
                      <p className="text-sm text-muted-foreground">
                        {calculoCompleto.equipamentos.painel.fabricante} • 
                        {calculoCompleto.equipamentos.painel.potencia_unitaria}W • 
                        Qty: {calculoCompleto.equipamentos.painel.quantidade}
                      </p>
                      <p className="text-sm font-medium text-green-600">
                        {formatCurrency(calculoCompleto.equipamentos.painel.preco_total)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Inversor</h4>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="font-medium">{calculoCompleto.equipamentos.inversor.modelo}</p>
                      <p className="text-sm text-muted-foreground">
                        {calculoCompleto.equipamentos.inversor.fabricante} • 
                        {calculoCompleto.equipamentos.inversor.potencia}W
                      </p>
                      <p className="text-sm font-medium text-green-600">
                        {formatCurrency(calculoCompleto.equipamentos.inversor.preco)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label>Painéis Solares</Label>
                    <Select value={painelSelecionado} onValueChange={setPainelSelecionado}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o painel" />
                      </SelectTrigger>
                      <SelectContent>
                        {paineis.map((painel) => (
                          <SelectItem key={painel.id} value={painel.id}>
                            {painel.nome} - {painel.potencia_wp}W - {formatCurrency(painel.preco_unitario || 0)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quantidade de Painéis</Label>
                    <Input
                      type="number"
                      value={quantidadePaineis}
                      onChange={(e) => setQuantidadePaineis(Number(e.target.value))}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label>Inversor</Label>
                    <Select value={inversorSelecionado} onValueChange={setInversorSelecionado}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o inversor" />
                      </SelectTrigger>
                      <SelectContent>
                        {inversores.map((inversor) => (
                          <SelectItem key={inversor.id} value={inversor.id}>
                            {inversor.nome} - {inversor.potencia_wp}W - {formatCurrency(inversor.preco_unitario || 0)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={recalcularComEquipamentos} className="w-full">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Recalcular com Novos Equipamentos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Análise Financeira */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Análise Financeira
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(calculoCompleto.orcamento.valor_total)}
                  </p>
                  <p className="text-sm text-muted-foreground">Investimento Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(calculoCompleto.dimensionamento.economia_mensal_estimada)}
                  </p>
                  <p className="text-sm text-muted-foreground">Economia Mensal</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {calculoCompleto.analise_financeira.payback_simples_anos} anos
                  </p>
                  <p className="text-sm text-muted-foreground">Payback</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {calculoCompleto.resumo_proposta.economia_percentual}%
                  </p>
                  <p className="text-sm text-muted-foreground">Economia</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Breakdown Detalhado - Somente para Admins */}
          {canViewMargins() && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-orange-600" />
                  Breakdown Detalhado
                  <Badge variant="secondary" className="ml-auto bg-orange-100 text-orange-800">
                    ADMIN
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {/* Equipamentos DC */}
                  <AccordionItem value="equipamentos-dc">
                    <AccordionTrigger className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-blue-600" />
                      Equipamentos DC (Corrente Contínua)
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                          <div>
                            <p className="font-medium">{calculoCompleto.equipamentos.painel.modelo}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {calculoCompleto.equipamentos.painel.quantidade} x {formatCurrency(calculoCompleto.equipamentos.painel.preco_unitario)}
                            </p>
                          </div>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(calculoCompleto.equipamentos.painel.preco_total)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                          <div>
                            <p className="font-medium">String Box, DPS DC, Fusíveis</p>
                            <p className="text-sm text-muted-foreground">Proteções DC</p>
                          </div>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(calculoCompleto.dimensionamento.potencia_necessaria_kwp * 150)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                          <div>
                            <p className="font-medium">Cabos DC, Conectores MC4</p>
                            <p className="text-sm text-muted-foreground">Cabeamento DC</p>
                          </div>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(calculoCompleto.equipamentos.painel.quantidade * 25 * 0.6)}
                          </p>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center font-semibold">
                          <span>Subtotal Equipamentos DC:</span>
                          <span className="text-blue-600">
                            {formatCurrency(
                              calculoCompleto.equipamentos.painel.preco_total + 
                              (calculoCompleto.dimensionamento.potencia_necessaria_kwp * 150) +
                              (calculoCompleto.equipamentos.painel.quantidade * 25 * 0.6)
                            )}
                          </span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Equipamentos CA */}
                  <AccordionItem value="equipamentos-ca">
                    <AccordionTrigger className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-600" />
                      Equipamentos CA (Corrente Alternada)
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                          <div>
                            <p className="font-medium">{calculoCompleto.equipamentos.inversor.modelo}</p>
                            <p className="text-sm text-muted-foreground">
                              {calculoCompleto.equipamentos.inversor.fabricante} • {calculoCompleto.equipamentos.inversor.potencia}W
                            </p>
                          </div>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(calculoCompleto.equipamentos.inversor.preco)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                          <div>
                            <p className="font-medium">DPS CA, Disjuntor, Medidor</p>
                            <p className="text-sm text-muted-foreground">Proteções CA</p>
                          </div>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(450)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                          <div>
                            <p className="font-medium">Cabos CA, Eletrodutos</p>
                            <p className="text-sm text-muted-foreground">Cabeamento CA</p>
                          </div>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(calculoCompleto.equipamentos.painel.quantidade * 25 * 0.4)}
                          </p>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center font-semibold">
                          <span>Subtotal Equipamentos CA:</span>
                          <span className="text-green-600">
                            {formatCurrency(
                              calculoCompleto.equipamentos.inversor.preco + 
                              450 +
                              (calculoCompleto.equipamentos.painel.quantidade * 25 * 0.4)
                            )}
                          </span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Estrutura de Fixação */}
                  <AccordionItem value="estrutura">
                    <AccordionTrigger className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-gray-600" />
                      Estrutura de Fixação
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                          <div>
                            <p className="font-medium">Trilhos de Alumínio</p>
                            <p className="text-sm text-muted-foreground">Estrutura principal</p>
                          </div>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(calculoCompleto.equipamentos.painel.quantidade * 120 * 0.6)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                          <div>
                            <p className="font-medium">Ganchos, Parafusos, End-clamps</p>
                            <p className="text-sm text-muted-foreground">Fixadores e acessórios</p>
                          </div>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(calculoCompleto.equipamentos.painel.quantidade * 120 * 0.4)}
                          </p>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center font-semibold">
                          <span>Subtotal Estrutura:</span>
                          <span className="text-gray-600">
                            {formatCurrency(calculoCompleto.equipamentos.painel.quantidade * 120)}
                          </span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Instalação */}
                  <AccordionItem value="instalacao">
                    <AccordionTrigger className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-purple-600" />
                      Instalação e Comissionamento
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                          <div>
                            <p className="font-medium">Mão de Obra Especializada</p>
                            <p className="text-sm text-muted-foreground">
                              Instalação completa • R$ 1,50/Wp
                            </p>
                          </div>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(calculoCompleto.orcamento.instalacao)}
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Resumo Financeiro Admin */}
                <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-semibold mb-3 text-orange-800">Resumo Financeiro</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal Equipamentos:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          calculoCompleto.equipamentos.painel.preco_total + 
                          calculoCompleto.equipamentos.inversor.preco +
                          (calculoCompleto.dimensionamento.potencia_necessaria_kwp * 150) +
                          (calculoCompleto.equipamentos.painel.quantidade * 25) +
                          (calculoCompleto.equipamentos.painel.quantidade * 120) +
                          450
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal Instalação:</span>
                      <span className="font-medium">{formatCurrency(calculoCompleto.orcamento.instalacao)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Subtotal Geral:</span>
                      <span>{formatCurrency(calculoCompleto.orcamento.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-orange-700 font-semibold">
                      <span>Margem Comercial ({calculoCompleto.orcamento.margem_aplicada}%):</span>
                      <span>
                        {formatCurrency(calculoCompleto.orcamento.valor_total - calculoCompleto.orcamento.subtotal)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold text-orange-800">
                      <span>Valor Total:</span>
                      <span>{formatCurrency(calculoCompleto.orcamento.valor_total)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Valor por kWp:</span>
                      <span>{formatCurrency(calculoCompleto.orcamento.valor_kwp_instalado)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resumo da Proposta */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h4 className="font-semibold text-lg">Resumo da Proposta Solar</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Sistema:</span>
                    <p className="font-medium">
                      {calculoCompleto.dimensionamento.potencia_necessaria_kwp}kWp • 
                      {calculoCompleto.equipamentos.painel.quantidade} painéis
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Área ocupada:</span>
                    <p className="font-medium">{calculoCompleto.equipamentos.resumo.area_estimada}m²</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Economia anual:</span>
                    <p className="font-medium text-green-600">
                      {formatCurrency(calculoCompleto.dimensionamento.economia_anual_estimada)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">VPL (25 anos):</span>
                    <p className="font-medium text-green-600">
                      {formatCurrency(calculoCompleto.analise_financeira.vpl_25_anos)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Separator />

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button 
          onClick={onNext}
          disabled={!calculado}
          className="bg-primary hover:bg-primary/90"
        >
          Gerar Proposta
        </Button>
      </div>
    </div>
  )
}