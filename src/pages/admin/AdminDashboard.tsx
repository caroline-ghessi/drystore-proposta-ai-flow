import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DryStoreSidebar } from "@/components/DryStoreSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TrendingUp, Users, AlertTriangle, DollarSign } from "lucide-react";

const AdminDashboard = () => {
  // Mock data
  const metricas = {
    totalVendas: "R$ 125.000",
    vendedoresAtivos: 8,
    vendedoresInativos: 2,
    propostasAbertas: 15,
    taxaConversao: "32%"
  };

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
                <h2 className="text-2xl font-bold tracking-tight">Visão Geral</h2>
                <p className="text-muted-foreground">
                  Acompanhe as métricas principais do seu negócio
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Vendas</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metricas.totalVendas}</div>
                    <p className="text-xs text-muted-foreground">+12% em relação ao mês anterior</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vendedores Ativos</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metricas.vendedoresAtivos}</div>
                    <p className="text-xs text-muted-foreground">de 10 vendedores totais</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vendedores Inativos</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metricas.vendedoresInativos}</div>
                    <p className="text-xs text-muted-foreground">Últimos 7 dias sem login</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Taxa Conversão</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metricas.taxaConversao}</div>
                    <p className="text-xs text-muted-foreground">+5% este mês</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;