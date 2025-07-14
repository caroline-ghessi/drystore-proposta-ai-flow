import { DryStoreSidebar } from "@/components/DryStoreSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TreinamentoIAManager } from "@/components/admin/TreinamentoIAManager";

export default function AdminTreinamentoIA() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DryStoreSidebar />
        <main className="flex-1">
          <header className="h-16 border-b border-border bg-card flex items-center px-6 justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Treinamento IA</h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie o conhecimento do agente de follow-up
                </p>
              </div>
            </div>
          </header>
          <div className="p-6">
            <TreinamentoIAManager />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}