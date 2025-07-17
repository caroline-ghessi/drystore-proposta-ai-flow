import { DryStoreSidebar } from "@/components/DryStoreSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProdutosMestreManager } from "@/components/admin/ProdutosMestreManager";
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
              <ProdutosMestreManager />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default AdminProdutos;