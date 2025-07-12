import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calculator, CheckCircle, Loader2, Sun, Zap, Clock, TrendingUp } from "lucide-react"
import { PropostaData } from "../PropostaWizard"
import { DadosContaLuz } from "@/services/difyService"
import { useEnergiaSolar, DadosEntradaSolar, CalculoCompleto } from "@/hooks/useEnergiaSolar"
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
  const { toast } = useToast()
  
  // Parâmetros para o cálculo
  const [tipoInstalacao, setTipoInstalacao] = useState<'residencial' | 'comercial' | 'industrial'>('residencial')
  const [tipoTelha, setTipoTelha] = useState<'ceramica' | 'concreto' | 'metalica' | 'fibrocimento'>('ceramica')
  const [areaDisponivel, setAreaDisponivel] = useState<number | undefined>()
  const [tarifaEnergia, setTarifaEnergia] = useState(0.75)
  
  // Resultado dos cálculos
  const [calculoCompleto, setCalculoCompleto] = useState<CalculoCompleto | null>(null)
  const [calculado, setCalculado] = useState(false)

  const dadosContaLuz = propostaData.dadosExtraidos as DadosContaLuz

  useEffect(() => {
    if (dadosContaLuz && !calculado) {
      handleCalcular()
    }
  }, [dadosContaLuz])

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
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                  </div>
                </div>
              </div>
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