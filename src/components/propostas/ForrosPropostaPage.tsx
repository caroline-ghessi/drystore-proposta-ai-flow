import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Volume2, Thermometer, Leaf, Clock, Palette, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import BasePropostaLayout from './BasePropostaLayout';

interface ForrosPropostaPageProps {
  proposta: any;
  onAceitar: (formaPagamento: string) => void;
  onContato: () => void;
  onSolicitarMudanca: () => void;
}

export function ForrosPropostaPage({ proposta, onAceitar, onContato, onSolicitarMudanca }: ForrosPropostaPageProps) {
  // Dados mockados para demonstração
  const dadosProposta = proposta?.dados_extraidos || {
    nome_cliente: 'Pedro Santos',
    tipo_forro: 'OWA madeira',
    area_forro_m2: 50,
    absorcao_acustica_db: 35,
    isolamento_termico_r: 2.5,
    economia_energia_percent: 25,
    durabilidade_anos: 20,
    instalacao_dias: 5
  };

  const valorTotal = proposta?.valor_total || 8750.00;

  // Dados para gráficos
  const dadosRuido = [
    { ambiente: 'Antes', nivel: 70 },
    { ambiente: 'Depois', nivel: 70 - dadosProposta.absorcao_acustica_db }
  ];

  const dadosEconomia = [
    { mes: 'Jan', anterior: 800, comForro: 600 },
    { mes: 'Fev', anterior: 750, comForro: 563 },
    { mes: 'Mar', anterior: 820, comForro: 615 },
    { mes: 'Abr', anterior: 780, comForro: 585 },
    { mes: 'Mai', anterior: 900, comForro: 675 },
    { mes: 'Jun', anterior: 950, comForro: 713 }
  ];

  const tiposForros = [
    {
      nome: 'OWA Painéis de Madeira',
      descricao: 'Estética incrível com alto desempenho acústico',
      desempenho: 'NRC 0.85',
      aplicacao: 'Escritórios, salas de reunião'
    },
    {
      nome: 'Knauf Placas de Gesso',
      descricao: 'Desempenho superior em isolamento',
      desempenho: 'NRC 0.75',
      aplicacao: 'Residencial, comercial'
    },
    {
      nome: 'Lã de Vidro Modular',
      descricao: 'Excelente térmico e acústico, leve',
      desempenho: 'NRC 0.90',
      aplicacao: 'Industrial, auditórios'
    },
    {
      nome: 'Baffles e Nuvens',
      descricao: 'Design moderno para tratamento visual',
      desempenho: 'NRC 0.80',
      aplicacao: 'Restaurantes, lojas'
    }
  ];

  const timelineInstalacao = [
    { etapa: 1, titulo: 'Avaliação e Projeto Gratuito', descricao: 'Medição e análise personalizada', dias: '1 dia' },
    { etapa: 2, titulo: 'Seleção da Gama Ideal', descricao: 'Escolha entre OWA, Knauf e mais', dias: '1 dia' },
    { etapa: 3, titulo: 'Entrega Rápida', descricao: 'Logística otimizada', dias: '2-3 dias' },
    { etapa: 4, titulo: 'Instalação Profissional', descricao: 'Equipe certificada, instalação limpa', dias: '2-3 dias' },
    { etapa: 5, titulo: 'Inspeção e Suporte', descricao: 'Verificação final e garantia', dias: '1 dia' }
  ];

  return (
    <BasePropostaLayout
      cliente={dadosProposta.nome_cliente}
      tipoProduto="Forros Acústicos Premium"
      numeroProposta={proposta?.id?.substring(0, 8) || "FORRO001"}
      dataProposta={proposta?.data_criacao ? new Date(proposta.data_criacao).toLocaleDateString() : new Date().toLocaleDateString()}
      totalValue={`R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
      onAcceptProposal={() => onAceitar('cartao')}
      onContactWhatsApp={onContato}
      onRequestChanges={onSolicitarMudanca}
    >
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-background via-muted/20 to-secondary/10 py-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Eleve Seu Ambiente com Forros Acústicos Premium da DryStore
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Conforto, Estética e Desempenho Incomparáveis
          </p>
          <div className="bg-card/80 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-lg">
              Solução para <span className="font-bold text-primary">{dadosProposta.area_forro_m2} m²</span> com{' '}
              <span className="font-bold text-primary">{dadosProposta.tipo_forro}</span>, reduzindo ruído em até{' '}
              <span className="font-bold text-primary">{dadosProposta.absorcao_acustica_db} dB</span> e energia em{' '}
              <span className="font-bold text-primary">{dadosProposta.economia_energia_percent}%</span>.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Instalação em {dadosProposta.instalacao_dias} dias
            </p>
          </div>
        </div>
      </div>

      {/* Introdução Personalizada */}
      <div className="py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Solução Personalizada para Seu Projeto</h2>
          <p className="text-lg text-muted-foreground">
            Baseado no seu projeto, selecionamos forros que entregam isolamento térmico R{'>'}
            {dadosProposta.isolamento_termico_r} e durabilidade de {dadosProposta.durabilidade_anos}+ anos. 
            Com a maior variedade do mercado, a DryStore atende qualquer necessidade – de OWA madeira estética a Knauf gesso superior.
          </p>
        </div>
      </div>

      {/* Benefícios com Cards */}
      <div className="py-12 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Benefícios Comprovados</h2>
          
          {/* Gráfico de Redução de Ruído */}
          <div className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-primary" />
                  Redução de Ruído Comprovada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosRuido}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ambiente" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} dB`, 'Nível de Ruído']} />
                    <Bar dataKey="nivel" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Cards de Benefícios */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Volume2 className="h-5 w-5 text-primary" />
                  Absorção Sonora Excelente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Reduz reverberação e ruído em até <span className="font-bold text-primary">{dadosProposta.absorcao_acustica_db} dB</span> para ambientes mais produtivos e saudáveis.
                </p>
                <Badge variant="secondary">NRC até 0.90</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Thermometer className="h-5 w-5 text-primary" />
                  Isolamento Térmico Superior
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Economia de energia em até <span className="font-bold text-primary">{dadosProposta.economia_energia_percent}%</span> com materiais como lã de vidro e minerais.
                </p>
                <Badge variant="secondary">R {'>'}  {dadosProposta.isolamento_termico_r}</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Durabilidade e Segurança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Resistência ao fogo, umidade e impacto por décadas, sem deformações.
                </p>
                <Badge variant="secondary">{dadosProposta.durabilidade_anos}+ anos</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Leaf className="h-5 w-5 text-primary" />
                  Sustentabilidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Materiais recicláveis e de baixa emissão CO2, promovendo ambientes eco-friendly.
                </p>
                <Badge variant="secondary">Eco-Friendly</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Palette className="h-5 w-5 text-primary" />
                  Estética Moderna
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Destaque visual com baffles, nuvens e painéis OWA de madeira para designs incríveis.
                </p>
                <Badge variant="secondary">Design Premium</Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  Instalação Rápida e Limpa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Sem poeira excessiva, ideal para reformas rápidas em {dadosProposta.instalacao_dias} dias.
                </p>
                <Badge variant="secondary">Instalação Limpa</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Economia Energética */}
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Economia Energética Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dadosEconomia}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R$ ${value}`, '']} />
                    <Line type="monotone" dataKey="anterior" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" name="Sem Forro" />
                    <Line type="monotone" dataKey="comForro" stroke="hsl(var(--primary))" strokeWidth={3} name="Com Forro" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Variedade de Produtos */}
      <div className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Nossa Gama Completa de Forros Premium</h2>
          <p className="text-center text-lg text-muted-foreground mb-8">
            Nossa gama ampla (nacionais e importados) atende qualquer projeto – personalize com{' '}
            <span className="font-bold text-primary">{dadosProposta.tipo_forro}</span> ou misture para soluções únicas.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {tiposForros.map((tipo, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{tipo.nome}</CardTitle>
                  <Badge variant="outline">{tipo.desempenho}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">{tipo.descricao}</p>
                  <p className="text-sm"><span className="font-medium">Ideal para:</span> {tipo.aplicacao}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Especificações Técnicas */}
      <div className="py-12 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Especificações Técnicas</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Projeto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Tipo de Forro</h4>
                    <p className="text-lg font-bold text-primary">{dadosProposta.tipo_forro}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Área Coberta</h4>
                    <p className="text-lg font-bold">{dadosProposta.area_forro_m2} m²</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Absorção Acústica</h4>
                    <p className="text-lg font-bold">{dadosProposta.absorcao_acustica_db} dB de redução</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Isolamento Térmico</h4>
                    <p className="text-lg font-bold">R {'>'}  {dadosProposta.isolamento_termico_r}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Economia Energética</h4>
                    <p className="text-lg font-bold text-primary">{dadosProposta.economia_energia_percent}%</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Durabilidade</h4>
                    <p className="text-lg font-bold">{dadosProposta.durabilidade_anos}+ anos</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Por Que DryStore */}
      <div className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Por Que DryStore é a Melhor Opção</h2>
          <p className="text-xl text-center text-muted-foreground mb-12">
            Com a maior gama de forros acústicos premium (de OWA a Knauf e mais), a DryStore garante 
            soluções personalizadas que superam concorrentes em qualidade e inovação – escolha o 
            parceiro que entrega conforto real para qualquer projeto.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Variedade Incomparável</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Nacionais e Importados para Atender Residencial, Comercial ou Industrial
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Desempenho Superior</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Acústico/Térmico Líder, com Instalação em {dadosProposta.instalacao_dias} Dias
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Durabilidade Garantida</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {dadosProposta.durabilidade_anos}+ Anos sem Manutenção Excessiva
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Sustentabilidade e Saúde</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Materiais Eco-Friendly e Anti-Alérgicos para Ambientes Saudáveis
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Suporte Completo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Projeto Gratuito, Equipe Certificada e Pós-Venda 24/7
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Parcerias Premium</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Parceiro Oficial OWA e Knauf
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Depoimentos */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-center mb-8">O Que Nossos Clientes Dizem</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground italic mb-4">
                    "Os forros DryStore transformaram meu escritório – silêncio e conforto total! 
                    A produtividade da equipe aumentou visivelmente."
                  </p>
                  <p className="font-medium">- Roberto Silva, CEO TechCorp</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground italic mb-4">
                    "Instalação rápida, resultado incrível. O ambiente ficou mais silencioso e 
                    nossa conta de energia reduziu 30%."
                  </p>
                  <p className="font-medium">- Marina Costa, Arquiteta</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline de Instalação */}
      <div className="py-12 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Processo de Instalação</h2>
          
          <div className="space-y-6">
            {timelineInstalacao.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  {item.etapa}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{item.titulo}</h3>
                  <p className="text-muted-foreground mb-2">{item.descricao}</p>
                  <Badge variant="outline">{item.dias}</Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-card rounded-lg">
            <h3 className="font-bold text-lg mb-4">Manutenção Simples</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Limpeza anual com aspirador ou pano seco</li>
              <li>• Reparos fáceis em caso de danos pontuais</li>
              <li>• Garantia completa por 5 anos</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Seção de Preços */}
      <div className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Investimento e Formas de Pagamento</h2>
          <p className="text-center text-lg text-muted-foreground mb-8">
            Investimento que se Paga com Conforto e Economia – a Melhor Opção para Seu Projeto
          </p>
          
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento do Investimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span>Forros {dadosProposta.tipo_forro} ({dadosProposta.area_forro_m2} m²)</span>
                  <span className="font-medium">R$ {(valorTotal * 0.6).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Estrutura e Fixações</span>
                  <span className="font-medium">R$ {(valorTotal * 0.25).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Instalação e Acabamentos</span>
                  <span className="font-medium">R$ {(valorTotal * 0.15).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-4 text-xl font-bold border-t-2">
                  <span>Total</span>
                  <span className="text-primary">R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-bold mb-2">Parcelamento</h4>
                  <p className="text-sm">12x sem juros no cartão</p>
                  <p className="text-lg font-bold text-primary">
                    12x de R$ {(valorTotal / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-bold mb-2">À Vista</h4>
                  <p className="text-sm">5% de desconto</p>
                  <p className="text-lg font-bold text-primary">
                    R$ {(valorTotal * 0.95).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BasePropostaLayout>
  );
}