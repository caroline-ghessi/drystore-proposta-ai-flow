import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  FileText, 
  Calendar,
  Bell,
  Plus,
  Eye,
  Send,
  AlertCircle,
  Sun,
  Home,
  Wrench,
  ArrowRight,
  Star
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import DryStoreLogo from "@/components/DryStoreLogo"
import DrysolarLogo from "@/components/submarcas/DrysolarLogo"
import DrybuildLogo from "@/components/submarcas/DrybuildLogo"
import DrytoolsLogo from "@/components/submarcas/DrytoolsLogo"

interface MetricCardProps {
  title: string
  value: string
  change: string
  changeType: "positive" | "negative" | "neutral"
  icon: React.ElementType
}

function MetricCard({ title, value, change, changeType, icon: Icon }: MetricCardProps) {
  const changeColor = {
    positive: "text-success",
    negative: "text-destructive", 
    neutral: "text-muted-foreground"
  }[changeType]

  return (
    <Card className="hover:shadow-card transition-all duration-300 bg-gradient-card border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className={`text-xs ${changeColor} flex items-center gap-1`}>
          <TrendingUp className="h-3 w-3" />
          {change}
        </p>
      </CardContent>
    </Card>
  )
}

interface PropostasRecentesProps {
  propostas: {
    id: string
    cliente: string
    valor: string
    status: "enviada" | "visualizada" | "aceita" | "pendente"
    data: string
    tipo: "energia-solar" | "materiais"
  }[]
}

function PropostasRecentes({ propostas }: PropostasRecentesProps) {
  const statusColors = {
    enviada: "bg-muted text-muted-foreground",
    visualizada: "bg-warning/10 text-warning",
    aceita: "bg-success/10 text-success",
    pendente: "bg-destructive/10 text-destructive"
  }

  const statusIcons = {
    enviada: Send,
    visualizada: Eye,
    aceita: TrendingUp,
    pendente: AlertCircle
  }

  return (
    <Card className="hover:shadow-card transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Propostas Recentes</CardTitle>
            <CardDescription>Últimas atividades em propostas</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            Ver todas
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {propostas.map((proposta) => {
            const StatusIcon = statusIcons[proposta.status]
            return (
              <div key={proposta.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-background">
                    <StatusIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{proposta.cliente}</p>
                    <p className="text-sm text-muted-foreground">{proposta.data}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">{proposta.valor}</p>
                  <Badge className={statusColors[proposta.status]}>
                    {proposta.status}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function MetasVendas() {
  const metas = [
    { nome: "Energia Solar", atual: 85, meta: 100, valor: "R$ 850.000" },
    { nome: "Materiais", atual: 60, meta: 100, valor: "R$ 240.000" },
    { nome: "Total Mensal", atual: 75, meta: 100, valor: "R$ 1.090.000" }
  ]

  return (
    <Card className="hover:shadow-card transition-all duration-300">
      <CardHeader>
        <CardTitle>Metas de Vendas</CardTitle>
        <CardDescription>Progresso mensal por categoria</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {metas.map((meta) => (
            <div key={meta.nome} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{meta.nome}</span>
                <span className="text-sm text-muted-foreground">{meta.atual}%</span>
              </div>
              <Progress 
                value={meta.atual} 
                className="h-3"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{meta.valor} / R$ {(parseInt(meta.valor.replace(/[R$\s.]/g, '')) * 100 / meta.atual).toLocaleString('pt-BR')}</span>
                <span className="text-xs text-muted-foreground">{meta.meta - meta.atual}% restante</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function Dashboard() {
  const navigate = useNavigate()

  const handleNovaPropostaClick = () => {
    navigate('/propostas?action=nova')
  }

  // Três pilares da Drystore
  const pilares = [
    {
      id: "construir",
      titulo: "CONSTRUIR",
      subtitulo: "Materiais de alta qualidade",
      descricao: "Telhas Shingle, Drywall, Light Steel Frame, Impermeabilização e soluções completas para construção a seco.",
      icon: Home,
      submarca: "Drybuild",
      route: "/materiais",
      cor: "drybuild"
    },
    {
      id: "viver", 
      titulo: "VIVER",
      subtitulo: "Soluções sustentáveis",
      descricao: "Energia Solar, baterias, carregadores elétricos e tecnologias para um futuro mais sustentável.",
      icon: Sun,
      submarca: "Drysolar", 
      route: "/energia-solar",
      cor: "drysolar"
    },
    {
      id: "transformar",
      titulo: "TRANSFORMAR",
      subtitulo: "Ferramentas profissionais",
      descricao: "Ferramentas, EPIs, escadas e equipamentos para manutenção e evolução contínua dos projetos.",
      icon: Wrench,
      submarca: "Drytools",
      route: "/ferramentas",
      cor: "drytools"
    }
  ]
  
  const metrics = [
    {
      title: "Faturamento Mensal",
      value: "R$ 1.2M",
      change: "+15% vs mês anterior",
      changeType: "positive" as const,
      icon: DollarSign
    },
    {
      title: "Propostas Enviadas", 
      value: "89",
      change: "+8 esta semana",
      changeType: "positive" as const,
      icon: FileText
    },
    {
      title: "Taxa de Conversão",
      value: "68%",
      change: "+12% vs mês anterior",
      changeType: "positive" as const,
      icon: TrendingUp
    },
    {
      title: "Clientes Ativos",
      value: "234",
      change: "+23 novos clientes",
      changeType: "positive" as const,
      icon: Users
    }
  ]

  const propostasRecentes = [
    {
      id: "1",
      cliente: "Empresa Solar Ltda",
      valor: "R$ 85.000",
      status: "aceita" as const,
      data: "Hoje, 14:30",
      tipo: "energia-solar" as const
    },
    {
      id: "2", 
      cliente: "Construtora ABC",
      valor: "R$ 45.000",
      status: "visualizada" as const,
      data: "Hoje, 10:15",
      tipo: "materiais" as const
    },
    {
      id: "3",
      cliente: "Indústria XYZ",
      valor: "R$ 120.000",
      status: "enviada" as const,
      data: "Ontem, 16:45",
      tipo: "energia-solar" as const
    },
    {
      id: "4",
      cliente: "Residencial Verde",
      valor: "R$ 25.000",
      status: "pendente" as const,
      data: "Ontem, 09:20",
      tipo: "materiais" as const
    }
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section - Drystore */}
      <div className="relative bg-gradient-hero rounded-2xl p-8 text-white overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <DryStoreLogo size="lg" className="text-white" />
            <div className="hidden md:flex items-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span className="text-sm">Desde 2002</span>
              </div>
              <div className="text-sm">22 anos de experiência</div>
              <div className="text-sm">50.000+ clientes atendidos</div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Bem-vindo ao Portal de Propostas
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Transforme seus projetos com nossas soluções inteligentes
          </p>
          
          <Button variant="secondary" size="lg" onClick={handleNovaPropostaClick}>
            <Plus className="h-5 w-5 mr-2" />
            Criar Nova Proposta
          </Button>
        </div>
        
        {/* Elemento decorativo */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Três Pilares da Drystore */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">Nosso Ecossistema</h2>
          <p className="text-lg text-muted-foreground">Soluções integrais para cada etapa do seu projeto</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pilares.map((pilar) => (
            <Card 
              key={pilar.id} 
              className={`group hover:shadow-hover transition-all duration-300 cursor-pointer border-2 hover:border-${pilar.cor} relative overflow-hidden`}
              onClick={() => navigate(pilar.route)}
            >
              <div className={`absolute inset-0 bg-${pilar.cor}/5 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <pilar.icon className={`h-12 w-12 text-${pilar.cor}`} />
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">{pilar.titulo}</CardTitle>
                <CardDescription className="text-base font-medium">{pilar.subtitulo}</CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <p className="text-muted-foreground mb-4">{pilar.descricao}</p>
                <Button variant={`${pilar.cor}-outline` as any} size="sm" className="w-full">
                  Explorar {pilar.submarca}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Métricas Drystore */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      {/* Credibilidade Drystore */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-muted/30 rounded-2xl">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">22</div>
          <div className="text-sm text-muted-foreground">Anos de experiência</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">50.000+</div>
          <div className="text-sm text-muted-foreground">Clientes atendidos</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">15.000+</div>
          <div className="text-sm text-muted-foreground">Produtos disponíveis</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">4.6⭐</div>
          <div className="text-sm text-muted-foreground">Avaliação Google</div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PropostasRecentes propostas={propostasRecentes} />
        </div>
        <div className="lg:col-span-1">
          <MetasVendas />
        </div>
      </div>

      {/* Ações Rápidas por Segmento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-drysolar/10 border-drysolar/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sun className="h-8 w-8 text-drysolar" />
              <div>
                <CardTitle className="text-drysolar">Drysolar</CardTitle>
                <CardDescription>Energia Solar</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="drysolar" size="sm" className="w-full" onClick={() => navigate('/energia-solar')}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Proposta Solar
            </Button>
            <Button variant="drysolar-outline" size="sm" className="w-full" onClick={() => navigate('/admin/produtos')}>
              Gerenciar Produtos
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-drybuild/10 border-drybuild/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Home className="h-8 w-8 text-drybuild" />
              <div>
                <CardTitle className="text-drybuild">Drybuild</CardTitle>
                <CardDescription>Construção a Seco</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="drybuild" size="sm" className="w-full" onClick={() => navigate('/materiais')}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Proposta Materiais
            </Button>
            <Button variant="drybuild-outline" size="sm" className="w-full">
              Ver Catálogo
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-drytools/10 border-drytools/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Wrench className="h-8 w-8 text-drytools" />
              <div>
                <CardTitle className="text-drytools-foreground">Drytools</CardTitle>
                <CardDescription>Ferramentas</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="drytools" size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Nova Proposta Ferramentas
            </Button>
            <Button variant="drytools-outline" size="sm" className="w-full">
              Ver Produtos
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}