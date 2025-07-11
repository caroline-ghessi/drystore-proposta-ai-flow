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
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao Portal de Propostas DryStore
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Este mês
          </Button>
          <Button variant="premium" size="sm" onClick={() => navigate('/propostas')}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Proposta
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PropostasRecentes propostas={propostasRecentes} />
        </div>
        <div className="lg:col-span-1">
          <MetasVendas />
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Ferramentas mais utilizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/propostas')}>
              <FileText className="h-6 w-6" />
              <span>Nova Proposta</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              <span>Adicionar Cliente</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Bell className="h-6 w-6" />
              <span>Notificações</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span>Relatórios</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}