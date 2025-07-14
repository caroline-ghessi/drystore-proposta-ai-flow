import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DryStoreSidebar } from "@/components/DryStoreSidebar"
import { Button } from "@/components/ui/button"
import { Bell, User, Calculator } from "lucide-react"
import { CalculadoraMateriais } from "@/components/calculadoras/CalculadoraMateriais"

const MateriaisPage = () => {
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
                  <h1 className="text-lg font-semibold flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Calculadoras de Materiais
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Ferramentas rápidas para cálculo e orçamento
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
            <CalculadoraMateriais />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MateriaisPage;