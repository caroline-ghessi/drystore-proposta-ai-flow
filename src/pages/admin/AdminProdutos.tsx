import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DryStoreSidebar } from "@/components/DryStoreSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TelhasShingleManager } from "@/components/admin/TelhasShingleManager";
import { DrywallManager } from "@/components/admin/DrywallManager";
import { ImpermeabilizacaoManager } from "@/components/admin/ImpermeabilizacaoManager";
import { EnergiaSolarManager } from "@/components/admin/EnergiaSolarManager";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const AdminProdutos = () => {
  const [activeTab, setActiveTab] = useState("telhas-shingle");

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

            <main className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Gestão de Produtos</h2>
                <p className="text-muted-foreground">
                  Gerencie o catálogo completo de produtos para orçamentos
                </p>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="telhas-shingle">Telhas Shingle</TabsTrigger>
                  <TabsTrigger value="drywall">Drywall</TabsTrigger>
                  <TabsTrigger value="impermeabilizacao">Impermeabilização</TabsTrigger>
                  <TabsTrigger value="energia-solar">Energia Solar</TabsTrigger>
                </TabsList>

                <TabsContent value="telhas-shingle">
                  <TelhasShingleManager />
                </TabsContent>

                <TabsContent value="drywall">
                  <DrywallManager />
                </TabsContent>

                <TabsContent value="impermeabilizacao">
                  <ImpermeabilizacaoManager />
                </TabsContent>

                <TabsContent value="energia-solar">
                  <EnergiaSolarManager />
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