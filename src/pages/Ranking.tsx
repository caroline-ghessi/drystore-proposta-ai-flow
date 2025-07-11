import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DryStoreSidebar } from "@/components/DryStoreSidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Bell, User, Trophy, Target, TrendingUp, Gift } from "lucide-react"

const RankingPage = () => {
  const vendedores = [
    {
      posicao: 1,
      nome: "Carlos Silva",
      vendas: "R$ 450.000",
      propostas: 25,
      conversao: 68,
      meta: 85,
      bonus: "R$ 5.000"
    },
    {
      posicao: 2,
      nome: "Ana Costa",
      vendas: "R$ 380.000",
      propostas: 22,
      conversao: 72,
      meta: 76,
      bonus: "R$ 3.500"
    },
    {
      posicao: 3,
      nome: "Pedro Santos",
      vendas: "R$ 320.000",
      propostas: 18,
      conversao: 61,
      meta: 65,
      bonus: "R$ 2.000"
    }
  ];

  const metas = [
    {
      titulo: "Meta Mensal",
      atual: 320000,
      objetivo: 400000,
      faltante: 80000
    },
    {
      titulo: "Bônus Gold",
      atual: 320000,
      objetivo: 500000,
      faltante: 180000
    }
  ];

  const getPosicaoIcon = (posicao: number) => {
    switch (posicao) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return posicao;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DryStoreSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                <div className="hidden md:block">
                  <h1 className="text-lg font-semibold">Ranking de Vendas</h1>
                  <p className="text-sm text-muted-foreground">
                    Acompanhe metas, bônus e desempenho da equipe
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              {/* Metas Pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Suas Metas
                  </CardTitle>
                  <CardDescription>
                    Acompanhe seu progresso e bônus
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {metas.map((meta, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{meta.titulo}</span>
                        <span className="text-muted-foreground">
                          {Math.round((meta.atual / meta.objetivo) * 100)}%
                        </span>
                      </div>
                      <Progress value={(meta.atual / meta.objetivo) * 100} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>R$ {(meta.atual / 1000).toFixed(0)}k</span>
                        <span>R$ {(meta.objetivo / 1000).toFixed(0)}k</span>
                      </div>
                      <div className="text-xs text-primary font-medium">
                        Falta apenas R$ {(meta.faltante / 1000).toFixed(0)}k para atingir o bônus!
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-success" />
                    Sua Performance
                  </CardTitle>
                  <CardDescription>
                    Dados do período atual
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-primary">R$ 320k</p>
                      <p className="text-xs text-muted-foreground">Vendas Totais</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-success">18</p>
                      <p className="text-xs text-muted-foreground">Propostas</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-warning">61%</p>
                      <p className="text-xs text-muted-foreground">Conversão</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">3°</p>
                      <p className="text-xs text-muted-foreground">Posição</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Próximo Bônus */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-warning" />
                    Próximo Bônus
                  </CardTitle>
                  <CardDescription>
                    Continue assim para garantir!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-primary">R$ 2.500</div>
                    <div className="text-sm text-muted-foreground">Bônus Silver</div>
                    <div className="text-xs text-muted-foreground">
                      Faltam apenas R$ 30k em vendas
                    </div>
                    <Progress value={75} className="h-2 mt-3" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="mensal" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="mensal">Mensal</TabsTrigger>
                <TabsTrigger value="trimestral">Trimestral</TabsTrigger>
                <TabsTrigger value="semestral">Semestral</TabsTrigger>
                <TabsTrigger value="anual">Anual</TabsTrigger>
              </TabsList>

              <TabsContent value="mensal" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-warning" />
                      Ranking Mensal - Dezembro 2024
                    </CardTitle>
                    <CardDescription>
                      Desempenho da equipe no período atual
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {vendedores.map((vendedor) => (
                        <div key={vendedor.posicao} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="text-2xl">
                              {getPosicaoIcon(vendedor.posicao)}
                            </div>
                            <div>
                              <h3 className="font-semibold">{vendedor.nome}</h3>
                              <div className="flex gap-4 text-sm text-muted-foreground">
                                <span>{vendedor.propostas} propostas</span>
                                <span>{vendedor.conversao}% conversão</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">{vendedor.vendas}</p>
                            <Badge variant="secondary" className="text-xs">
                              Bônus: {vendedor.bonus}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Repetir para outros períodos */}
              <TabsContent value="trimestral" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-warning" />
                      Ranking Trimestral - Q4 2024
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                      Dados do ranking trimestral serão exibidos aqui
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="semestral" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-warning" />
                      Ranking Semestral - 2º Semestre 2024
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                      Dados do ranking semestral serão exibidos aqui
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="anual" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-warning" />
                      Ranking Anual - 2024
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                      Dados do ranking anual serão exibidos aqui
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default RankingPage;