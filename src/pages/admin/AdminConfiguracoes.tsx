import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DryStoreSidebar } from "@/components/DryStoreSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DebugConsole } from "@/components/DebugConsole";

const AdminConfiguracoes = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DryStoreSidebar />
        <div className="flex-1">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 lg:px-6">
              <SidebarTrigger />
              <div className="ml-auto flex items-center space-x-4">
                <h1 className="text-lg font-semibold">Configurações do Sistema</h1>
              </div>
            </div>
          </header>

          <main className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Configurações e Debug</h2>
              <p className="text-muted-foreground">
                Configure pagamentos e monitore o sistema
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Configurações de Pagamento</CardTitle>
                <CardDescription>Configure opções de parcelamento e juros</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxParcelas">Máximo de Parcelas</Label>
                    <Input id="maxParcelas" type="number" defaultValue="12" />
                  </div>
                  <div>
                    <Label htmlFor="jurosAoMes">Juros ao Mês (%)</Label>
                    <Input id="jurosAoMes" type="number" step="0.01" defaultValue="2.5" />
                  </div>
                  <div>
                    <Label htmlFor="descontoAvista">Desconto à Vista (%)</Label>
                    <Input id="descontoAvista" type="number" step="0.01" defaultValue="5" />
                  </div>
                  <div>
                    <Label htmlFor="valorMinParcela">Valor Mín. Parcela</Label>
                    <Input id="valorMinParcela" type="number" defaultValue="100" />
                  </div>
                </div>
                <Button>Salvar Configurações</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Console de Debug</CardTitle>
                <CardDescription>Monitore logs e integrações do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <DebugConsole />
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminConfiguracoes;