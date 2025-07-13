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
  Percent
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
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;