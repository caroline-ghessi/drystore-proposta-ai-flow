
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Calculator, Home, Ruler, Package, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { useTelhasShingleCompleto, ParametrosCalculoShingle, ResumoOrcamentoShingleCompleto } from "@/hooks/useTelhasShingleCompleto"
import { SistemaShingleSelector } from "./SistemaShingleSelector"

interface DadosExtraidos {
  area_total_m2?: number
  comprimento_cumeeira?: number
  comprimento_espigao?: number
  comprimento_agua_furtada?: number
  perimetro_telhado?: number
  inclinacao_telhado?: number
  tipo_estrutura?: string
  regiao_climatica?: string
  cor_preferida?: string
  observacoes_especiais?: string
  orcamento_completo?: any
}

interface OrcamentoCompleto {
  valorTotal: number
  itens: Array<{
    categoria: string
    descricao: string
    quantidade: number
    unidade: string
    valorUnitario: number
    valorTotal: number
  }>
  resumo: {
    totalItens: number
    pesoTotal: number
    economiaVsCeramica: number
  }
  parametros?: {
    area_telhado?: number
    comprimento_cumeeira?: number
    comprimento_espigao?: number
    comprimento_agua_furtada?: number
    perimetro_telhado?: number
    telha_codigo?: string
    incluir_manta?: boolean
  }
}

interface StepCalculoTelhasCompletoProps {
  dadosExtraidos: DadosExtraidos
  onCalculoComplete: (orcamento: OrcamentoCompleto) => void
  onBack: () => void
  onNext: () => void
}

export function StepCalculoTelhasCompleto({ 
  dadosExtraidos, 
  onCalculoComplete, 
  onBack, 
  onNext 
}: StepCalculoTelhasCompletoProps) {
  const { toast } = useToast()
  const { 
    sistemasDisponiveis, 
    calcularOrcamentoShingleCompleto, 
    loading: hookLoading,
    error: hookError
  } = useTelhasShingleCompleto()
  
  // Estados para dimensões do telhado
  const [dimensoes, setDimensoes] = useState({
    area: dadosExtraidos.area_total_m2 || 100,
    comprimentoCumeeira: dadosExtraidos.comprimento_cumeeira || 12,
    comprimentoEspigao: dadosExtraidos.comprimento_espigao || 0,
    comprimentoAguaFurtada: dadosExtraidos.comprimento_agua_furtada || 0,
    perimetro: dadosExtraidos.perimetro_telhado || 50
  })

  const [configuracoes, setConfiguracoes] = useState({
    incluirManta: true,
    incluirCumeeiraVentilada: false, // Novo campo opcional
    sistemaShingle: '1.16' // Default para Supreme
  })

  const [calculando, setCalculando] = useState(false)
  const [progresso, setProgresso] = useState(0)

  async function calcularOrcamento() {
    if (!configuracoes.sistemaShingle) {
      toast({
        title: "Sistema não selecionado",
        description: "Por favor, selecione um sistema (Supreme ou Oakridge).",
        variant: "destructive"
      })
      return
    }

    setCalculando(true)
    setProgresso(0)

    try {
      // Simular progresso
      for (let i = 0; i <= 50; i += 10) {
        setProgresso(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const parametros: ParametrosCalculoShingle = {
        area_telhado: dimensoes.area,
        comprimento_cumeeira: dimensoes.comprimentoCumeeira,
        comprimento_espigao: dimensoes.comprimentoEspigao,
        comprimento_agua_furtada: dimensoes.comprimentoAguaFurtada,
        perimetro_telhado: dimensoes.perimetro,
        telha_codigo: configuracoes.sistemaShingle,
        incluir_manta: configuracoes.incluirManta,
        incluir_cumeeira_ventilada: configuracoes.incluirCumeeiraVentilada
      }

      setProgresso(70)

      const resultado = await calcularOrcamentoShingleCompleto(parametros)

      setProgresso(100)

      if (resultado) {
        // Converter para o formato esperado pelo componente pai
        const orcamentoCompleto: OrcamentoCompleto = {
          valorTotal: resultado.valor_total_geral,
          itens: resultado.itens.map(item => ({
            categoria: item.categoria,
            descricao: item.descricao,
            quantidade: item.quantidade_final,
            unidade: item.unidade_venda,
            valorUnitario: item.preco_unitario,
            valorTotal: item.valor_total
          })),
          resumo: {
            totalItens: resultado.itens.length,
            pesoTotal: resultado.area_telhado * 12, // 12kg/m²
            economiaVsCeramica: resultado.economia_peso_vs_ceramica || 0
          },
          parametros: {
            area_telhado: dimensoes.area,
            comprimento_cumeeira: dimensoes.comprimentoCumeeira,
            comprimento_espigao: dimensoes.comprimentoEspigao,
            comprimento_agua_furtada: dimensoes.comprimentoAguaFurtada,
            perimetro_telhado: dimensoes.perimetro,
            telha_codigo: configuracoes.sistemaShingle,
            incluir_manta: configuracoes.incluirManta
          }
        }

        // CORREÇÃO CRUCIAL: Salvar os dados da etapa 4 no dadosExtraidos
        const dadosParaSalvar = {
          ...dadosExtraidos,
          area_total_m2: dimensoes.area,
          comprimento_cumeeira: dimensoes.comprimentoCumeeira,
          comprimento_espigao: dimensoes.comprimentoEspigao,
          comprimento_agua_furtada: dimensoes.comprimentoAguaFurtada,
          perimetro_telhado: dimensoes.perimetro,
          telha_codigo: configuracoes.sistemaShingle,
          incluir_manta: configuracoes.incluirManta,
          orcamento_completo: orcamentoCompleto
        }

        onCalculoComplete(orcamentoCompleto)
        
        toast({
          title: "Cálculo Concluído!",
          description: `Orçamento de R$ ${resultado.valor_total_geral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} calculado com sucesso.`
        })
      } else {
        throw new Error('Não foi possível calcular o orçamento')
      }

    } catch (error) {
      console.error('Erro no cálculo:', error)
      toast({
        title: "Erro no Cálculo",
        description: "Houve um erro ao calcular o orçamento. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setCalculando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Cálculo do Sistema Completo</h2>
        <p className="text-muted-foreground">
          Escolha o sistema e configure as dimensões para o cálculo preciso do orçamento
        </p>
      </div>

      {/* Seleção do Sistema Shingle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Sistema Shingle
          </CardTitle>
          <CardDescription>
            Selecione entre Supreme ou Oakridge conforme sua necessidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SistemaShingleSelector
            sistemas={sistemasDisponiveis}
            sistemaSelecionado={configuracoes.sistemaShingle}
            onSelecionarSistema={(codigo) => 
              setConfiguracoes(prev => ({ ...prev, sistemaShingle: codigo }))
            }
            loading={hookLoading}
          />
        </CardContent>
      </Card>

      {/* Dimensões do Telhado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="w-5 h-5" />
            Dimensões do Telhado
          </CardTitle>
          <CardDescription>
            Ajuste as medidas conforme necessário para um cálculo preciso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="area">Área Total (m²) *</Label>
              <Input
                id="area"
                type="number"
                value={dimensoes.area}
                onChange={(e) => setDimensoes({...dimensoes, area: parseFloat(e.target.value) || 0})}
                step="0.01"
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="perimetro">Perímetro (m)</Label>
              <Input
                id="perimetro"
                type="number"
                value={dimensoes.perimetro}
                onChange={(e) => setDimensoes({...dimensoes, perimetro: parseFloat(e.target.value) || 0})}
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <Separator />

          {/* Cumeeiras e Espigões */}
          <div>
            <h4 className="font-medium mb-3 text-amber-700">Cumeeiras e Espigões</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cumeeira">Comprimento da Cumeeira (m)</Label>
                <Input
                  id="cumeeira"
                  type="number"
                  value={dimensoes.comprimentoCumeeira}
                  onChange={(e) => setDimensoes({...dimensoes, comprimentoCumeeira: parseFloat(e.target.value) || 0})}
                  step="0.01"
                  min="0"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Aresta horizontal principal do telhado
                </p>
              </div>

              <div>
                <Label htmlFor="espigao">Comprimento do Espigão (m)</Label>
                <Input
                  id="espigao"
                  type="number"
                  value={dimensoes.comprimentoEspigao}
                  onChange={(e) => setDimensoes({...dimensoes, comprimentoEspigao: parseFloat(e.target.value) || 0})}
                  step="0.01"
                  min="0"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Aresta externa inclinada (se houver)
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Águas Furtadas */}
          <div>
            <h4 className="font-medium mb-3 text-blue-700">Águas Furtadas</h4>
            <div>
              <Label htmlFor="aguaFurtada">Comprimento de Água Furtada (m)</Label>
              <Input
                id="aguaFurtada"
                type="number"
                value={dimensoes.comprimentoAguaFurtada}
                onChange={(e) => setDimensoes({...dimensoes, comprimentoAguaFurtada: parseFloat(e.target.value) || 0})}
                step="0.01"
                min="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Aresta interna (vale) do telhado (se houver)
              </p>
            </div>
          </div>

          <Separator />

          {/* Configurações Adicionais */}
          <div>
            <h4 className="font-medium mb-3 text-green-700">Configurações Adicionais</h4>
            <div className="flex items-center space-x-2">
              <Switch
                id="incluirManta"
                checked={configuracoes.incluirManta}
                onCheckedChange={(checked) => setConfiguracoes({...configuracoes, incluirManta: checked})}
              />
              <Label htmlFor="incluirManta">Incluir manta starter</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Produtos Condicionais */}
      {(dimensoes.comprimentoEspigao > 0 || dimensoes.comprimentoAguaFurtada > 0) && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800 mb-2">Produtos Adicionais Inclusos</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  {dimensoes.comprimentoEspigao > 0 && (
                    <li>• Cap de Cumeeira para Espigão ({dimensoes.comprimentoEspigao}m)</li>
                  )}
                  {dimensoes.comprimentoAguaFurtada > 0 && (
                    <li>• Fita Autoadesiva para Água Furtada ({dimensoes.comprimentoAguaFurtada}m)</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progresso do Cálculo */}
      {calculando && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 animate-spin" />
                <span className="font-medium">Calculando orçamento...</span>
              </div>
              <Progress value={progresso} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Processando dimensões e selecionando produtos...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={calculando}>
          Voltar
        </Button>
        
        <div className="flex gap-2">
          <Button 
            onClick={calcularOrcamento}
            disabled={calculando || dimensoes.area <= 0 || !configuracoes.sistemaShingle}
            className="min-w-32"
          >
            {calculando ? (
              <>
                <Calculator className="w-4 h-4 mr-2 animate-spin" />
                Calculando...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4 mr-2" />
                Calcular Orçamento
              </>
            )}
          </Button>
          
          <Button 
            variant="default" 
            onClick={onNext}
            disabled={calculando}
          >
            Próximo
          </Button>
        </div>
      </div>
    </div>
  )
}
