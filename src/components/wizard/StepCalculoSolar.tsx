import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calculator, CheckCircle, Loader2, Sun, Zap, Edit3, RotateCcw } from "lucide-react"
import { PropostaData } from "../PropostaWizard"
import { DadosContaLuz } from "@/services/difyService"
import { useCalculoMapeamento } from "@/hooks/useCalculoMapeamento"
import { useProdutos } from "@/hooks/useProdutos"
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
  const { calcularPorMapeamento, obterResumoOrcamento, isLoading, error } = useCalculoMapeamento()
  const { paineis, inversores, buscarProduto } = useProdutos()
  const { toast } = useToast()
  
  // Parâmetros para o cálculo
  const [tipoInstalacao, setTipoInstalacao] = useState<'residencial' | 'comercial' | 'industrial'>('residencial')
  const [tipoTelha, setTipoTelha] = useState<'ceramica' | 'concreto' | 'metalica' | 'fibrocimento'>('ceramica')
  const [areaDisponivel, setAreaDisponivel] = useState<number | undefined>()
  const [tarifaEnergia, setTarifaEnergia] = useState(0.75)
  
  // Resultado dos cálculos
  const [resultadoMapeamento, setResultadoMapeamento] = useState(null)
  const [resumoOrcamento, setResumoOrcamento] = useState(null)
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

  const handleCalcular = async () => {
    if (!dadosContaLuz?.consumo_atual) {
      toast({
        title: "Erro",
        description: "Dados da conta de luz não encontrados",
        variant: "destructive"
      })
      return
    }

    try {
      // Calcular usando mapeamento
      const areaBase = dadosContaLuz.consumo_atual * 8 / 1000; // estimativa 8m²/kWp
      
      const itens = await calcularPorMapeamento('energia-solar', areaBase, {
        consumo_kwh: dadosContaLuz.consumo_atual,
        cidade: dadosContaLuz.endereco?.split(',')[0]?.trim() || 'São Paulo',
        estado: 'SP',
        tipo_instalacao: tipoInstalacao,
        tipo_telha: tipoTelha,
        tarifa_energia: tarifaEnergia
      });
      
      const resumo = await obterResumoOrcamento('energia-solar', areaBase, {
        consumo_kwh: dadosContaLuz.consumo_atual
      });
      
      setResultadoMapeamento(itens);
      setResumoOrcamento(resumo);
      setCalculado(true);
      
      // Atualizar valor total da proposta
      onDataChange({ 
        valorTotal: resumo?.valor_total || 0,
        dadosExtraidos: {
          ...dadosContaLuz,
          itens_orcamento: itens,
          resumo_orcamento: resumo
        }
      })

      toast({
        title: "Cálculo realizado com sucesso!",
        description: `Orçamento calculado: ${resumo?.total_itens} itens`,
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
    if (!painelSelecionado || !quantidadePaineis || !inversorSelecionado) {
      toast({
        title: "Erro",
        description: "Selecione todos os equipamentos",
        variant: "destructive"
      })
      return
    }

    try {
      // Recalcular usando mapeamento com equipamentos específicos
      const areaBase = dadosContaLuz.consumo_atual * 8 / 1000;
      
      const itens = await calcularPorMapeamento('energia-solar', areaBase, {
        consumo_kwh: dadosContaLuz.consumo_atual,
        painel_id: painelSelecionado,
        quantidade_paineis: quantidadePaineis,
        inversor_id: inversorSelecionado
      });
      
      const resumo = await obterResumoOrcamento('energia-solar', areaBase);
      
      setResultadoMapeamento(itens);
      setResumoOrcamento(resumo);
      setEditandoEquipamentos(false);
      
      // Atualizar valor total da proposta
      onDataChange({ 
        valorTotal: resumo?.valor_total || 0,
        dadosExtraidos: {
          ...dadosContaLuz,
          itens_orcamento: itens,
          resumo_orcamento: resumo
        }
      })

      toast({
        title: "Recálculo realizado!",
        description: `Novo valor: ${formatCurrency(resumo?.valor_total || 0)}`,
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
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
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
      {resumoOrcamento && (
        <div className="space-y-4">
          {/* Resumo do Orçamento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sun className="h-5 w-5 text-yellow-600" />
                Orçamento Sistema Solar - Via Mapeamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    R$ {resumoOrcamento.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {resumoOrcamento.total_itens}
                  </p>
                  <p className="text-sm text-muted-foreground">Total de Itens</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    R$ {resumoOrcamento.valor_por_m2?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground">Valor por m²</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalhamento dos Itens */}
          {resultadoMapeamento && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Itens do Orçamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resultadoMapeamento.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{item.item_descricao}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.composicao_nome} • Qty: {Math.ceil(item.quantidade_com_quebra)}
                        </p>
                      </div>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(item.valor_total)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Equipamentos Editáveis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Equipamentos Customizáveis
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditandoEquipamentos(!editandoEquipamentos)}
                  className="ml-auto"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  {editandoEquipamentos ? 'Cancelar' : 'Personalizar'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editandoEquipamentos ? (
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
                    Recalcular com Equipamentos Selecionados
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>Clique em "Personalizar" para escolher equipamentos específicos</p>
                </div>
              )}
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