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
  Users,
  Calendar,
  PlayCircle
} from "lucide-react"
import FluxoPagamento from "@/components/FluxoPagamento"

interface DivisoriasPropostaPageProps {
  proposta: any
  onAceitarProposta: (formaPagamento: string) => void
}

export default function DivisoriasPropostaPage({ proposta, onAceitarProposta }: DivisoriasPropostaPageProps) {
  const [showPagamento, setShowPagamento] = useState(false)

  // Processar dados específicos de divisórias
  const dadosDivisorias = {
    cliente: proposta.cliente_nome || "Cliente",
    areaTotal: calcularAreaTotal(proposta.dados_extraidos?.produtos || []),
    qtdPlacas: contarPlacas(proposta.dados_extraidos?.produtos || []),
    tipoPlaca: identificarTipoPlaca(proposta.dados_extraidos?.produtos || []),
    qtdMontantes: contarMontantes(proposta.dados_extraidos?.produtos || []),
    qtdGuias: contarGuias(proposta.dados_extraidos?.produtos || []),
    isolamentoAcustico: estimarIsolamentoAcustico(proposta.dados_extraidos?.produtos || []),
    valorTotal: proposta.valor_total || 0,
    economiaLongoPrazo: 25, // % economia em reparos
    garantiaAnos: 10,
    instalacaoDias: Math.ceil((calcularAreaTotal(proposta.dados_extraidos?.produtos || []) || 20) / 15), // 15m²/dia
    numeroProposta: proposta.id?.slice(0, 8) || "DP001",
    dataProposta: new Date().toLocaleDateString('pt-BR')
  }

  const handleContactWhatsApp = () => {
    const message = `Olá! Gostaria de falar sobre a proposta de divisórias #${dadosDivisorias.numeroProposta} para ${dadosDivisorias.cliente}.`
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleRequestChanges = () => {
    alert("Em breve você receberá um contato para discutir as alterações desejadas.")
  }

  return (
    <BasePropostaLayout
      cliente={dadosDivisorias.cliente}
      tipoProduto="Divisórias de Drywall de Alta Qualidade"
      numeroProposta={dadosDivisorias.numeroProposta}
      dataProposta={dadosDivisorias.dataProposta}
      totalValue={`R$ ${dadosDivisorias.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
      onAcceptProposal={() => setShowPagamento(true)}
      onContactWhatsApp={handleContactWhatsApp}
      onRequestChanges={handleRequestChanges}
    >
      {/* Hero Section - Risk vs Safety */}
      <section className="bg-gradient-hero text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6 animate-fade-in">
              Evite os Riscos de Divisórias Baratas: <br />
              <span className="text-secondary-glow">Escolha a Segurança e Durabilidade da DryStore</span>
            </h1>
            <p className="text-xl opacity-90 mb-8 animate-slide-in">
              Solução personalizada para {dadosDivisorias.areaTotal}m² com perfis Ananda Metais, 
              instalada em {dadosDivisorias.instalacaoDias} dias
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/10 rounded-lg p-4">
                <Shield className="h-8 w-8 mx-auto mb-2 text-secondary" />
                <div className="font-semibold">Durabilidade 20+ Anos</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-secondary" />
                <div className="font-semibold">Conformidade ABNT</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <Award className="h-8 w-8 mx-auto mb-2 text-secondary" />
                <div className="font-semibold">Parceria Ananda Metais</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introdução Personalizada */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card className="border-primary/20 shadow-card">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Sua Solução Personalizada</h2>
              <p className="text-lg text-muted-foreground">
                Baseado nas suas especificações, projetamos divisórias que garantem 
                isolamento acústico de <span className="font-bold text-primary">{dadosDivisorias.isolamentoAcustico}dB</span> e 
                economia de <span className="font-bold text-success">{dadosDivisorias.economiaLongoPrazo}%</span> em 
                reparos a longo prazo, usando apenas materiais certificados.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Seção de Problemas e Riscos */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            DryStore vs. Concorrentes Low-Cost
          </h2>
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Concorrentes */}
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <X className="h-5 w-5" />
                    Concorrentes Low-Cost
                  </CardTitle>
                  <CardDescription>Riscos que você evita conosco</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Perfis 0,4mm fora ABNT</strong>
                      <p className="text-sm text-muted-foreground">Violam normas técnicas</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Ferrugem em 6-12 meses</strong>
                      <p className="text-sm text-muted-foreground">Galvanização inadequada</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Deformações em 40% das obras</strong>
                      <p className="text-sm text-muted-foreground">Estrutura inadequada</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Custo real +R$2-5k em reparos</strong>
                      <p className="text-sm text-muted-foreground">Manutenção constante</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* DryStore */}
              <Card className="border-success/30 bg-success/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-success">
                    <Shield className="h-5 w-5" />
                    DryStore - A Escolha Segura
                  </CardTitle>
                  <CardDescription>Qualidade garantida</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Perfis Ananda 0,5mm+</strong>
                      <p className="text-sm text-muted-foreground">Conformidade total ABNT</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Durabilidade 20+ anos</strong>
                      <p className="text-sm text-muted-foreground">Galvanização Z275</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Zero reclamações em 500+ instalações</strong>
                      <p className="text-sm text-muted-foreground">Histórico comprovado</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Economia em manutenção</strong>
                      <p className="text-sm text-muted-foreground">Investimento que se paga</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios Detalhados */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Benefícios Incomparáveis
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover-lift">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Durabilidade Incomparável</CardTitle>
                <CardDescription>20+ Anos sem Deformações</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Perfis Ananda Metais com galvanização Z275 e espessura ≥0,5mm 
                  garantem resistência máxima contra corrosão e deformações.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Volume2 className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Isolamento Superior</CardTitle>
                <CardDescription>Acústico até {dadosDivisorias.isolamentoAcustico}dB+</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Isolamento acústico e térmico superior, reduzindo até 20% 
                  o consumo de energia para climatização.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardHeader>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-warning" />
                </div>
                <CardTitle>Conformidade Total</CardTitle>
                <CardDescription>Certificados ABNT e PBQP-H</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Conformidade com NBR 14715, 15575 e 15217. 
                  Certificações que garantem segurança e qualidade.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Diagrama Interativo */}
          <div className="mt-16">
            <Card className="bg-gradient-card">
              <CardHeader className="text-center">
                <CardTitle>Especificações do Seu Projeto</CardTitle>
                <CardDescription>Dimensões e componentes calculados especificamente para suas necessidades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Ruler className="h-8 w-8 text-primary" />
                    </div>
                    <div className="font-bold text-2xl text-primary">{dadosDivisorias.areaTotal}m²</div>
                    <div className="text-sm text-muted-foreground">Área Total</div>
                  </div>
                  <div>
                    <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-8 w-8 text-secondary" />
                    </div>
                    <div className="font-bold text-2xl text-secondary">{dadosDivisorias.qtdPlacas}</div>
                    <div className="text-sm text-muted-foreground">Placas {dadosDivisorias.tipoPlaca}</div>
                  </div>
                  <div>
                    <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="h-8 w-8 text-warning" />
                    </div>
                    <div className="font-bold text-2xl text-warning">{dadosDivisorias.qtdMontantes + dadosDivisorias.qtdGuias}</div>
                    <div className="text-sm text-muted-foreground">Perfis Estruturais</div>
                  </div>
                  <div>
                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-8 w-8 text-success" />
                    </div>
                    <div className="font-bold text-2xl text-success">{dadosDivisorias.instalacaoDias}</div>
                    <div className="text-sm text-muted-foreground">Dias de Instalação</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Qualidade Ananda Metais */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-6">
              Parceria Exclusiva com Ananda Metais
            </h2>
            <p className="text-lg text-muted-foreground">
              Fábrica Brasileira de Ponta, Perfis Galvanizados Z275, 
              Espessura ≥0,5mm para Resistência Máxima
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold mb-2">Aço Virgem Não Reciclado</h3>
                <p className="text-sm text-muted-foreground">
                  Qualidade superior garantida desde a matéria-prima
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Award className="h-12 w-12 text-secondary mx-auto mb-4" />
                <h3 className="font-bold mb-2">Testes Laboratoriais Rigorosos</h3>
                <p className="text-sm text-muted-foreground">
                  Certificações e controle de qualidade em cada lote
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                <h3 className="font-bold mb-2">Garantia de 10 Anos</h3>
                <p className="text-sm text-muted-foreground">
                  Proteção total contra defeitos de fabricação
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Depoimento */}
          <div className="mt-12">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Award key={i} className="h-5 w-5 text-warning fill-warning" />
                  ))}
                </div>
                <blockquote className="text-lg italic text-foreground mb-4">
                  "Minha divisória DryStore dura anos sem problemas – concorrentes falharam em meses!"
                </blockquote>
                <cite className="text-sm text-muted-foreground">
                  — Cliente Maria S., Empresária, Instalação há 3 anos
                </cite>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Timeline de Instalação */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Processo de Instalação e Manutenção
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">1. Avaliação Gratuita</h3>
              <p className="text-sm text-muted-foreground">
                Visita técnica no local com medições precisas
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ruler className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">2. Projeto 3D</h3>
              <p className="text-sm text-muted-foreground">
                Visualização completa antes da instalação
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-warning" />
              </div>
              <h3 className="font-semibold mb-2">3. Instalação Certificada</h3>
              <p className="text-sm text-muted-foreground">
                Equipe qualificada e materiais premium
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-success" />
              </div>
              <h3 className="font-semibold mb-2">4. Suporte Pós-Venda</h3>
              <p className="text-sm text-muted-foreground">
                Inspeção e garantia estendida gratuita
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Card className="inline-block bg-gradient-card">
              <CardContent className="p-6">
                <PlayCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold mb-2">Vídeo: Instalação Drywall Premium</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Veja como funciona nosso processo de instalação
                </p>
                <Button variant="outline">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Assistir Vídeo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Seção de Preços */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Investimento Seguro que se Paga
          </h2>
          
          <Card className="border-primary/20 shadow-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Breakdown Transparente</CardTitle>
              <CardDescription>Todos os itens detalhados para sua segurança</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tabela de itens */}
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-4 font-semibold border-b pb-2">
                  <span>Item</span>
                  <span className="text-center">Qtd</span>
                  <span className="text-center">Unitário</span>
                  <span className="text-center">Total</span>
                </div>
                
                <div className="grid grid-cols-4 gap-4 py-2 border-b">
                  <span>Placas {dadosDivisorias.tipoPlaca}</span>
                  <span className="text-center">{dadosDivisorias.qtdPlacas}</span>
                  <span className="text-center">R$ 45,00</span>
                  <span className="text-center">R$ {(dadosDivisorias.qtdPlacas * 45).toLocaleString('pt-BR')}</span>
                </div>
                
                <div className="grid grid-cols-4 gap-4 py-2 border-b">
                  <span>Perfis Ananda</span>
                  <span className="text-center">{dadosDivisorias.qtdMontantes + dadosDivisorias.qtdGuias}</span>
                  <span className="text-center">R$ 25,00</span>
                  <span className="text-center">R$ {((dadosDivisorias.qtdMontantes + dadosDivisorias.qtdGuias) * 25).toLocaleString('pt-BR')}</span>
                </div>
                
                <div className="grid grid-cols-4 gap-4 py-2 border-b">
                  <span>Acessórios</span>
                  <span className="text-center">1</span>
                  <span className="text-center">R$ 850,00</span>
                  <span className="text-center">R$ 850,00</span>
                </div>
                
                <div className="grid grid-cols-4 gap-4 py-2 font-bold text-lg border-t-2 pt-4">
                  <span className="col-span-3">Total</span>
                  <span className="text-center text-primary">
                    R$ {dadosDivisorias.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Opções de pagamento */}
              <div className="space-y-4">
                <h3 className="font-semibold">Opções de Pagamento:</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <div className="font-bold text-success">À vista (5% OFF)</div>
                    <div className="text-2xl font-bold text-success">
                      R$ {(dadosDivisorias.valorTotal * 0.95).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="font-bold">6x sem juros</div>
                    <div className="text-2xl font-bold">
                      R$ {(dadosDivisorias.valorTotal / 6).toLocaleString('pt-BR')}
                    </div>
                    <div className="text-sm text-muted-foreground">por mês</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="font-bold">12x (juros 1.5%)</div>
                    <div className="text-2xl font-bold">
                      R$ {(dadosDivisorias.valorTotal * 1.015 / 12).toLocaleString('pt-BR')}
                    </div>
                    <div className="text-sm text-muted-foreground">por mês</div>
                  </div>
                </div>
              </div>

              <div className="text-center p-4 bg-success/10 rounded-lg">
                <p className="text-success font-semibold">
                  💡 Investimento que se paga com economia de {dadosDivisorias.economiaLongoPrazo}% em reparos
                </p>
              </div>

              {/* CTA de Pagamento */}
              {!showPagamento ? (
                <Button 
                  onClick={() => setShowPagamento(true)}
                  size="lg" 
                  className="w-full bg-gradient-primary hover:shadow-glow"
                >
                  <Shield className="h-5 w-5 mr-2" />
                  Ver Opções de Pagamento
                </Button>
              ) : (
                <FluxoPagamento 
                  proposta={{
                    valor: dadosDivisorias.valorTotal,
                    produtos: ["Divisórias Drywall", "Perfis Ananda", "Instalação"],
                    cliente: dadosDivisorias.cliente
                  }}
                  onAceitar={onAceitarProposta}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </BasePropostaLayout>
  )
}

// Funções utilitárias para processar dados
function calcularAreaTotal(produtos: any[]): number {
  const placas = produtos.filter(p => p.nome?.toLowerCase().includes('placa'))
  // Estimativa: cada placa cobre ~1.8m²
  return placas.reduce((total, placa) => total + (placa.quantidade * 1.8), 0)
}

function contarPlacas(produtos: any[]): number {
  return produtos
    .filter(p => p.nome?.toLowerCase().includes('placa'))
    .reduce((total, placa) => total + placa.quantidade, 0)
}

function identificarTipoPlaca(produtos: any[]): string {
  const placa = produtos.find(p => p.nome?.toLowerCase().includes('placa'))
  if (placa?.nome?.includes('ST')) return 'ST'
  if (placa?.nome?.includes('RU')) return 'RU'
  if (placa?.nome?.includes('RF')) return 'RF'
  return 'Standard'
}

function contarMontantes(produtos: any[]): number {
  return produtos
    .filter(p => p.nome?.toLowerCase().includes('montante'))
    .reduce((total, item) => total + item.quantidade, 0)
}

function contarGuias(produtos: any[]): number {
  return produtos
    .filter(p => p.nome?.toLowerCase().includes('guia'))
    .reduce((total, item) => total + item.quantidade, 0)
}

function estimarIsolamentoAcustico(produtos: any[]): number {
  const temPlacaDupla = produtos.some(p => p.nome?.toLowerCase().includes('dupla'))
  const temIsolamento = produtos.some(p => p.nome?.toLowerCase().includes('la'))
  
  if (temPlacaDupla && temIsolamento) return 45
  if (temPlacaDupla || temIsolamento) return 35
  return 28
}