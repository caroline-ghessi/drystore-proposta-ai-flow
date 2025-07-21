
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

interface DadosExtraidos {
  area_total_m2?: number
  comprimento_cumeeira?: number
  comprimento_espigao?: number
  comprimento_agua_furtada?: number
  perimetro_telhado?: number
  comprimento_calha?: number
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
  
  // Estados para dimensões do telhado
  const [dimensoes, setDimensoes] = useState({
    area: dadosExtraidos.area_total_m2 || 100,
    comprimentoCumeeira: dadosExtraidos.comprimento_cumeeira || 12,
    comprimentoEspigao: dadosExtraidos.comprimento_espigao || 0,
    comprimentoAguaFurtada: dadosExtraidos.comprimento_agua_furtada || 0,
    perimetro: dadosExtraidos.perimetro_telhado || 50,
    comprimentoCalha: dadosExtraidos.comprimento_calha || 20
  })

  const [configuracoes, setConfiguracoes] = useState({
    incluirCalha: true,
    incluirManta: true,
    corAcessorios: 'CINZA'
  })

  const [calculando, setCalculando] = useState(false)
  const [progresso, setProgresso] = useState(0)

  async function calcularOrcamento() {
    setCalculando(true)
    setProgresso(0)

    try {
      // Simular progresso
      for (let i = 0; i <= 100; i += 10) {
        setProgresso(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Mock de cálculo baseado nas dimensões reais com valores corrigidos
      const areaTelhado = dimensoes.area
      
      // Calcular itens baseado nas dimensões
      const itensCalculados = []
      
      // Telhas principais usando valores reais das composições
      const qtdTelhas = Math.ceil(areaTelhado / 3.1) // 3.1m² por pacote
      itensCalculados.push({
        categoria: "Cobertura",
        descricao: "Telha Shingle Supreme",
        quantidade: qtdTelhas,
        unidade: "pct",
        valorUnitario: 265.00,
        valorTotal: qtdTelhas * 265.00
      })

      // OSB e Subcobertura (sempre inclusos)
      itensCalculados.push({
        categoria: "Base Estrutural",
        descricao: "OSB 11,1mm",
        quantidade: Math.ceil(areaTelhado * 1.05), // 5% quebra
        unidade: "m²",
        valorUnitario: 28.50,
        valorTotal: Math.ceil(areaTelhado * 1.05) * 28.50
      })

      itensCalculados.push({
        categoria: "Impermeabilização",
        descricao: "Subcobertura TYVEK",
        quantidade: Math.ceil(areaTelhado * 1.10), // 10% sobreposição
        unidade: "m²",
        valorUnitario: 12.80,
        valorTotal: Math.ceil(areaTelhado * 1.10) * 12.80
      })

      // Cumeeiras (se houver)
      if (dimensoes.comprimentoCumeeira > 0) {
        const qtdCumeeiras = Math.ceil(dimensoes.comprimentoCumeeira / 5) // 5m por pacote
        itensCalculados.push({
          categoria: "Acabamento",
          descricao: "Cap de Cumeeira",
          quantidade: qtdCumeeiras,
          unidade: "pct",
          valorUnitario: 89.50,
          valorTotal: qtdCumeeiras * 89.50
        })
      }

      // Cap de Cumeeira para espigão (se houver)
      if (dimensoes.comprimentoEspigao > 0) {
        const qtdEspigao = Math.ceil(dimensoes.comprimentoEspigao / 5)
        itensCalculados.push({
          categoria: "Acabamento",
          descricao: "Cap de Cumeeira para Espigão",
          quantidade: qtdEspigao,
          unidade: "pct",
          valorUnitario: 89.50,
          valorTotal: qtdEspigao * 89.50
        })
      }

      // Fita Autoadesiva para água furtada (se houver) - valor corrigido
      if (dimensoes.comprimentoAguaFurtada > 0) {
        const qtdFita = Math.ceil(dimensoes.comprimentoAguaFurtada / 0.9) // 0.9m por rolo
        itensCalculados.push({
          categoria: "Vedação",
          descricao: "Fita Autoadesiva para Água Furtada",
          quantidade: qtdFita,
          unidade: "rl",
          valorUnitario: 45.80, // Valor corrigido após migração
          valorTotal: qtdFita * 45.80
        })
      }

      // Manta Starter (se incluída)
      if (configuracoes.incluirManta && dimensoes.perimetro > 0) {
        const areaManta = dimensoes.perimetro * 0.25 // 25cm de largura
        itensCalculados.push({
          categoria: "Impermeabilização",
          descricao: "Manta Starter",
          quantidade: Math.ceil(areaManta),
          unidade: "m²",
          valorUnitario: 18.90,
          valorTotal: Math.ceil(areaManta) * 18.90
        })
      }

      // Calhas (se incluídas)
      if (configuracoes.incluirCalha && dimensoes.comprimentoCalha > 0) {
        itensCalculados.push({
          categoria: "Sistema de Águas",
          descricao: "Calha PVC 125mm",
          quantidade: Math.ceil(dimensoes.comprimentoCalha / 3), // 3m por barra
          unidade: "br",
          valorUnitario: 35.50,
          valorTotal: Math.ceil(dimensoes.comprimentoCalha / 3) * 35.50
        })
      }

      // Fixações sempre incluídas
      itensCalculados.push({
        categoria: "Fixação",
        descricao: "Pregos e Grampos",
        quantidade: 1,
        unidade: "kit",
        valorUnitario: areaTelhado * 2.50,
        valorTotal: areaTelhado * 2.50
      })

      const valorTotal = itensCalculados.reduce((total, item) => total + item.valorTotal, 0)

      const orcamentoCompleto: OrcamentoCompleto = {
        valorTotal,
        itens: itensCalculados,
        resumo: {
          totalItens: itensCalculados.length,
          pesoTotal: areaTelhado * 12, // 12kg/m²
          economiaVsCeramica: areaTelhado * (40 - 12) // economia de peso vs cerâmica
        }
      }

      onCalculoComplete(orcamentoCompleto)
      
      toast({
        title: "Cálculo Concluído!",
        description: `Orçamento de R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} calculado com sucesso.`
      })

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
          Configure as dimensões finais para o cálculo preciso do orçamento
        </p>
      </div>

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

          {/* Sistema de Calhas */}
          <div>
            <h4 className="font-medium mb-3 text-green-700">Sistema de Calhas</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="incluirCalha"
                  checked={configuracoes.incluirCalha}
                  onCheckedChange={(checked) => setConfiguracoes({...configuracoes, incluirCalha: checked})}
                />
                <Label htmlFor="incluirCalha">Incluir sistema de calhas</Label>
              </div>

              {configuracoes.incluirCalha && (
                <div>
                  <Label htmlFor="comprimentoCalha">Comprimento de Calhas (m)</Label>
                  <Input
                    id="comprimentoCalha"
                    type="number"
                    value={dimensoes.comprimentoCalha}
                    onChange={(e) => setDimensoes({...dimensoes, comprimentoCalha: parseFloat(e.target.value) || 0})}
                    step="0.01"
                    min="0"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="incluirManta"
              checked={configuracoes.incluirManta}
              onCheckedChange={(checked) => setConfiguracoes({...configuracoes, incluirManta: checked})}
            />
            <Label htmlFor="incluirManta">Incluir manta starter</Label>
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
            disabled={calculando || dimensoes.area <= 0}
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
