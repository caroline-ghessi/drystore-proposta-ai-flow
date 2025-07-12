import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DryStoreSidebar } from "@/components/DryStoreSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const AdminProdutos = () => {
  return (
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
              <h2 className="text-2xl font-bold tracking-tight">Produtos e Categorias</h2>
              <p className="text-muted-foreground">
                Gerencie o catálogo de produtos e suas categorias
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Cadastro de Produtos</CardTitle>
                <CardDescription>Adicione novos produtos ao catálogo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome do Produto</Label>
                    <Input id="nome" placeholder="Ex: Painel Solar 550W" />
                  </div>
                  <div>
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="energia-solar">Energia Solar</SelectItem>
                        <SelectItem value="telhas">Telhas</SelectItem>
                        <SelectItem value="divisorias">Divisórias</SelectItem>
                        <SelectItem value="pisos">Pisos</SelectItem>
                        <SelectItem value="forros">Forros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="preco">Preço Unitário</Label>
                    <Input id="preco" type="number" placeholder="0.00" />
                  </div>
                  <div>
                    <Label htmlFor="unidade">Unidade</Label>
                    <Input id="unidade" placeholder="Ex: UN, M², KG" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="compatibilidades">Compatibilidades (JSON)</Label>
                  <Textarea id="compatibilidades" placeholder='{"inversores": ["INV001", "INV002"], "estruturas": ["EST001"]}' />
                </div>
                <Button>Adicionar Produto</Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminProdutos;