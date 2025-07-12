import React from 'react';
import BasePropostaLayout from './BasePropostaLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, Clock, Droplets, Palette, Wrench, Leaf, Volume2 } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PisosPropostaPageProps {
  dadosProposta: {
    modelo_tarkett: string;
    area_piso_m2: number;
    tipo_impermeabilizacao: string;
    inclui_avaliacao_tecnica: boolean;
    resistencia_umidade: string;
    absorcao_acustica_db: number;
    valor_total: number;
    economia_manutencao_percent: number;
    durabilidade_anos: number;
    instalacao_dias: string;
  };
  nomeCliente: string;
  numeroProposta: string;
  dataProposta: string;
  onAceitarProposta: (formaPagamento: string) => void;
  onContato: () => void;
  onSolicitarMudanca: () => void;
}

export const PisosPropostaPage: React.FC<PisosPropostaPageProps> = ({
  dadosProposta,
  nomeCliente,
  numeroProposta,
  dataProposta,
  onAceitarProposta,
  onContato,
  onSolicitarMudanca,
}) => {
  // Dados do gráfico comparativo
  const chartData = {
    labels: ['Durabilidade (anos)', 'Custo Manutenção (%)', 'Resistência Umidade', 'Facilidade Limpeza'],
    datasets: [
      {
        label: 'Piso Vinílico Tarkett',
        data: [25, 30, 95, 90],
        backgroundColor: 'rgba(76, 175, 80, 0.8)',
        borderColor: 'rgb(76, 175, 80)',
        borderWidth: 1,
      },
      {
        label: 'Cerâmico Tradicional',
        data: [15, 60, 70, 60],
        backgroundColor: 'rgba(158, 158, 158, 0.8)',
        borderColor: 'rgb(158, 158, 158)',
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
        text: 'Comparativo: Piso Vinílico vs. Cerâmico',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const beneficios = [
    {
      icon: Shield,
      titulo: "Durabilidade Excepcional",
      descricao: `${dadosProposta.durabilidade_anos}+ Anos Resistindo a Tráfego Intenso, Riscos e Desgaste Diário`,
      badge: `${dadosProposta.durabilidade_anos}+ anos`
    },
    {
      icon: Wrench,
      titulo: "Fácil Limpeza e Manutenção",
      descricao: `Reduz Custos em ${dadosProposta.economia_manutencao_percent}% com Superfície Anti-Manchas e Higiênica`,
      badge: `-${dadosProposta.economia_manutencao_percent}% custos`
    },
    {
      icon: Volume2,
      titulo: "Conforto Acústico",
      descricao: `Absorção de Som até ${dadosProposta.absorcao_acustica_db} dB para Ambientes Silenciosos e Produtivos`,
      badge: `${dadosProposta.absorcao_acustica_db} dB`
    },
    {
      icon: Droplets,
      titulo: "Resistência à Umidade",
      descricao: `Com Impermeabilização ${dadosProposta.tipo_impermeabilizacao}, Protege Contra Danos no Contrapiso – Essencial para Térreo`,
      badge: dadosProposta.resistencia_umidade
    },
    {
      icon: Palette,
      titulo: "Estética Versátil",
      descricao: "Centenas de Modelos Tarkett (Cores, Texturas) para Qualquer Estilo – Residencial a Hospitalar",
      badge: "Catálogo Completo"
    },
    {
      icon: Clock,
      titulo: "Instalação Rápida e Limpa",
      descricao: `Sem Poeira, Ideal para Reformas em ${dadosProposta.instalacao_dias} Dias`,
      badge: dadosProposta.instalacao_dias
    },
    {
      icon: Leaf,
      titulo: "Sustentabilidade e Saúde",
      descricao: "Materiais Recicláveis, Baixa Emissão VOC, Anti-Alérgicos para Ambientes Saudáveis",
      badge: "Eco-Friendly"
    }
  ];

  const timelineInstalacao = [
    {
      etapa: "Avaliação Técnica Gratuita",
      status: dadosProposta.inclui_avaliacao_tecnica ? "Inclusa" : "Opcional",
      descricao: "Verificação de umidade e condições do contrapiso"
    },
    {
      etapa: "Seleção Personalizada",
      status: "Inclusa",
      descricao: `Tarkett ${dadosProposta.modelo_tarkett} + Impermeabilização ${dadosProposta.tipo_impermeabilizacao}`
    },
    {
      etapa: "Preparo do Contrapiso",
      status: "Inclusa",
      descricao: `Aplicação de impermeabilização ${dadosProposta.tipo_impermeabilizacao}`
    },
    {
      etapa: "Instalação Profissional",
      status: "Inclusa",
      descricao: "Instalação rápida e limpa por equipe especializada"
    },
    {
      etapa: "Inspeção e Suporte",
      status: "Inclusa",
      descricao: "Verificação final e suporte pós-instalação 24/7"
    }
  ];

  return (
    <BasePropostaLayout
      cliente={nomeCliente}
      tipoProduto="Pisos Vinílicos Tarkett Premium"
      numeroProposta={numeroProposta}
      dataProposta={dataProposta}
      totalValue={`R$ ${dadosProposta.valor_total.toLocaleString('pt-BR')}`}
      onAcceptProposal={() => onAceitarProposta('credito')}
      onContactWhatsApp={onContato}
      onRequestChanges={onSolicitarMudanca}
    >
      {/* Hero Section */}
      <div 
        className="relative h-96 bg-gradient-to-r from-slate-900 to-slate-700 text-white flex items-center justify-center text-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Pisos Vinílicos Tarkett Premium: Duráveis, Elegantes e Protegidos Contra Umidade
          </h1>
          <p className="text-xl mb-6">
            Solução para {dadosProposta.area_piso_m2} m² com modelo {dadosProposta.modelo_tarkett}, 
            instalação em {dadosProposta.instalacao_dias} e impermeabilização {dadosProposta.tipo_impermeabilizacao} para máxima segurança
          </p>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Proteja Seu Investimento
          </Badge>
        </div>
      </div>

      {/* Introdução Personalizada */}
      <div className="py-16 bg-background">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-6">Solução Personalizada para Seu Projeto</h2>
          <p className="text-lg text-muted-foreground">
            Baseado no seu projeto, selecionamos pisos Tarkett que entregam resistência à umidade de{' '}
            <strong>{dadosProposta.resistencia_umidade}</strong> e durabilidade de{' '}
            <strong>{dadosProposta.durabilidade_anos}+ anos</strong>. Com avaliação técnica{' '}
            {dadosProposta.inclui_avaliacao_tecnica ? 'incluída' : 'opcional'} para contrapiso (especialmente térreo), 
            evitamos danos por umidade – atendemos de residências a hospitais com excelência.
          </p>
        </div>
      </div>

      {/* Seção de Benefícios */}
      <div className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Por Que Escolher Pisos Vinílicos Tarkett?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {beneficios.map((beneficio, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <beneficio.icon className="h-8 w-8 text-primary" />
                    <Badge variant="outline">{beneficio.badge}</Badge>
                  </div>
                  <CardTitle className="text-lg">{beneficio.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{beneficio.descricao}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gráfico Comparativo */}
          <div className="bg-background rounded-lg p-6 shadow-sm">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Seção de Impermeabilização Essencial */}
      <div className="py-16 bg-destructive/5 border-l-4 border-destructive">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-destructive mb-4">
              Impermeabilização Essencial: Proteja Seu Investimento
            </h2>
            <p className="text-lg">
              <strong>Antes de Instalar: A Umidade Pode Destruir Seu Piso</strong> – Na DryStore, 
              Oferecemos Avaliação Técnica Gratuita para Contrapiso, Usando {dadosProposta.tipo_impermeabilizacao} 
              para Proteção Total. Sem Isso, Investimentos São Perdidos em Meses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  {dadosProposta.inclui_avaliacao_tecnica ? 'Avaliação Técnica Incluída' : 'Adicione Avaliação Técnica'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dadosProposta.inclui_avaliacao_tecnica ? (
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Verificação de Umidade Profissional
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Recomendações {dadosProposta.tipo_impermeabilizacao}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Laudo Técnico Detalhado
                    </li>
                  </ul>
                ) : (
                  <p className="text-muted-foreground">
                    Adicione a avaliação técnica para garantir a proteção total do seu investimento contra umidade.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impermeabilização {dadosProposta.tipo_impermeabilizacao}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Resistência à Umidade:</span>
                    <Badge variant="secondary">{dadosProposta.resistencia_umidade}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Proteção Contrapiso:</span>
                    <Badge variant="secondary">Máxima</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Durabilidade:</span>
                    <Badge variant="secondary">{dadosProposta.durabilidade_anos}+ anos</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Seção de Variedade Tarkett */}
      <div className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Catálogo Completo Tarkett: Todos os Modelos Sob Encomenda
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center">
              <CardHeader>
                <CardTitle>Linha Residencial</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Modelos Ambience, Essence para residências e apartamentos
                </p>
                <Badge variant="outline">Conforto & Estética</Badge>
              </CardContent>
            </Card>

            <Card className="text-center border-primary">
              <CardHeader>
                <CardTitle className="text-primary">Modelo Selecionado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-bold text-lg mb-2">{dadosProposta.modelo_tarkett}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Ideal para projetos comerciais e institucionais
                </p>
                <Badge variant="default">Sua Escolha</Badge>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle>Linha Institucional</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Modelos para hospitais, hotéis, escolas com normas ABNT
                </p>
                <Badge variant="outline">Máxima Resistência</Badge>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">
              Atendemos Qualquer Projeto – Residências, Apartamentos, Hospitais, Hotéis, Escolas
            </h3>
            <p className="text-muted-foreground">
              Com Produtos Nacionais e Importados Personalizados para Cada Necessidade
            </p>
          </div>
        </div>
      </div>

      {/* Seção Por Que DryStore */}
      <div className="py-16 bg-primary/5">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8">
            Por Que a DryStore é a Melhor Opção?
          </h2>
          <p className="text-xl text-center text-muted-foreground mb-12">
            Com Catálogo Tarkett Completo e Expertise em Impermeabilização {dadosProposta.tipo_impermeabilizacao}, 
            a DryStore Garante Soluções Seguras e Versáteis para Qualquer Ambiente
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                titulo: "Variedade Incomparável",
                descricao: "Todos Modelos Tarkett Sob Encomenda para Projetos Personalizados"
              },
              {
                titulo: "Proteção Essencial",
                descricao: "Avaliação Técnica Gratuita Contra Umidade, Evitando Perdas Totais"
              },
              {
                titulo: "Desempenho Superior",
                descricao: "Resistência, Conforto e Higiene para Residencial a Institucional"
              },
              {
                titulo: "Durabilidade Garantida",
                descricao: `${dadosProposta.durabilidade_anos}+ Anos com Manutenção Mínima`
              },
              {
                titulo: "Sustentabilidade",
                descricao: "Materiais Eco-Friendly e Anti-Alérgicos"
              },
              {
                titulo: "Suporte Completo",
                descricao: "De Avaliação a Instalação e Pós-Venda 24/7"
              }
            ].map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{item.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.descricao}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Depoimentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-background">
              <CardContent className="pt-6">
                <p className="italic mb-4">
                  "Piso DryStore no meu hospital: higiênico, durável e fácil de limpar. 
                  A impermeabilização salvou nosso investimento!"
                </p>
                <p className="font-bold">— Dr. Marina Silva, Hospital Santa Casa</p>
              </CardContent>
            </Card>
            <Card className="bg-background">
              <CardContent className="pt-6">
                <p className="italic mb-4">
                  "Apartamento reformado com Tarkett da DryStore. 3 anos depois, 
                  parece novo! A avaliação técnica foi essencial."
                </p>
                <p className="font-bold">— Carlos Mendes, Arquiteto</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Seção de Instalação */}
      <div className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Processo de Instalação Profissional
          </h2>

          <div className="space-y-6">
            {timelineInstalacao.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">{item.etapa}</h3>
                    <Badge variant={item.status === 'Inclusa' ? 'default' : 'outline'}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{item.descricao}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-muted/30 rounded-lg">
            <h3 className="font-bold text-lg mb-4">Manutenção Simples</h3>
            <p className="text-muted-foreground">
              Limpeza diária com pano úmido, sem produtos abrasivos. 
              Economia de {dadosProposta.economia_manutencao_percent}% em custos de manutenção comparado a outros pisos.
            </p>
          </div>
        </div>
      </div>

      {/* Seção de Preços */}
      <div className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Investimento Protegido que se Paga com Durabilidade
          </h2>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Breakdown Transparente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Pisos Tarkett {dadosProposta.modelo_tarkett} ({dadosProposta.area_piso_m2} m²)</span>
                  <span className="font-bold">R$ {(dadosProposta.valor_total * 0.7).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Impermeabilização {dadosProposta.tipo_impermeabilizacao}</span>
                  <span className="font-bold">R$ {(dadosProposta.valor_total * 0.2).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Instalação Profissional e Acessórios</span>
                  <span className="font-bold">R$ {(dadosProposta.valor_total * 0.1).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between items-center py-4 text-xl font-bold bg-primary/10 px-4 rounded">
                  <span>Total do Investimento</span>
                  <span className="text-primary">R$ {dadosProposta.valor_total.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-4">
              <strong>Opções de Pagamento:</strong> 12x sem juros ou desconto para pagamento à vista
            </p>
            <p className="text-sm text-muted-foreground">
              *Descontos especiais para áreas acima de 100m²
            </p>
          </div>
        </div>
      </div>
    </BasePropostaLayout>
  );
};