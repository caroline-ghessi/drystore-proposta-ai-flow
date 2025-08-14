import { DryStoreSidebar } from "@/components/DryStoreSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProdutosMestreManager } from "@/components/admin/ProdutosMestreManager";
import { DrywallManager } from "@/components/admin/DrywallManager";
import { DivisoriasCompleteManager } from "@/components/admin/DivisoriasCompleteManager";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const AdminProdutos = () => {
  return (
    <ProtectedRoute requiredRoles={["administrador"]}>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DryStoreSidebar />
          <div className="flex-1">
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-14 items-center px-4 lg:px-6">
                <SidebarTrigger />
                <div className="ml-auto flex items-center space-x-4">
                  <h1 className="text-lg font-semibold">Gestão de Produtos</h1>
                </div>
              </div>
            </header>

            <main className="p-6">
              <Tabs defaultValue="produtos-mestre" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="produtos-mestre">Produtos Gerais</TabsTrigger>
                  <TabsTrigger value="drywall">Produtos Drywall</TabsTrigger>
                  <TabsTrigger value="calculadora">Calculadora Completa</TabsTrigger>
                </TabsList>
                
                <TabsContent value="produtos-mestre">
                  <ProdutosMestreManager />
                </TabsContent>
                
                <TabsContent value="drywall">
                  <DrywallManager />
                </TabsContent>
                
                <TabsContent value="calculadora">
                  <DivisoriasCompleteManager />
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default AdminProdutos;