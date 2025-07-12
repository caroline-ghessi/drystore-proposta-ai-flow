import { useState, useEffect } from "react"
import BasePropostaLayout from "./BasePropostaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { 
  Sun, 
  Zap, 
  Battery, 
  Shield, 
  CheckCircle, 
  TrendingUp,
  Leaf,
  Clock,
  Award,
  Users,
  MapPin,
  BarChart3,
  Home,
  DollarSign,
  ArrowRight,
  Star,
  Wind,
  Thermometer
} from "lucide-react"
import FluxoPagamento from "@/components/FluxoPagamento"

interface EnergiaSolarPropostaPageProps {
  proposta: any
  onAceitarProposta: (formaPagamento: string) => void
}

export default function EnergiaSolarPropostaPage({ proposta, onAceitarProposta }: EnergiaSolarPropostaPageProps) {
  const [showPagamento, setShowPagamento] = useState(false)
  const [autonomiaBaterias, setAutonomiaBaterias] = useState([8])
  const [anoSimulacao, setAnoSimulacao] = useState([1])

  // Dados mockados realistas para Ana Souza
  const dadosEnergiaSolar = {
    cliente: proposta.cliente_nome || "Ana Souza",
    tipo_sistema: "hibrido", // on-grid, hibrido, off-grid, baterias_apenas
    consumo_mensal_kwh: 450,
    potencia_kwp: 5.0,
    geracao_anual_kwh: 7300,
    payback_anos: 4.5,
    economia_percent: 85,
    valor_total: 22500,
    qtd_paineis: 9,
    modelo_inversor: "Growatt 5kW Híbrido - Fabricado em Manaus",
    inclui_baterias: true,
    capacidade_baterias_kwh: 10,
    co2_reduzido_toneladas: 3.2,
    instalacao_dias: 7,
    numeroProposta: proposta.id?.slice(0, 8) || "ES001",
    dataProposta: new Date().toLocaleDateString('pt-BR'),
    autonomia_horas: 8,
    valor_mensal_economia: 320,
    economia_25_anos: 96000
  }

  const handleContactWhatsApp = () => {
    const message = `Olá! Gostaria de falar sobre a proposta de energia solar #${dadosEnergiaSolar.numeroProposta} para ${dadosEnergiaSolar.cliente}.`
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleRequestChanges = () => {
    alert("Em breve você receberá um contato para discutir as alterações desejadas.")
  }

  const calcularEconomiaAcumulada = (anos: number) => {
    return dadosEnergiaSolar.valor_mensal_economia * 12 * anos
  }

  return (
    <BasePropostaLayout
      cliente={dadosEnergiaSolar.cliente}
      tipoProduto={`Energia Solar ${dadosEnergiaSolar.tipo_sistema.charAt(0).toUpperCase() + dadosEnergiaSolar.tipo_sistema.slice(1)}`}
      numeroProposta={dadosEnergiaSolar.numeroProposta}
      dataProposta={dadosEnergiaSolar.dataProposta}
      totalValue={`R$ ${dadosEnergiaSolar.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
      onAcceptProposal={() => setShowPagamento(true)}
      onContactWhatsApp={handleContactWhatsApp}
      onRequestChanges={handleRequestChanges}
    >
      {/* Hero Section com Tema Solar */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-500 to-green-500 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAzIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIzIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        <div className="container mx-auto px-6 text-center relative">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Sun className="h-12 w-12 text-yellow-300 animate-pulse" />
              {dadosEnergiaSolar.inclui_baterias && (
                <Battery className="h-10 w-10 text-green-300" />
              )}
            </div>
            <h1 className="text-5xl font-bold mb-6 animate-fade-in">
              Gere e Armazene Sua Própria Energia <br />
              <span className="text-yellow-300">Independente e Segura</span>
            </h1>
            <p className="text-xl opacity-90 mb-8 animate-slide-in">
              Solução de {dadosEnergiaSolar.potencia_kwp} kWp para reduzir sua conta em até{' '}
              <span className="font-bold text-yellow-300">{dadosEnergiaSolar.economia_percent}%</span>, 
              com payback em {dadosEnergiaSolar.payback_anos} anos. Instalação em {dadosEnergiaSolar.instalacao_dias} dias.
            </p>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div className="bg-white/10 rounded-lg p-4">
                <Sun className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
                <div className="font-semibold">{dadosEnergiaSolar.potencia_kwp} kWp</div>
                <div className="text-sm opacity-80">Potência</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-300" />
                <div className="font-semibold">{dadosEnergiaSolar.economia_percent}%</div>
                <div className="text-sm opacity-80">Economia</div>
              </div>
              {dadosEnergiaSolar.inclui_baterias && (
                <div className="bg-white/10 rounded-lg p-4">
                  <Battery className="h-8 w-8 mx-auto mb-2 text-green-300" />
                  <div className="font-semibold">{dadosEnergiaSolar.capacidade_baterias_kwh} kWh</div>
                  <div className="text-sm opacity-80">Armazenamento</div>
                </div>
              )}
              <div className="bg-white/10 rounded-lg p-4">
                <Shield className="h-8 w-8 mx-auto mb-2 text-blue-300" />
                <div className="font-semibold">25 Anos</div>
                <div className="text-sm opacity-80">Garantia</div>
              </div>
            </div>
            <Button size="lg" className="mt-8 bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
              <ArrowRight className="h-5 w-5 mr-2" />
              Explore Sua Economia
            </Button>
          </div>
        </div>
      </section>

      {/* Introdução Personalizada */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card className="border-blue-200 shadow-card bg-gradient-to-r from-blue-50 to-green-50">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4 text-blue-900">Sua Solução Personalizada</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Baseado no seu consumo de <span className="font-bold text-blue-700">{dadosEnergiaSolar.consumo_mensal_kwh} kWh/mês</span>, 
                projetamos um sistema que gera <span className="font-bold text-green-700">{dadosEnergiaSolar.geracao_anual_kwh} kWh/ano</span>, 
                reduzindo CO₂ em <span className="font-bold text-green-700">{dadosEnergiaSolar.co2_reduzido_toneladas} toneladas</span>. 
                Como pioneiros em soluções com baterias, garantimos proteção contra apagões – 
                {dadosEnergiaSolar.inclui_baterias ? 
                  `com ${dadosEnergiaSolar.capacidade_baterias_kwh} kWh para total autonomia.` : 
                  'podemos adicionar armazenamento para total autonomia.'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Análise Personalizada com Gráficos */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">
            Sua Análise Personalizada
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Gráfico de Consumo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Consumo Atual vs. Pós-Solar
                </CardTitle>
                <CardDescription>Comparação mensal em kWh</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Consumo da Rede</span>
                    <span className="text-destructive font-bold">{dadosEnergiaSolar.consumo_mensal_kwh * 0.15} kWh</span>
                  </div>
                  <Progress value={15} className="h-3" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Geração Solar</span>
                    <span className="text-green-600 font-bold">{Math.round(dadosEnergiaSolar.geracao_anual_kwh / 12)} kWh</span>
                  </div>
                  <Progress value={85} className="h-3 bg-green-100" />
                  
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-700">R$ {dadosEnergiaSolar.valor_mensal_economia}</div>
                      <div className="text-sm text-green-600">Economia mensal projetada</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Simulador de Retorno */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Simulador de Retorno
                </CardTitle>
                <CardDescription>Arraste para simular economia ao longo dos anos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Anos: {anoSimulacao[0]}</span>
                      <span className="text-sm text-muted-foreground">Máx: 25 anos</span>
                    </div>
                    <Slider
                      value={anoSimulacao}
                      onValueChange={setAnoSimulacao}
                      max={25}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-700">
                        R$ {calcularEconomiaAcumulada(anoSimulacao[0]).toLocaleString('pt-BR')}
                      </div>
                      <div className="text-xs text-blue-600">Economia Acumulada</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-700">
                        {((calcularEconomiaAcumulada(anoSimulacao[0]) / dadosEnergiaSolar.valor_total - 1) * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-green-600">ROI</div>
                    </div>
                  </div>
                  
                  {dadosEnergiaSolar.inclui_baterias && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                      <div className="flex items-center gap-2">
                        <Battery className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium">Autonomia: {dadosEnergiaSolar.autonomia_horas}h durante apagões</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefícios com Cards */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">
            Benefícios da Energia Solar
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover-lift border-blue-200">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Sun className="h-6 w-6 text-blue-700" />
                </div>
                <CardTitle className="text-blue-900">Produza Sua Energia</CardTitle>
                <CardDescription>Reduza conta em até 95%</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Painéis de alta eficiência (22%) produzem {Math.round(dadosEnergiaSolar.geracao_anual_kwh / 12)} kWh/mês, 
                  cobrindo {dadosEnergiaSolar.economia_percent}% do seu consumo.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift border-green-200">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Battery className="h-6 w-6 text-green-700" />
                </div>
                <CardTitle className="text-green-900">Armazenamento Inteligente</CardTitle>
                <CardDescription>
                  {dadosEnergiaSolar.inclui_baterias ? 'Proteção contra apagões' : 'Upgrade disponível'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {dadosEnergiaSolar.inclui_baterias ? 
                    `Baterias de ${dadosEnergiaSolar.capacidade_baterias_kwh} kWh garantem autonomia de ${dadosEnergiaSolar.autonomia_horas}h durante falhas na rede.` :
                    'Adicione baterias fabricadas em Manaus para proteção total contra apagões – fale conosco!'
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift border-green-200">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Leaf className="h-6 w-6 text-green-700" />
                </div>
                <CardTitle className="text-green-900">Sustentabilidade</CardTitle>
                <CardDescription>Energia limpa e renovável</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Redução de {dadosEnergiaSolar.co2_reduzido_toneladas} toneladas de CO₂ por ano, 
                  equivalente a plantar 50 árvores anualmente.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift border-yellow-200">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-yellow-700" />
                </div>
                <CardTitle className="text-yellow-900">Durabilidade</CardTitle>
                <CardDescription>Componentes nacionais resistentes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Inversores e baterias fabricados em Manaus, garantindo qualidade brasileira, 
                  incentivos fiscais e suporte local rápido.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift border-blue-200">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-blue-700" />
                </div>
                <CardTitle className="text-blue-900">Flexibilidade</CardTitle>
                <CardDescription>Sistemas adaptáveis</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sistemas on-grid, híbrido, off-grid ou apenas baterias. 
                  Esta proposta é {dadosEnergiaSolar.tipo_sistema}, mas podemos adaptar conforme sua necessidade.
                </p>
              </CardContent>
            </Card>

            {!dadosEnergiaSolar.inclui_baterias && (
              <Card className="hover-lift border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                    <Battery className="h-6 w-6 text-yellow-700" />
                  </div>
                  <CardTitle className="text-yellow-900">Upgrade para Baterias</CardTitle>
                  <CardDescription>Proteção extra disponível</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Adicione baterias para total independência energética. 
                    Entre em contato para incluir armazenamento na sua proposta!
                  </p>
                  <Button variant="outline" size="sm" className="mt-3">
                    Adicionar Baterias
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Especificações Técnicas */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">
            Especificações do Seu Sistema
          </h2>
          
          <div className="max-w-6xl mx-auto">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-center">Componentes do Sistema</CardTitle>
                <CardDescription className="text-center">Todos os equipamentos inclusos na proposta</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Sun className="h-8 w-8 text-blue-700" />
                    </div>
                    <div className="font-bold text-2xl text-blue-700">{dadosEnergiaSolar.qtd_paineis}</div>
                    <div className="text-sm text-muted-foreground">Painéis 550W</div>
                    <div className="text-xs text-muted-foreground">Eficiência 22%</div>
                  </div>
                  <div>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Zap className="h-8 w-8 text-green-700" />
                    </div>
                    <div className="font-bold text-lg text-green-700">Inversor 5kW</div>
                    <div className="text-sm text-muted-foreground">Growatt Híbrido</div>
                    <div className="text-xs text-muted-foreground">Fabricado em Manaus</div>
                  </div>
                  {dadosEnergiaSolar.inclui_baterias && (
                    <div>
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Battery className="h-8 w-8 text-yellow-700" />
                      </div>
                      <div className="font-bold text-lg text-yellow-700">{dadosEnergiaSolar.capacidade_baterias_kwh} kWh</div>
                      <div className="text-sm text-muted-foreground">Baterias Lítio</div>
                      <div className="text-xs text-muted-foreground">Ciclos: 2000+</div>
                    </div>
                  )}
                  <div>
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-8 w-8 text-purple-700" />
                    </div>
                    <div className="font-bold text-lg text-purple-700">{dadosEnergiaSolar.instalacao_dias} dias</div>
                    <div className="text-sm text-muted-foreground">Instalação</div>
                    <div className="text-xs text-muted-foreground">Equipe certificada</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Diagrama do Sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Diagrama do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center space-x-4 p-8">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-yellow-100 rounded-lg flex items-center justify-center mb-2">
                      <Sun className="h-10 w-10 text-yellow-600" />
                    </div>
                    <span className="text-sm font-medium">Painéis Solares</span>
                  </div>
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                      <Zap className="h-10 w-10 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">Inversor</span>
                  </div>
                  {dadosEnergiaSolar.inclui_baterias && (
                    <>
                      <ArrowRight className="h-6 w-6 text-gray-400" />
                      <div className="text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                          <Battery className="h-10 w-10 text-green-600" />
                        </div>
                        <span className="text-sm font-medium">Baterias</span>
                      </div>
                    </>
                  )}
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                  <div className="text-center">
                    <div className="w-20 h-20 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                      <Home className="h-10 w-10 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium">Sua Casa</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Por Que DryStore - Pioneirismo */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-6 text-blue-900">
              Por que DryStore é a Escolha Segura e Pioneira?
            </h2>
            <p className="text-lg text-muted-foreground">
              Uma das primeiras empresas a se especializar em soluções com baterias no Brasil, 
              oferecendo independência real: Produza e armazene energia, ficando seguro contra falhas da rede.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover-lift">
              <CardContent className="p-6">
                <Award className="h-12 w-12 text-blue-700 mx-auto mb-4" />
                <h3 className="font-bold mb-2 text-blue-900">Pioneirismo</h3>
                <p className="text-sm text-muted-foreground">
                  Especialistas em sistemas híbrido/off-grid desde 2018, 
                  com mais de 1.500 instalações realizadas
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift">
              <CardContent className="p-6">
                <MapPin className="h-12 w-12 text-green-700 mx-auto mb-4" />
                <h3 className="font-bold mb-2 text-green-900">Produção Nacional</h3>
                <p className="text-sm text-muted-foreground">
                  Baterias e inversores feitos em Manaus – qualidade brasileira, 
                  suporte local e incentivos fiscais
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift">
              <CardContent className="p-6">
                <Shield className="h-12 w-12 text-purple-700 mx-auto mb-4" />
                <h3 className="font-bold mb-2 text-purple-900">Garantia Estendida</h3>
                <p className="text-sm text-muted-foreground">
                  25 anos em painéis, 10 anos em baterias/inversores, 
                  com suporte técnico 24/7
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-blue-700 mx-auto mb-4" />
                <h3 className="font-bold mb-2 text-blue-900">Instaladores Certificados</h3>
                <p className="text-sm text-muted-foreground">
                  Técnicos certificados CREA com mais de 1.500 instalações 
                  sem reclamações
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift">
              <CardContent className="p-6">
                <DollarSign className="h-12 w-12 text-green-700 mx-auto mb-4" />
                <h3 className="font-bold mb-2 text-green-900">Financiamento Fácil</h3>
                <p className="text-sm text-muted-foreground">
                  Parcerias BNDES/Solar com condições especiais 
                  para energia renovável
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift bg-yellow-50 border-yellow-200">
              <CardContent className="p-6">
                <Star className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="font-bold mb-2 text-yellow-900">Satisfação 100%</h3>
                <p className="text-sm text-muted-foreground">
                  "Com baterias DryStore, nunca mais fiquei no escuro!"
                  - Cliente Maria S.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Depoimentos */}
          <div className="mt-12 max-w-3xl mx-auto">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-lg italic mb-4">
                  "O sistema híbrido da DryStore me deu total tranquilidade. 
                  Durante os apagões, minha casa continua funcionando normalmente. 
                  A economia na conta de luz foi exatamente como prometido!"
                </blockquote>
                <footer className="font-semibold">- Roberto Silva, Cliente DryStore há 2 anos</footer>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Timeline de Instalação */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">
            Processo de Instalação
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-5 gap-4">
              {[
                { step: "1", title: "Avaliação Gratuita", desc: "Análise técnica do local", icon: Home },
                { step: "2", title: "Projeto Personalizado", desc: "Simulação com baterias", icon: BarChart3 },
                { step: "3", title: "Fabricação em Manaus", desc: "Produção nacional", icon: MapPin },
                { step: "4", title: "Instalação Profissional", desc: "Equipe certificada", icon: Users },
                { step: "5", title: "Monitoramento 24/7", desc: "App para acompanhar", icon: Shield }
              ].map((item, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <item.icon className="h-6 w-6 text-blue-700" />
                    </div>
                    <div className="font-bold text-blue-700 mb-1">Etapa {item.step}</div>
                    <div className="font-semibold text-sm mb-1">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Clock className="h-4 w-4 mr-2" />
                Instalação completa em {dadosEnergiaSolar.instalacao_dias} dias úteis
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Preços - APENAS NO FINAL */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">
            Investimento que se Paga
          </h2>
          
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
              <CardTitle className="text-center text-2xl">Breakdown de Investimento</CardTitle>
              <CardDescription className="text-center text-white/90">
                Transparência total nos valores
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Painéis Solares (9x 550W)</span>
                  <span className="font-bold">R$ 8.100,00</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Inversor Híbrido 5kW (Manaus)</span>
                  <span className="font-bold">R$ 4.500,00</span>
                </div>
                {dadosEnergiaSolar.inclui_baterias && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Baterias Lítio 10kWh (Manaus)</span>
                    <span className="font-bold">R$ 6.800,00</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Estrutura de Fixação</span>
                  <span className="font-bold">R$ 1.200,00</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Instalação Certificada</span>
                  <span className="font-bold">R$ 1.900,00</span>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-between items-center text-xl font-bold text-blue-700">
                  <span>Total</span>
                  <span>R$ {dadosEnergiaSolar.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-green-600 mb-1">Payback do investimento</div>
                    <div className="text-2xl font-bold text-green-700">{dadosEnergiaSolar.payback_anos} anos</div>
                    <div className="text-sm text-green-600">Economia de 25 anos: R$ {dadosEnergiaSolar.economia_25_anos.toLocaleString('pt-BR')}</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">💳 Parcelado</h4>
                  <p className="text-2xl font-bold text-blue-700">12x sem juros</p>
                  <p className="text-sm text-muted-foreground">R$ {Math.round(dadosEnergiaSolar.valor_total / 12).toLocaleString('pt-BR')}/mês</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">🏦 Financiamento BNDES</h4>
                  <p className="text-2xl font-bold text-green-700">Até 120x</p>
                  <p className="text-sm text-muted-foreground">Taxa especial para energia renovável</p>
                </div>
              </div>
              
              {!dadosEnergiaSolar.inclui_baterias && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Battery className="h-5 w-5 text-yellow-600" />
                    <span className="font-semibold text-yellow-800">Upgrade para Baterias Disponível</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Adicione baterias para proteção extra contra apagões e total independência energética. 
                    Investimento adicional: R$ 6.800,00
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Modal de Pagamento */}
      {showPagamento && (
        <FluxoPagamento
          proposta={{
            valor: dadosEnergiaSolar.valor_total,
            produtos: ["Sistema Solar", "Instalação"],
            cliente: dadosEnergiaSolar.cliente
          }}
          onAceitar={onAceitarProposta}
        />
      )}
    </BasePropostaLayout>
  )
}