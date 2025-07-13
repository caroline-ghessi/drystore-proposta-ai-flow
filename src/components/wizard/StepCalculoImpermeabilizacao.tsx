import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { PropostaData } from "../PropostaWizard"

interface StepCalculoImpermeabilizacaoProps {
  dadosExtraidos?: any;
  onCalculoComplete: (calculo: any) => void;
  onBack: () => void;
  onNext: () => void;
}

interface DadosImpermeabilizacao {
  areaAplicacao: number;
  tipoSuperficie: string;
  sistemaImpermeabilizacao: string;
  numeroDemaos: number;
  incluiPrimer: boolean;
  incluiReforcoCantos: boolean;
  observacoes: string;
}

const TIPOS_SUPERFICIE = [
  { value: 'laje', label: 'Laje' },
  { value: 'parede', label: 'Parede' },
  { value: 'banheiro', label: 'Banheiro' },
  { value: 'cozinha', label: 'Cozinha' },
  { value: 'terraco', label: 'Terraço' },
  { value: 'piscina', label: 'Piscina' },
  { value: 'jardineira', label: 'Jardineira' },
]

const SISTEMAS_IMPERMEABILIZACAO = [
  { value: 'manta-asfaltica', label: 'Manta Asfáltica', consumoPorM2: 1.1 },
  { value: 'membrana-liquida', label: 'Membrana Líquida', consumoPorM2: 2.5 },
  { value: 'membrana-acrilica', label: 'Membrana Acrílica', consumoPorM2: 2.0 },
  { value: 'sistema-hibrido', label: 'Sistema Híbrido', consumoPorM2: 1.8 },
  { value: 'cristalizante', label: 'Cristalizante', consumoPorM2: 3.0 },
]

export function StepCalculoImpermeabilizacao({ 
  dadosExtraidos, 
  onCalculoComplete, 
  onBack, 
  onNext 
}: StepCalculoImpermeabilizacaoProps) {
  const [dados, setDados] = useState<DadosImpermeabilizacao>({
    areaAplicacao: dadosExtraidos?.area_aplicacao || 0,
    tipoSuperficie: dadosExtraidos?.tipo_superficie || '',
    sistemaImpermeabilizacao: dadosExtraidos?.sistema_impermeabilizacao || '',
    numeroDemaos: 2,
    incluiPrimer: true,
    incluiReforcoCantos: true,
    observacoes: dadosExtraidos?.observacoes || ''
  })

  const [calculando, setCalculando] = useState(false)

  const calcularOrcamento = async () => {
    setCalculando(true)
    
    try {
      // Simular cálculo - aqui viria a integração com função do Supabase
      const sistemaEscolhido = SISTEMAS_IMPERMEABILIZACAO.find(s => s.value === dados.sistemaImpermeabilizacao)
      const consumoPorM2 = sistemaEscolhido?.consumoPorM2 || 2.0
      
      // Valores simulados - serão substituídos pelos valores reais dos produtos
      const valorMaterialPorM2 = 45.00 // R$ por m²
      const valorMaoDeObraPorM2 = 25.00 // R$ por m²
      
      let valorTotal = dados.areaAplicacao * (valorMaterialPorM2 + valorMaoDeObraPorM2)
      
      // Aplicar fatores adicionais
      if (dados.incluiPrimer) {
        valorTotal += dados.areaAplicacao * 8.00 // Custo do primer
      }
      
      if (dados.incluiReforcoCantos) {
        valorTotal += dados.areaAplicacao * 0.1 * 15.00 // 10% da área em reforços
      }
      
      // Aplicar número de demãos (além da primeira)
      if (dados.numeroDemaos > 1) {
        valorTotal += (dados.numeroDemaos - 1) * dados.areaAplicacao * (valorMaterialPorM2 * 0.6)
      }

      const orcamento = {
        dadosEntrada: dados,
        consumoMaterial: dados.areaAplicacao * consumoPorM2,
        valorMaterial: dados.areaAplicacao * valorMaterialPorM2,
        valorMaoDeObra: dados.areaAplicacao * valorMaoDeObraPorM2,
        valorTotal: Math.round(valorTotal * 100) / 100,
        valorPorM2: Math.round((valorTotal / dados.areaAplicacao) * 100) / 100,
        observacoes: dados.observacoes,
        dataCalculo: new Date().toISOString()
      }

      onCalculoComplete(orcamento)
      onNext()
    } catch (error) {
      console.error('Erro ao calcular orçamento:', error)
    } finally {
      setCalculando(false)
    }
  }

  const podeCalcular = dados.areaAplicacao > 0 && dados.tipoSuperficie && dados.sistemaImpermeabilizacao

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Cálculo de Impermeabilização</h3>
        <p className="text-muted-foreground">
          Configure os parâmetros para o dimensionamento do sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Projeto</CardTitle>
          <CardDescription>
            Informe as características da superfície a ser impermeabilizada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area">Área de Aplicação (m²)</Label>
              <Input
                id="area"
                type="number"
                step="0.01"
                min="0"
                value={dados.areaAplicacao}
                onChange={(e) => setDados(prev => ({ ...prev, areaAplicacao: parseFloat(e.target.value) || 0 }))}
                placeholder="Ex: 50.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo-superficie">Tipo de Superfície</Label>
              <Select
                value={dados.tipoSuperficie}
                onValueChange={(value) => setDados(prev => ({ ...prev, tipoSuperficie: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_SUPERFICIE.map(tipo => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sistema">Sistema de Impermeabilização</Label>
            <Select
              value={dados.sistemaImpermeabilizacao}
              onValueChange={(value) => setDados(prev => ({ ...prev, sistemaImpermeabilizacao: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o sistema" />
              </SelectTrigger>
              <SelectContent>
                {SISTEMAS_IMPERMEABILIZACAO.map(sistema => (
                  <SelectItem key={sistema.value} value={sistema.value}>
                    {sistema.label} ({sistema.consumoPorM2} kg/m²)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="demaos">Número de Demãos</Label>
            <Input
              id="demaos"
              type="number"
              min="1"
              max="5"
              value={dados.numeroDemaos}
              onChange={(e) => setDados(prev => ({ ...prev, numeroDemaos: parseInt(e.target.value) || 2 }))}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="primer"
                checked={dados.incluiPrimer}
                onCheckedChange={(checked) => setDados(prev => ({ ...prev, incluiPrimer: checked as boolean }))}
              />
              <Label htmlFor="primer">Incluir Primer de Preparação</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="reforco"
                checked={dados.incluiReforcoCantos}
                onCheckedChange={(checked) => setDados(prev => ({ ...prev, incluiReforcoCantos: checked as boolean }))}
              />
              <Label htmlFor="reforco">Incluir Reforço em Cantos e Juntas</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações Especiais</Label>
            <Textarea
              id="observacoes"
              value={dados.observacoes}
              onChange={(e) => setDados(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Condições especiais, acessos, etc."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button 
          onClick={calcularOrcamento} 
          disabled={!podeCalcular || calculando}
        >
          {calculando ? 'Calculando...' : 'Calcular Orçamento'}
        </Button>
      </div>
    </div>
  )
}