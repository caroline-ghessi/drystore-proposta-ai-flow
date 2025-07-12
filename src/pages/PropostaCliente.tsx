import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import FluxoPagamento from "@/components/FluxoPagamento"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { usePropostas } from "@/hooks/usePropostas"
import DivisoriasPropostaPage from "@/components/propostas/DivisoriasPropostaPage"
import TelhasShinglePropostaPage from "@/components/propostas/TelhasShinglePropostaPage"
import EnergiaSolarPropostaPage from "@/components/propostas/EnergiaSolarPropostaPage"
import { ForrosPropostaPage } from "@/components/propostas/ForrosPropostaPage"
import { PisosPropostaPage } from "@/components/propostas/PisosPropostaPage"
import { 
  CheckCircle, 
  Zap, 
  Shield, 
  Award, 
  Calculator, 
  CreditCard, 
  MessageCircle,
  ArrowRight,
  Leaf,
  TrendingDown
} from "lucide-react"

const PropostaClientePage = () => {
  const { urlUnica } = useParams<{ urlUnica: string }>();
  const { buscarPropostaPorUrl, registrarVisualizacao, aceitarProposta } = usePropostas();
  
  const [proposta, setProposta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRecomendacoes, setShowRecomendacoes] = useState(false);
  const [propostaAceita, setPropostaAceita] = useState(false);
  const [visualizacaoRegistrada, setVisualizacaoRegistrada] = useState(false);
  const [isLoadingProposta, setIsLoadingProposta] = useState(false);

  // Carregar dados da proposta
  useEffect(() => {
    const carregarProposta = async () => {
      if (!urlUnica || isLoadingProposta) return;
      
      try {
        setIsLoadingProposta(true);
        setLoading(true);
        console.log('Carregando proposta para URL:', urlUnica);
        
        const dados = await buscarPropostaPorUrl(urlUnica);
        
        if (dados) {
          console.log('Proposta carregada:', dados);
          setProposta(dados);
          setPropostaAceita(dados.status === 'aceita');
        } else {
          console.error('Proposta não encontrada para URL:', urlUnica);
        }
      } catch (error) {
        console.error('Erro ao carregar proposta:', error);
      } finally {
        setLoading(false);
        setIsLoadingProposta(false);
      }
    };

    carregarProposta();
  }, [urlUnica]); // Removed buscarPropostaPorUrl from dependencies

  const recomendacoes = [
    {
      id: 1,
      titulo: "Telhas Shingle Premium",
      descricao: "Proteja seu investimento com cobertura de alta qualidade",
      beneficio: "Durabilidade e estética",
      valor: "R$ 12.800,00",
      desconto: "15% OFF"
    },
    {
      id: 2,
      titulo: "Sistema de Backup",
      descricao: "Bateria para armazenamento de energia",
      beneficio: "Energia 24h mesmo sem sol",
      valor: "R$ 15.200,00",
      desconto: "10% OFF"
    }
  ];

  useEffect(() => {
    // Registrar visualização da proposta
    if (!visualizacaoRegistrada && urlUnica && proposta) {
      const timer = setTimeout(async () => {
        try {
          console.log('Registrando visualização para URL:', urlUnica);
          await registrarVisualizacao(urlUnica);
          console.log("Visualização da proposta registrada - vendedor será notificado");
          setVisualizacaoRegistrada(true);
        } catch (error) {
          console.error('Erro ao registrar visualização:', error);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [visualizacaoRegistrada, urlUnica, proposta]); // Removed registrarVisualizacao from dependencies

  const handleAceitarProposta = async (formaPagamento: string) => {
    if (!proposta) return;
    
    try {
      await aceitarProposta(proposta.id);
      console.log("Proposta aceita com pagamento:", formaPagamento);
      setPropostaAceita(true);
      setShowRecomendacoes(true);
    } catch (error) {
      console.error('Erro ao aceitar proposta:', error);
    }
  };

  const handlePularRecomendacoes = () => {
    // Redirecionar para página de agradecimento
    alert("Obrigado! Seu consultor entrará em contato em breve.");
  };

  const handleAceitarRecomendacao = () => {
    alert("Ótimo! Um consultor especialista entrará em contato para detalhar essa solução.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Carregando proposta...</p>
        </div>
      </div>
    );
  }

  if (!proposta) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Proposta não encontrada</h1>
          <p className="text-muted-foreground">A proposta que você está procurando não existe ou foi removida.</p>
        </div>
      </div>
    );
  }

  // Detectar tipo de proposta e renderizar página específica
  const handleContato = () => {
    const message = encodeURIComponent(`Olá! Gostaria de falar sobre a proposta ${proposta.id?.substring(0, 8)}`);
    const whatsappUrl = `https://wa.me/5511999998888?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSolicitarMudanca = () => {
    const message = encodeURIComponent(`Olá! Gostaria de solicitar alterações na proposta ${proposta.id?.substring(0, 8)}`);
    const whatsappUrl = `https://wa.me/5511999998888?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (proposta.tipo_proposta === 'divisorias') {
    return (
      <DivisoriasPropostaPage 
        proposta={proposta}
        onAceitarProposta={handleAceitarProposta}
      />
    )
  }

  if (proposta.tipo_proposta === 'telhas') {
    return (
      <TelhasShinglePropostaPage 
        proposta={proposta}
        onAceitarProposta={handleAceitarProposta}
      />
    )
  }

  if (proposta.tipo_proposta === 'energia-solar') {
    return (
      <EnergiaSolarPropostaPage 
        proposta={proposta}
        onAceitarProposta={handleAceitarProposta}
      />
    )
  }

  if (proposta.tipo_proposta === 'forros') {
    return (
      <ForrosPropostaPage 
        proposta={proposta}
        onAceitar={handleAceitarProposta}
        onContato={handleContato}
        onSolicitarMudanca={handleSolicitarMudanca}
      />
    )
  }

  if (proposta.tipo_proposta === 'pisos') {
    return (
      <PisosPropostaPage 
        dadosProposta={proposta.dados_extraidos as any}
        nomeCliente={proposta.cliente_nome}
        numeroProposta={proposta.id.slice(0, 8)}
        dataProposta={new Date(proposta.data_criacao).toLocaleDateString('pt-BR')}
        onAceitarProposta={handleAceitarProposta}
        onContato={handleContato}
        onSolicitarMudanca={handleSolicitarMudanca}
      />
    )
  }

  // Fallback para outros tipos (página atual)
  const dadosProposta = {
    cliente: proposta.cliente_nome || "Cliente",
    endereco: proposta.cliente_endereco || "Endereço não informado",
    consumoMedio: proposta.dados_extraidos?.consumo_kwh_mes ? `${proposta.dados_extraidos.consumo_kwh_mes} kWh/mês` : "450 kWh/mês",
    valorContaAtual: proposta.dados_extraidos?.valor_conta ? `R$ ${proposta.dados_extraidos.valor_conta.toFixed(2)}` : "R$ 380,00",
    sistemaRecomendado: proposta.dados_extraidos?.potencia_sistema || "5.5 kW",
    modulosPaineis: proposta.dados_extraidos?.modulos || "10 módulos de 550W",
    inversor: proposta.dados_extraidos?.inversor || "Inversor String 5kW",
    geracao: proposta.dados_extraidos?.geracao_mensal || "620 kWh/mês",
    economia: proposta.dados_extraidos?.economia_percentual || "87%",
    valorSistema: proposta.valor_total ? `R$ ${proposta.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "R$ 28.500,00",
    payback: proposta.dados_extraidos?.payback || "4.2 anos",
    economiaTotal: proposta.dados_extraidos?.economia_total || "R$ 187.000,00"
  };

  if (showRecomendacoes) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Proposta Aceita com Sucesso! 🎉</h1>
            <p className="text-muted-foreground">
              Que tal aproveitar essas ofertas especiais para complementar sua solução?
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {recomendacoes.map((item) => (
              <Card key={item.id} className="border-primary/20 hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{item.titulo}</CardTitle>
                      <CardDescription>{item.descricao}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-success/10 text-success">
                      {item.desconto}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <Shield className="h-4 w-4" />
                      {item.beneficio}
                    </div>
                    <div className="text-2xl font-bold text-primary">{item.valor}</div>
                    <Button onClick={handleAceitarRecomendacao} className="w-full">
                      Tenho Interesse
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button onClick={handlePularRecomendacoes} variant="outline" size="lg">
              Prosseguir Apenas com a Energia Solar
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              Você pode solicitar essas soluções complementares posteriormente
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Sua Solução em Energia Solar Personalizada
          </h1>
          <p className="text-xl opacity-90 mb-6">
            Proposta exclusiva para {dadosProposta.cliente}
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
            <Zap className="h-5 w-5" />
            <span>Sistema {dadosProposta.sistemaRecomendado} • Economia de {dadosProposta.economia}</span>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Por que escolher a DryStore?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">15 Anos de Experiência</h3>
              <p className="text-muted-foreground">
                Mais de 5.000 sistemas instalados com excelência
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-4">
                <Shield className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Garantia Total</h3>
              <p className="text-muted-foreground">
                25 anos nos módulos e 10 anos no inversor
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-warning/10 rounded-full mb-4">
                <Leaf className="h-8 w-8 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sustentabilidade</h3>
              <p className="text-muted-foreground">
                Contribua para um planeta mais verde
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detalhes da Proposta */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Seu Sistema Personalizado
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Dados Atuais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Situação Atual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Consumo médio:</span>
                  <span className="font-semibold">{dadosProposta.consumoMedio}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valor da conta:</span>
                  <span className="font-semibold text-destructive">{dadosProposta.valorContaAtual}</span>
                </div>
                <div className="flex justify-between">
                  <span>Endereço:</span>
                  <span className="font-semibold text-right text-sm">{dadosProposta.endereco}</span>
                </div>
              </CardContent>
            </Card>

            {/* Sistema Proposto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Sistema Proposto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Potência:</span>
                  <span className="font-semibold text-primary">{dadosProposta.sistemaRecomendado}</span>
                </div>
                <div className="flex justify-between">
                  <span>Módulos:</span>
                  <span className="font-semibold">{dadosProposta.modulosPaineis}</span>
                </div>
                <div className="flex justify-between">
                  <span>Inversor:</span>
                  <span className="font-semibold">{dadosProposta.inversor}</span>
                </div>
                <div className="flex justify-between">
                  <span>Geração mensal:</span>
                  <span className="font-semibold text-success">{dadosProposta.geracao}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Economia */}
          <Card className="mb-8 border-success/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <TrendingDown className="h-5 w-5" />
                Sua Economia
              </CardTitle>
              <CardDescription>
                Veja quanto você vai economizar com energia solar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-success mb-2">{dadosProposta.economia}</div>
                  <div className="text-sm text-muted-foreground">Redução na conta</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-success mb-2">{dadosProposta.payback}</div>
                  <div className="text-sm text-muted-foreground">Retorno do investimento</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-success mb-2">{dadosProposta.economiaTotal}</div>
                  <div className="text-sm text-muted-foreground">Economia em 25 anos</div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Progresso para economia total:</p>
                <Progress value={15} className="h-3 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Você já economizou R$ 28.500 nos primeiros 4 anos
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Preços e Pagamento */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6 max-w-2xl">
          <Card className="border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <CreditCard className="h-6 w-6" />
                Investimento Total
              </CardTitle>
              <div className="text-4xl font-bold text-primary">{dadosProposta.valorSistema}</div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-semibold">Opções de Pagamento:</h3>
                <div className="space-y-2">
                  <div className="flex justify-between p-3 border rounded-lg">
                    <span>À vista (5% desconto)</span>
                    <span className="font-semibold text-success">R$ 27.075,00</span>
                  </div>
                  <div className="flex justify-between p-3 border rounded-lg">
                    <span>6x sem juros</span>
                    <span className="font-semibold">R$ 4.750,00/mês</span>
                  </div>
                  <div className="flex justify-between p-3 border rounded-lg">
                    <span>12x (juros 1.5%)</span>
                    <span className="font-semibold">R$ 2.470,00/mês</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                {!propostaAceita ? (
                  <>
                    <FluxoPagamento 
                      proposta={{
                        valor: proposta.valor_total || 45000,
                        produtos: proposta.dados_extraidos?.produtos || ["Sistema Solar", "Instalação"],
                        cliente: dadosProposta.cliente
                      }}
                      onAceitar={handleAceitarProposta}
                    />
                    <Button variant="outline" size="lg" className="w-full">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Falar com Consultor
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-4">
                      <CheckCircle className="h-8 w-8 text-success" />
                    </div>
                    <h3 className="text-lg font-semibold text-success">Proposta Aceita!</h3>
                    <p className="text-muted-foreground">Aguarde as recomendações especiais...</p>
                  </div>
                )}
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Proposta válida até 22/12/2024. Preços sujeitos a alteração.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default PropostaClientePage;