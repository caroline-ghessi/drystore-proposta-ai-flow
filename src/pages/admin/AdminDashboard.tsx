import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DryStoreSidebar } from "@/components/DryStoreSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  DollarSign, 
  Eye, 
  CheckCircle, 
  ShoppingCart,
  BarChart3,
  Target,
  Calendar,
  UserCheck,
  UserX,
  Timer,
  Percent,
  Clock,
  Zap,
  TrendingDown,
  Award,
  Phone,
  Mail
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList
} from "recharts";
import { useAdminMetrics } from "@/hooks/useAdminMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChatbotVendas } from "@/components/ChatbotVendas";

const AdminDashboard = () => {
  const { metrics, loading, error } = useAdminMetrics();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DryStoreSidebar />
        <div className="flex-1">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 lg:px-6">
              <SidebarTrigger />
              <div className="ml-auto flex items-center space-x-4">
                <h1 className="text-lg font-semibold">Dashboard Administrativo</h1>
              </div>
            </div>
          </header>

          <main className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Dashboard Administrativo</h2>
                <p className="text-muted-foreground">
                  Acompanhe as métricas e performance completa do portal
                </p>
              </div>

              {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-4 w-24" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-3 w-32 mt-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : error ? (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-destructive">Erro ao carregar métricas: {error}</p>
                  </CardContent>
                </Card>
              ) : metrics ? (
                <>
                  {/* SISTEMA DE METAS E STATUS */}
                  <div className="grid gap-6 lg:grid-cols-3">
                    {/* Meta Mensal */}
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Meta Mensal vs Realizado
                        </CardTitle>
                        <CardDescription>
                          {metrics.diasRestantes} dias restantes no mês
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-2xl font-bold">
                              {new Intl.NumberFormat('pt-BR', { 
                                style: 'currency', 
                                currency: 'BRL' 
                              }).format(metrics.faturamentoDoMes)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              de {new Intl.NumberFormat('pt-BR', { 
                                style: 'currency', 
                                currency: 'BRL' 
                              }).format(metrics.metaMensal)} meta
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">
                              {metrics.progressoMeta.toFixed(1)}%
                            </p>
                            <p className="text-sm text-muted-foreground">atingido</p>
                          </div>
                        </div>
                        
                        <Progress value={metrics.progressoMeta} className="h-3" />
                        
                        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                          <div>
                            <p className="text-sm text-muted-foreground">Necessário</p>
                            <p className="font-bold text-destructive">
                              {new Intl.NumberFormat('pt-BR', { 
                                style: 'currency', 
                                currency: 'BRL' 
                              }).format(metrics.valorNecessario)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Projeção</p>
                            <p className={`font-bold ${metrics.projecaoMes >= metrics.metaMensal ? 'text-green-600' : 'text-yellow-600'}`}>
                              {new Intl.NumberFormat('pt-BR', { 
                                style: 'currency', 
                                currency: 'BRL' 
                              }).format(metrics.projecaoMes)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Pipeline</p>
                            <p className="font-bold text-blue-600">
                              {new Intl.NumberFormat('pt-BR', { 
                                style: 'currency', 
                                currency: 'BRL' 
                              }).format(metrics.valorPipeline)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Status Crítico */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          Status Crítico
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Propostas Abertas</span>
                            <Badge variant="outline">{metrics.propostasAbertas}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Propostas do Mês</span>
                            <Badge variant="secondary">{metrics.propostasDoMes}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Taxa Conversão</span>
                            <Badge variant={metrics.taxaConversao > 20 ? "default" : "destructive"}>
                              {metrics.taxaConversao.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="pt-3 border-t">
                          <p className="text-sm text-muted-foreground mb-2">Urgência</p>
                          {metrics.progressoMeta < 50 && metrics.diasRestantes < 15 ? (
                            <Badge variant="destructive" className="w-full justify-center">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Meta em Risco
                            </Badge>
                          ) : metrics.progressoMeta < 80 ? (
                            <Badge variant="secondary" className="w-full justify-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Atenção
                            </Badge>
                          ) : (
                            <Badge variant="default" className="w-full justify-center">
                              <Award className="h-3 w-3 mr-1" />
                              No Caminho
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* MAIORES OPORTUNIDADES */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Maiores Oportunidades em Aberto
                      </CardTitle>
                      <CardDescription>
                        Foque nestas propostas para acelerar o fechamento das metas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Prioridade</TableHead>
                            <TableHead>Vendedor</TableHead>
                            <TableHead>Ação</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {metrics.maioresOportunidades.slice(0, 8).map((oportunidade, index) => (
                            <TableRow key={oportunidade.id}>
                              <TableCell className="font-medium">
                                <div>
                                  <p>{oportunidade.cliente}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {oportunidade.diasEmAberto} dias em aberto
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <p className="font-bold">
                                  {new Intl.NumberFormat('pt-BR', { 
                                    style: 'currency', 
                                    currency: 'BRL' 
                                  }).format(oportunidade.valor)}
                                </p>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{oportunidade.tipo}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    oportunidade.prioridade === 'alta' ? 'destructive' :
                                    oportunidade.prioridade === 'media' ? 'secondary' : 'outline'
                                  }
                                >
                                  {oportunidade.prioridade}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                {oportunidade.vendedor}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button size="sm" variant="outline">
                                    <Phone className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Mail className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* MÉTRICAS PRINCIPAIS */}
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(metrics.faturamentoTotal)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Ticket médio: {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(metrics.ticketMedio)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Visualização</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{metrics.taxaVisualizacao.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                          {metrics.propostasVisualizadas} de {metrics.totalPropostas} propostas
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{metrics.taxaConversao.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                          {metrics.propostasAceitas} vendas fechadas
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Equipe de Vendas</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{metrics.vendedoresAtivos}</div>
                        <p className="text-xs text-muted-foreground">
                          {metrics.vendedoresInativos} inativos de {metrics.vendedoresTotais} total
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* FUNIL DE VENDAS */}
                  <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Funil de Vendas
                        </CardTitle>
                        <CardDescription>Status das propostas no pipeline</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{
                            quantidade: {
                              label: "Propostas",
                              color: "hsl(var(--primary))",
                            },
                          }}
                        >
                          <BarChart data={metrics.statusDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="status" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="quantidade" fill="var(--color-quantidade)" />
                          </BarChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Performance Geral
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Visualização</span>
                            <span>{metrics.taxaVisualizacao.toFixed(1)}%</span>
                          </div>
                          <Progress value={metrics.taxaVisualizacao} />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Conversão</span>
                            <span>{metrics.taxaConversao.toFixed(1)}%</span>
                          </div>
                          <Progress value={metrics.taxaConversao} />
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-sm text-muted-foreground mb-2">Maior Venda</p>
                          <p className="text-xl font-bold text-primary">
                            {new Intl.NumberFormat('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL' 
                            }).format(metrics.maiorVenda)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* PERFORMANCE POR CATEGORIA */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Performance por Categoria
                      </CardTitle>
                      <CardDescription>Faturamento e volume por tipo de produto</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          valor: {
                            label: "Faturamento",
                            color: "hsl(var(--primary))",
                          },
                          quantidade: {
                            label: "Propostas",
                            color: "hsl(var(--secondary))",
                          },
                        }}
                      >
                        <BarChart data={metrics.performancePorCategoria}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="categoria" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="valor" fill="var(--color-valor)" name="Faturamento (R$)" />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* EVOLUÇÃO TEMPORAL E RANKING */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Evolução Mensal
                        </CardTitle>
                        <CardDescription>Últimos 6 meses</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{
                            propostas: {
                              label: "Propostas",
                              color: "hsl(var(--primary))",
                            },
                            valor: {
                              label: "Faturamento",
                              color: "hsl(var(--secondary))",
                            },
                          }}
                        >
                          <LineChart data={metrics.evolucaoMensal}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="mes" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line 
                              type="monotone" 
                              dataKey="propostas" 
                              stroke="var(--color-propostas)" 
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Ranking Vendedores
                        </CardTitle>
                        <CardDescription>Performance da equipe</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {metrics.rankingVendedores.slice(0, 5).map((vendedor, index) => (
                            <div key={vendedor.id} className="flex items-center justify-between p-3 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <Badge variant={index === 0 ? "default" : "secondary"}>
                                  #{index + 1}
                                </Badge>
                                <div>
                                  <p className="font-medium">{vendedor.nome}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {vendedor.propostas} propostas • {vendedor.aceitas} vendas
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">
                                  {new Intl.NumberFormat('pt-BR', { 
                                    style: 'currency', 
                                    currency: 'BRL' 
                                  }).format(vendedor.valor)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {vendedor.propostas > 0 ? 
                                    ((vendedor.aceitas / vendedor.propostas) * 100).toFixed(1) : 0}% conversão
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : null}
            </div>
          </main>
          
          {/* CHATBOT DE IA */}
          <ChatbotVendas metrics={metrics} />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;