import React, { useEffect, useState } from 'react';
import BasePropostaLayout from './BasePropostaLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Lightbulb, 
  Leaf, 
  Wrench, 
  Building2, 
  Award,
  CheckCircle,
  ArrowRight,
  Phone,
  MessageCircle,
  Calculator,
  TreePine,
  Truck,
  Clock,
  Star
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface VergaFibraData {
  nome_cliente: string;
  comprimento_total_m: number;
  diametro_barras_mm: number;
  qtd_barras: number;
  espacamento_cm: number;
  valor_total: number;
  economia_vs_aco_percent: number;
  durabilidade_anos: number;
  reducao_co2_toneladas: number;
  instalacao_dias: string;
  inclui_sinergia_silentfloor: boolean;
}

interface VergaFibraPropostaPageProps {
  proposta: any;
  onAceitarProposta: (formaPagamento: string) => Promise<void>;
  onContato: () => void;
  onSolicitarMudanca: () => void;
}

export const VergaFibraPropostaPage: React.FC<VergaFibraPropostaPageProps> = ({
  proposta,
  onAceitarProposta,
  onContato,
  onSolicitarMudanca,
}) => {
  const [currentSection, setCurrentSection] = useState(0);

  // Dados mockados para Fernanda Lima
  const vergaFibraData: VergaFibraData = {
    nome_cliente: proposta?.cliente_nome || 'Fernanda Lima',
    comprimento_total_m: 200,
    diametro_barras_mm: 10,
    qtd_barras: 50,
    espacamento_cm: 20,
    valor_total: 8500,
    economia_vs_aco_percent: 40,
    durabilidade_anos: 50,
    reducao_co2_toneladas: 2.5,
    instalacao_dias: '3-5',
    inclui_sinergia_silentfloor: true,
  };

  const beneficios = [
    {
      icon: Calculator,
      title: "Economia de Até 40% vs. Aço",
      description: "Menor quantidade, transporte e armazenamento, com maior rendimento da equipe",
      value: `${vergaFibraData.economia_vs_aco_percent}%`
    },
    {
      icon: Shield,
      title: "Durabilidade Extrema",
      description: "Redução de manutenção, resistência a corrosão e temperaturas extremas",
      value: `${vergaFibraData.durabilidade_anos}+ anos`
    },
    {
      icon: Award,
      title: "Segurança Elevada",
      description: "Leveza reduz riscos aos colaboradores, não interfere em raios X",
      value: "100% seguro"
    },
    {
      icon: Building2,
      title: "Economia em Concreto",
      description: "Redução de perdas em materiais e cobertura mais fina",
      value: "30% menos"
    },
    {
      icon: Lightbulb,
      title: "Desempenho Superior",
      description: "Excelente para alta resistência e estruturas sustentáveis",
      value: "Alta resistência"
    },
    {
      icon: Leaf,
      title: "Sustentabilidade",
      description: "Material ecológico, reduz intervenções e emissões CO2",
      value: `${vergaFibraData.reducao_co2_toneladas}t CO2`
    }
  ];

  const timelineSteps = [
    "Avaliação e Dimensionamento Personalizado",
    "Fornecimento de Telas/Rolos (12-200m)",
    "Corte e Amarração Segura (Serra Diamantada)",
    "Colocação no Concreto Armado",
    "Inspeção e Suporte Técnico"
  ];

  const chartData = {
    labels: ['Custo Total', 'Peso (kg)', 'Durabilidade (anos)', 'Manutenção'],
    datasets: [
      {
        label: 'Aço Tradicional',
        data: [100, 100, 20, 100],
        backgroundColor: 'rgba(74, 74, 74, 0.8)',
        borderColor: 'rgba(74, 74, 74, 1)',
        borderWidth: 1,
      },
      {
        label: 'Verga Fibra',
        data: [60, 40, 50, 20],
        backgroundColor: 'rgba(0, 123, 255, 0.8)',
        borderColor: 'rgba(0, 123, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Comparativo: Verga Fibra vs. Aço Tradicional',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 120,
      },
    },
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]');
      const scrollPosition = window.scrollY + 100;

      sections.forEach((section, index) => {
        const element = section as HTMLElement;
        if (scrollPosition >= element.offsetTop) {
          setCurrentSection(index);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <BasePropostaLayout
      cliente={vergaFibraData.nome_cliente}
      tipoProduto="Verga Fibra - Inovação GFRP"
      numeroProposta={proposta?.id?.slice(-8) || "VF001234"}
      dataProposta={new Date().toLocaleDateString('pt-BR')}
      totalValue={`R$ ${vergaFibraData.valor_total.toLocaleString('pt-BR')}`}
      onAcceptProposal={() => onAceitarProposta('12x')}
      onContactWhatsApp={onContato}
      onRequestChanges={onSolicitarMudanca}
    >
      {/* Navigation Menu */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-6 py-3 text-sm">
            <a href="#beneficios" className="hover:text-primary transition-colors">Benefícios</a>
            <a href="#tecnologia" className="hover:text-primary transition-colors">Tecnologia GFRP</a>
            <a href="#sinergia" className="hover:text-primary transition-colors">Sinergia SilentFloor</a>
            <a href="#drystore" className="hover:text-primary transition-colors">Por Que DryStore</a>
            <a href="#precos" className="hover:text-primary transition-colors">Preços</a>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section 
        data-section="0" 
        className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent z-10"></div>
        <div className="container mx-auto px-4 text-center z-20 animate-fade-in">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20" variant="outline">
            Evolução da Construção Civil
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Verga Fibra: Leveza,<br />
            <span className="text-primary">Durabilidade</span> e<br />
            <span className="text-green-600">Sustentabilidade</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto">
            Solução para <strong>{vergaFibraData.comprimento_total_m}m</strong> de barras <strong>{vergaFibraData.diametro_barras_mm}mm</strong>, 
            com espaçamento <strong>{vergaFibraData.espacamento_cm}cm</strong>, instalada em <strong>{vergaFibraData.instalacao_dias} dias</strong> 
            e economia de <strong className="text-primary">{vergaFibraData.economia_vs_aco_percent}% vs. aço</strong>.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3">
            Descubra a Inovação Confiável
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Introdução Personalizada */}
      <section data-section="1" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-l-4 border-l-primary">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-center">
                Proposta Personalizada para {vergaFibraData.nome_cliente}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Baseado no seu projeto, projetamos reforços com <strong>Verga Fibra</strong> que garantem 
                durabilidade de <strong className="text-primary">{vergaFibraData.durabilidade_anos}+ anos</strong> e 
                redução de CO2 em <strong className="text-green-600">{vergaFibraData.reducao_co2_toneladas} toneladas</strong>. 
                Como <strong>distribuidores oficiais nos RS/PR</strong>, oferecemos qualidade Composite Group 
                com sinergia perfeita à nossa argamassa SilentFloor para acústica superior.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Seção de Benefícios */}
      <section id="beneficios" data-section="2" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Por Que Verga Fibra Revoluciona Sua Construção</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Argumentos comprovados por pesquisa e certificações internacionais
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {beneficios.map((beneficio, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <beneficio.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{beneficio.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge className="mb-3 bg-primary text-primary-foreground">{beneficio.value}</Badge>
                  <p className="text-muted-foreground">{beneficio.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gráfico Comparativo */}
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Comparativo de Desempenho</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Seção de Tecnologia GFRP */}
      <section id="tecnologia" data-section="3" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Tecnologia GFRP: <span className="text-primary">Verga Fibra</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Barra Polimérica Reforçada com Fibra de Vidro da Composite Group – Leve, Anticorrosiva e Certificada
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Card>
              <CardHeader>
                <CardTitle>Especificações Técnicas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Diâmetro:</span>
                    <span>{vergaFibraData.diametro_barras_mm}mm</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Comprimento Total:</span>
                    <span>{vergaFibraData.comprimento_total_m}m</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Quantidade de Barras:</span>
                    <span>{vergaFibraData.qtd_barras} unidades</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Espaçamento:</span>
                    <span>{vergaFibraData.espacamento_cm}cm</span>
                  </div>
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Propriedades:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Alta Resistência à Tração</li>
                      <li>• Módulo de Elasticidade Baixo para Flexibilidade</li>
                      <li>• Resistente à Corrosão</li>
                      <li>• Não Condutivo</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certificações e Normas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Badge variant="outline" className="justify-center py-2">ISO 9001:2015</Badge>
                  <Badge variant="outline" className="justify-center py-2">ACI 440R-15</Badge>
                  <Badge variant="outline" className="justify-center py-2">CAN/CSA-S806</Badge>
                  <Badge variant="outline" className="justify-center py-2">ABNT NBR 14715</Badge>
                </div>
                
                {/* Diagrama SVG Simplificado */}
                <div className="mt-8 p-6 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold mb-4 text-center">Estrutura da Verga Fibra</h4>
                  <svg viewBox="0 0 400 200" className="w-full h-32">
                    <rect x="50" y="50" width="300" height="100" fill="none" stroke="#007BFF" strokeWidth="2" rx="10"/>
                    <g stroke="#4A4A4A" strokeWidth="1">
                      {[...Array(6)].map((_, i) => (
                        <line key={i} x1={70 + i * 40} y1="60" x2={70 + i * 40} y2="140" />
                      ))}
                      {[...Array(4)].map((_, i) => (
                        <line key={i} x1="60" y1={70 + i * 20} x2="340" y2={70 + i * 20} />
                      ))}
                    </g>
                    <text x="200" y="170" textAnchor="middle" className="text-xs fill-muted-foreground">
                      Malha com Fibra de Vidro
                    </text>
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Seção de Sinergia com SilentFloor */}
      {vergaFibraData.inclui_sinergia_silentfloor && (
        <section id="sinergia" data-section="4" className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="container mx-auto px-4">
            <Card className="max-w-6xl mx-auto border-2 border-green-200 bg-white/80 backdrop-blur">
              <CardHeader className="text-center pb-8">
                <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">
                  Sinergia Exclusiva DryStore
                </Badge>
                <CardTitle className="text-4xl mb-4">
                  Verga Fibra + <span className="text-green-600">SilentFloor</span>
                </CardTitle>
                <p className="text-xl text-muted-foreground">
                  Apenas 4cm de espessura no contrapiso para desempenho acústico perfeito, 
                  eliminando 'toc toc' e ruídos mecânicos
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-6">Estruturas Seguras e Silenciosas</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                        <span>Verga Fibra para resistência estrutural duradoura</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                        <span>SilentFloor elimina ruídos de impacto</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                        <span>Apenas 4cm de altura adicional</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                        <span>Solução integrada para qualquer aplicação</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Diagrama de Camadas */}
                  <div className="bg-slate-50 p-6 rounded-lg">
                    <h4 className="font-semibold mb-4 text-center">Integração de Tecnologias</h4>
                    <div className="space-y-3">
                      <div className="bg-blue-200 p-3 rounded text-center">
                        <strong>Piso Final</strong>
                      </div>
                      <div className="bg-green-200 p-3 rounded text-center">
                        <strong>SilentFloor (4cm)</strong><br />
                        <small>Isolamento Acústico</small>
                      </div>
                      <div className="bg-gray-200 p-3 rounded text-center">
                        <strong>Contrapiso</strong>
                      </div>
                      <div className="bg-blue-300 p-3 rounded text-center">
                        <strong>Laje com Verga Fibra</strong><br />
                        <small>Reforço Estrutural</small>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Por Que DryStore */}
      <section id="drystore" data-section="5" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Por Que a DryStore é a <span className="text-primary">Empresa Confiável</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              Distribuidores Oficiais da Composite Group nos Estados RS e PR - 
              Garantia de Qualidade Reconhecida Internacionalmente
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Award,
                title: "Distribuição Exclusiva",
                description: "Acesso direto a Verga Fibra certificada, com estoque e entrega rápida"
              },
              {
                icon: Shield,
                title: "Confiança Comprovada",
                description: `Qualidade ISO/ACI/CAN/CSA, testes laboratoriais e garantia contra defeitos`
              },
              {
                icon: Lightbulb,
                title: "Inovação Brasileira",
                description: "Sinergia com SilentFloor para projetos acústicos e estruturais integrados"
              },
              {
                icon: Clock,
                title: "Durabilidade Garantida",
                description: `${vergaFibraData.durabilidade_anos}+ anos sem corrosão ou manutenção excessiva`
              },
              {
                icon: TreePine,
                title: "Sustentabilidade",
                description: "Redução de emissões e materiais ecológicos"
              },
              {
                icon: Wrench,
                title: "Suporte Completo",
                description: `Avaliação técnica, instalação em ${vergaFibraData.instalacao_dias} dias e pós-venda 24/7`
              }
            ].map((item, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Depoimentos */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Cliente V",
                text: "Verga Fibra da DryStore revolucionou minha construção – leve e durável!",
                rating: 5
              },
              {
                name: "Engenheiro M",
                text: "A sinergia com SilentFloor trouxe acústica perfeita ao projeto",
                rating: 5
              },
              {
                name: "Construtora X",
                text: "Economia real de 40% e instalação rápida. Recomendo!",
                rating: 5
              }
            ].map((depoimento, index) => (
              <Card key={index} className="bg-slate-50">
                <CardContent className="p-6">
                  <div className="flex mb-3">
                    {[...Array(depoimento.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm mb-4 italic">"{depoimento.text}"</p>
                  <p className="font-semibold text-sm">– {depoimento.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline de Instalação */}
      <section data-section="6" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Processo de Instalação</h2>
            <p className="text-xl text-muted-foreground">
              Timeline completa: da avaliação à entrega em {vergaFibraData.instalacao_dias} dias
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {timelineSteps.map((step, index) => (
              <div key={index} className="flex items-center mb-8 last:mb-0">
                <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {index + 1}
                </div>
                <div className="ml-6 flex-1">
                  <Card className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg">{step}</h3>
                      {index === timelineSteps.length - 1 && (
                        <p className="text-muted-foreground text-sm mt-2">
                          Inclui vídeo tutorial e suporte técnico 24/7
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>

          <Card className="max-w-2xl mx-auto mt-12 bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <Wrench className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-bold mb-2">Dicas de Manuseio</h3>
              <p className="text-muted-foreground">
                <strong>Manuseio Fácil:</strong> Leve, sem riscos de corte. 
                Evite pancadas para manter integridade das fibras.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Seção de Preços */}
      <section id="precos" data-section="7" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Investimento Inteligente</h2>
            <p className="text-xl text-muted-foreground">
              Breakdown transparente que se paga com economia e durabilidade
            </p>
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Detalhamento da Proposta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 font-semibold border-b pb-2">
                  <span>Item</span>
                  <span className="text-center">Qtd</span>
                  <span className="text-center">Unitário</span>
                  <span className="text-center">Total</span>
                </div>
                
                <div className="grid grid-cols-4 gap-4 py-3 border-b">
                  <span>Barras Verga Fibra {vergaFibraData.diametro_barras_mm}mm</span>
                  <span className="text-center">{vergaFibraData.qtd_barras} un</span>
                  <span className="text-center">R$ 120,00</span>
                  <span className="text-center">R$ 6.000,00</span>
                </div>
                
                <div className="grid grid-cols-4 gap-4 py-3 border-b">
                  <span>Telas/Rolos Complementares</span>
                  <span className="text-center">1 kit</span>
                  <span className="text-center">R$ 1.800,00</span>
                  <span className="text-center">R$ 1.800,00</span>
                </div>
                
                <div className="grid grid-cols-4 gap-4 py-3 border-b">
                  <span>Acessórios e Instalação</span>
                  <span className="text-center">1 serv</span>
                  <span className="text-center">R$ 700,00</span>
                  <span className="text-center">R$ 700,00</span>
                </div>
                
                <div className="grid grid-cols-4 gap-4 py-4 bg-primary/5 rounded-lg px-4 font-bold text-lg">
                  <span className="col-span-3">VALOR TOTAL</span>
                  <span className="text-center text-primary">
                    R$ {vergaFibraData.valor_total.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              <Separator className="my-8" />

              <div className="text-center">
                <h3 className="text-xl font-bold mb-4">Opções de Pagamento</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-primary/20">
                    <CardContent className="p-6 text-center">
                      <h4 className="font-semibold mb-2">À Vista</h4>
                      <p className="text-2xl font-bold text-green-600 mb-2">
                        R$ {(vergaFibraData.valor_total * 0.95).toLocaleString('pt-BR')}
                      </p>
                      <p className="text-sm text-muted-foreground">5% de desconto</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-primary/20">
                    <CardContent className="p-6 text-center">
                      <h4 className="font-semibold mb-2">12x sem juros</h4>
                      <p className="text-2xl font-bold text-primary mb-2">
                        R$ {(vergaFibraData.valor_total / 12).toLocaleString('pt-BR')}
                      </p>
                      <p className="text-sm text-muted-foreground">por mês</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Pronto para Evoluir Sua Construção?</h2>
          <p className="text-xl mb-8 opacity-90">
            Confie na DryStore e na tecnologia Verga Fibra para estruturas duradouras e sustentáveis
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-primary hover:bg-gray-100"
              onClick={() => onAceitarProposta('12x')}
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Aceitar Proposta
            </Button>
            
            {!vergaFibraData.inclui_sinergia_silentfloor && (
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Building2 className="mr-2 h-5 w-5" />
                Adicionar SilentFloor
              </Button>
            )}
            
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" onClick={onContato}>
              <MessageCircle className="mr-2 h-5 w-5" />
              Consultor WhatsApp
            </Button>
            
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" onClick={onSolicitarMudanca}>
              <Phone className="mr-2 h-5 w-5" />
              Solicitar Modificações
            </Button>
          </div>
        </div>
      </section>
    </BasePropostaLayout>
  );
};