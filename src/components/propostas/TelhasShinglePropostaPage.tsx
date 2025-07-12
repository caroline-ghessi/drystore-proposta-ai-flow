import { useState } from "react"
import BasePropostaLayout from "./BasePropostaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Ruler,
  Volume2,
  Thermometer,
  Recycle,
  Award,
  TrendingUp,
  X,
  Wind,
  Droplet,
  Palette,
  Zap,
  Users,
  Calendar,
  PlayCircle,
  Home,
  DollarSign
} from "lucide-react"
import FluxoPagamento from "@/components/FluxoPagamento"

interface TelhasShinglePropostaPageProps {
  proposta: any
  onAceitarProposta: (formaPagamento: string) => void
}

export default function TelhasShinglePropostaPage({ proposta, onAceitarProposta }: TelhasShinglePropostaPageProps) {
  const [showPagamento, setShowPagamento] = useState(false)

  // Processar dados específicos de telhas shingle com mock realista
  const dadosShingle = {
    cliente: proposta.cliente_nome || "João Silva da Costa",
    areaTelhado: 120, // m²
    qtdTelhas: 480, // unidades
    corEscolhida: "Charcoal Black",
    tipoShingle: "Premium Asphalt Shingle",
    pesoShingle: "12 kg/m²", // 80% mais leve que cerâmica
    espessuraTotal: "5,2mm + Manta",
    resistenciaVento: "200 km/h",
    garantiaAnos: 25,
    instalacaoDias: 4,
    economiaManutencao: 30, // % em relação a telhas tradicionais
    paybackAnos: 7,
    valorTotal: proposta.valor_total || 8500,
    durabilidadeAnos: 30,
    isolamentoTermico: 25, // % redução de calor
    isolamentoAcustico: 15, // dB redução
    numeroProposta: proposta.id?.slice(0, 8) || "TS001",
    dataProposta: new Date().toLocaleDateString('pt-BR')
  }

  const handleContactWhatsApp = () => {
    const message = `Olá! Gostaria de falar sobre a proposta de telhas shingle #${dadosShingle.numeroProposta} para ${dadosShingle.cliente}.`
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleRequestChanges = () => {
    alert("Em breve você receberá um contato para discutir as alterações desejadas.")
  }

  return (
    <BasePropostaLayout
      cliente={dadosShingle.cliente}
      tipoProduto="Telhas Shingle Premium de Alta Durabilidade"
      numeroProposta={dadosShingle.numeroProposta}
      dataProposta={dadosShingle.dataProposta}
      totalValue={`R$ ${dadosShingle.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
      onAcceptProposal={() => setShowPagamento(true)}
      onContactWhatsApp={handleContactWhatsApp}
      onRequestChanges={handleRequestChanges}
    >
      {/* Hero Section - Transformação do Telhado */}
      <section className="bg-gradient-to-br from-amber-900 via-amber-800 to-green-800 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6 animate-fade-in">
              Transforme Seu Telhado com <br />
              <span className="text-amber-200">Durabilidade e Estética Incomparáveis</span>
            </h1>
            <p className="text-xl opacity-90 mb-8 animate-slide-in">
              Cobertura de {dadosShingle.areaTelhado}m² em Telha Shingle {dadosShingle.corEscolhida}, 
              instalada em apenas {dadosShingle.instalacaoDias} dias
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/10 rounded-lg p-4">
                <Shield className="h-8 w-8 mx-auto mb-2 text-amber-200" />
                <div className="font-semibold">Durabilidade {dadosShingle.durabilidadeAnos}+ Anos</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <Wind className="h-8 w-8 mx-auto mb-2 text-amber-200" />
                <div className="font-semibold">Resiste até {dadosShingle.resistenciaVento}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <Award className="h-8 w-8 mx-auto mb-2 text-amber-200" />
                <div className="font-semibold">Garantia {dadosShingle.garantiaAnos} Anos</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introdução Personalizada */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card className="border-amber-200 shadow-card bg-gradient-to-r from-amber-50 to-green-50">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4 text-amber-900">Sua Solução Personalizada</h2>
              <p className="text-lg text-gray-700">
                Baseado nas suas necessidades, projetamos uma solução que garante 
                economia de <span className="font-bold text-green-700">{dadosShingle.economiaManutencao}%</span> em 
                manutenção e payback em <span className="font-bold text-amber-700">{dadosShingle.paybackAnos} anos</span>, 
                usando materiais premium com resistência comprovada.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Comparativo: Shingle vs Telhas Tradicionais */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-amber-900">
            Shingle vs. Telhas Tradicionais
          </h2>
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Telhas Tradicionais */}
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <X className="h-5 w-5" />
                    Telhas Tradicionais (Cerâmica/Concreto)
                  </CardTitle>
                  <CardDescription>Limitações que você evita</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Peso excessivo: 40kg/m²</strong>
                      <p className="text-sm text-muted-foreground">Necessita reforço estrutural</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Quebras frequentes em 2-3 anos</strong>
                      <p className="text-sm text-muted-foreground">Granizo e tempestades</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Isolamento térmico limitado</strong>
                      <p className="text-sm text-muted-foreground">Calor excessivo no verão</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Manutenção cara: R$1.000+/ano</strong>
                      <p className="text-sm text-muted-foreground">Trocas e reparos constantes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Telhas Shingle */}
              <Card className="border-amber-300 bg-gradient-to-br from-amber-50 to-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-800">
                    <Shield className="h-5 w-5" />
                    Telhas Shingle DryStore
                  </CardTitle>
                  <CardDescription>Tecnologia premium</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Leveza: apenas {dadosShingle.pesoShingle}</strong>
                      <p className="text-sm text-muted-foreground">80% mais leve, sem reforços</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Resistência {dadosShingle.resistenciaVento}</strong>
                      <p className="text-sm text-muted-foreground">Resiste granizo e tempestades</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Isolamento térmico {dadosShingle.isolamentoTermico}%</strong>
                      <p className="text-sm text-muted-foreground">Reduz calor e energia</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Manutenção mínima: R$50/ano</strong>
                      <p className="text-sm text-muted-foreground">Praticamente zero manutenção</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios Premium */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-amber-900">
            Benefícios Incomparáveis do Shingle
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover-lift border-amber-200">
              <CardHeader>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-amber-700" />
                </div>
                <CardTitle className="text-amber-900">Durabilidade Excepcional</CardTitle>
                <CardDescription>{dadosShingle.durabilidadeAnos}+ Anos sem Problemas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Composição asfalto + fibra de vidro com granulado mineral resistente a UV, 
                  ventos de até {dadosShingle.resistenciaVento} e granizo classe 4.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift border-green-200">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Thermometer className="h-6 w-6 text-green-700" />
                </div>
                <CardTitle className="text-green-900">Conforto Térmico</CardTitle>
                <CardDescription>Redução de {dadosShingle.isolamentoTermico}% no Calor</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Isolamento térmico superior reduz temperatura interna em até {dadosShingle.isolamentoTermico}% 
                  e ruído de chuva em {dadosShingle.isolamentoAcustico}dB.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift border-blue-200">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Palette className="h-6 w-6 text-blue-700" />
                </div>
                <CardTitle className="text-blue-900">Estética Premium</CardTitle>
                <CardDescription>Variedade de Cores e Texturas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Disponível em cores que imitam ardósia, madeira e pedra natural. 
                  Permite curvas e arquiteturas complexas impossíveis com telhas rígidas.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Especificações Técnicas */}
          <div className="mt-16">
            <Card className="bg-gradient-to-r from-amber-50 to-green-50 border-amber-200">
              <CardHeader className="text-center">
                <CardTitle className="text-amber-900">Especificações do Seu Projeto</CardTitle>
                <CardDescription>Dimensões e componentes calculados para sua residência</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Home className="h-8 w-8 text-amber-700" />
                    </div>
                    <div className="font-bold text-2xl text-amber-700">{dadosShingle.areaTelhado}m²</div>
                    <div className="text-sm text-muted-foreground">Área do Telhado</div>
                  </div>
                  <div>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-8 w-8 text-green-700" />
                    </div>
                    <div className="font-bold text-2xl text-green-700">{dadosShingle.qtdTelhas}</div>
                    <div className="text-sm text-muted-foreground">Telhas {dadosShingle.corEscolhida}</div>
                  </div>
                  <div>
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Droplet className="h-8 w-8 text-blue-700" />
                    </div>
                    <div className="font-bold text-2xl text-blue-700">{dadosShingle.pesoShingle}</div>
                    <div className="text-sm text-muted-foreground">Peso por m²</div>
                  </div>
                  <div>
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-8 w-8 text-purple-700" />
                    </div>
                    <div className="font-bold text-2xl text-purple-700">{dadosShingle.instalacaoDias}</div>
                    <div className="text-sm text-muted-foreground">Dias de Instalação</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Por que DryStore */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-6 text-amber-900">
              Por que DryStore é a Melhor Escolha em Shingle?
            </h2>
            <p className="text-lg text-muted-foreground">
              Líder em Shingle no Brasil com 10+ Anos de Experiência e 
              Parcerias Exclusivas com IKO/GAF
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <Shield className="h-12 w-12 text-amber-700 mx-auto mb-4" />
                <h3 className="font-bold mb-2 text-amber-900">Experiência 10+ Anos</h3>
                <p className="text-sm text-muted-foreground">
                  Única empresa especializada em shingle no Brasil com 
                  mais de 2.000 telhados instalados
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Award className="h-12 w-12 text-green-700 mx-auto mb-4" />
                <h3 className="font-bold mb-2 text-green-900">Parcerias IKO/GAF</h3>
                <p className="text-sm text-muted-foreground">
                  Distribuidor oficial das melhores marcas mundiais 
                  de shingle com certificação internacional
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-blue-700 mx-auto mb-4" />
                <h3 className="font-bold mb-2 text-blue-900">Instaladores Certificados</h3>
                <p className="text-sm text-muted-foreground">
                  Equipe treinada diretamente pelos fabricantes 
                  com suporte técnico 24/7
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Depoimento */}
          <div className="mt-12">
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Award key={i} className="h-5 w-5 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <blockquote className="text-lg italic text-foreground mb-4">
                  "5 anos depois da instalação e meu telhado shingle está perfeito! 
                  Nem granizo nem vento forte causaram qualquer dano."
                </blockquote>
                <cite className="text-sm text-muted-foreground">
                  — Cliente Roberto M., Arquiteto, Alphaville - SP
                </cite>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Timeline de Instalação */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-amber-900">
            Processo de Instalação Especializada
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-amber-700">1</span>
                </div>
                <h3 className="font-bold mb-2 text-amber-900">Avaliação Gratuita</h3>
                <p className="text-sm text-muted-foreground">
                  Inspeção do telhado, medições precisas e escolha de cores
                </p>
                <Badge variant="outline" className="mt-2">1 dia</Badge>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-700">2</span>
                </div>
                <h3 className="font-bold mb-2 text-green-900">Entrega Express</h3>
                <p className="text-sm text-muted-foreground">
                  Material premium entregue direto da fábrica
                </p>
                <Badge variant="outline" className="mt-2">48 horas</Badge>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-700">3</span>
                </div>
                <h3 className="font-bold mb-2 text-blue-900">Instalação Profissional</h3>
                <p className="text-sm text-muted-foreground">
                  Instalação com técnicas especializadas e normas IKO/GAF
                </p>
                <Badge variant="outline" className="mt-2">{dadosShingle.instalacaoDias} dias</Badge>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-700">4</span>
                </div>
                <h3 className="font-bold mb-2 text-purple-900">Inspeção Final</h3>
                <p className="text-sm text-muted-foreground">
                  Teste de estanqueidade e certificado de garantia
                </p>
                <Badge variant="outline" className="mt-2">0.5 dia</Badge>
              </div>
            </div>

            {/* Vídeo Placeholder */}
            <div className="mt-12 text-center">
              <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                <CardContent className="p-8">
                  <PlayCircle className="h-16 w-16 mx-auto mb-4 text-amber-400" />
                  <h3 className="font-bold mb-2">Veja Como Fazemos a Instalação</h3>
                  <p className="text-gray-300 mb-4">
                    Processo completo de instalação de telhas shingle em 3 minutos
                  </p>
                  <Button variant="secondary" size="lg">
                    Assistir Demonstração
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Preços e ROI */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-amber-900">
            Investimento com Retorno Garantido
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Breakdown de Preços */}
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <DollarSign className="h-5 w-5" />
                  Detalhamento do Investimento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Telhas Shingle Premium ({dadosShingle.qtdTelhas} unidades)</span>
                    <span className="font-semibold">R$ 4.800,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Manta asfáltica + acessórios</span>
                    <span className="font-semibold">R$ 1.200,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Instalação especializada</span>
                    <span className="font-semibold">R$ 2.500,00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold text-amber-900">
                    <span>Total</span>
                    <span>R$ {dadosShingle.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ROI e Economia */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <TrendingUp className="h-5 w-5" />
                  Seu Retorno do Investimento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-700 mb-2">
                    {dadosShingle.paybackAnos} anos
                  </div>
                  <p className="text-sm text-muted-foreground">Tempo de retorno</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Economia anual em manutenção:</span>
                    <span className="font-semibold text-green-700">R$ 1.200,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Economia em {dadosShingle.garantiaAnos} anos:</span>
                    <span className="font-semibold text-green-700">R$ 30.000,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valorização do imóvel:</span>
                    <span className="font-semibold text-green-700">+8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Opções de Pagamento */}
          <Card className="border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-amber-900">Opções de Pagamento</CardTitle>
              <CardDescription>Escolha a melhor forma para seu orçamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center bg-green-50 border-green-200">
                  <div className="font-bold text-green-700 mb-1">À Vista</div>
                  <div className="text-2xl font-bold text-green-800">R$ 8.075,00</div>
                  <div className="text-sm text-green-600">5% desconto</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="font-bold mb-1">6x sem juros</div>
                  <div className="text-2xl font-bold">R$ 1.417,00</div>
                  <div className="text-sm text-muted-foreground">por mês</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="font-bold mb-1">12x com juros</div>
                  <div className="text-2xl font-bold">R$ 760,00</div>
                  <div className="text-sm text-muted-foreground">por mês</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Modal de Pagamento */}
      {showPagamento && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Finalizar Proposta</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowPagamento(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <FluxoPagamento 
                proposta={{
                  valor: dadosShingle.valorTotal,
                  produtos: [`Telhas Shingle ${dadosShingle.corEscolhida}`, "Manta Asfáltica", "Instalação Especializada"],
                  cliente: dadosShingle.cliente
                }}
                onAceitar={(formaPagamento) => {
                  onAceitarProposta(formaPagamento);
                  setShowPagamento(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </BasePropostaLayout>
  )
}

// Funções auxiliares mantidas do padrão divisórias
function calcularAreaTotal(produtos: any[]): number {
  if (!produtos || produtos.length === 0) return 120;
  return produtos.reduce((total, produto) => {
    const quantidade = parseFloat(produto.quantidade) || 0;
    const largura = parseFloat(produto.largura) || 1;
    const altura = parseFloat(produto.altura) || 1;
    return total + (quantidade * largura * altura);
  }, 0);
}

function contarTelhas(produtos: any[]): number {
  if (!produtos || produtos.length === 0) return 480;
  return produtos.reduce((total, produto) => {
    if (produto.nome?.toLowerCase().includes('telha')) {
      return total + (parseFloat(produto.quantidade) || 0);
    }
    return total;
  }, 0);
}

function identificarTipoTelha(produtos: any[]): string {
  if (!produtos || produtos.length === 0) return "Premium Shingle";
  const telha = produtos.find(p => p.nome?.toLowerCase().includes('telha'));
  return telha?.nome || "Premium Shingle";
}