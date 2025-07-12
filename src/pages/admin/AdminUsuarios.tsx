import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DryStoreSidebar } from "@/components/DryStoreSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const AdminUsuarios = () => {
  const vendedores = [
    { id: "1", nome: "Carlos Santos", email: "carlos@drystore.com", whatsapp: "(11) 99999-0001", ativo: true },
    { id: "2", nome: "Ana Lima", email: "ana@drystore.com", whatsapp: "(11) 99999-0002", ativo: true },
    { id: "3", nome: "João Pedro", email: "joao@drystore.com", whatsapp: "(11) 99999-0003", ativo: false }
  ];

  const ranking = [
    { pos: 1, nome: "Carlos Santos", valor: "R$ 45.000", meta: "R$ 50.000", falta: "R$ 5.000" },
    { pos: 2, nome: "Ana Lima", valor: "R$ 38.000", meta: "R$ 40.000", falta: "R$ 2.000" },
    { pos: 3, nome: "João Pedro", valor: "R$ 30.000", meta: "R$ 35.000", falta: "R$ 5.000" }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DryStoreSidebar />
        <div className="flex-1">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 lg:px-6">
              <SidebarTrigger />
              <div className="ml-auto flex items-center space-x-4">
                <h1 className="text-lg font-semibold">Gestão de Usuários</h1>
              </div>
            </div>
          </header>

          <main className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Usuários e Ranking</h2>
              <p className="text-muted-foreground">
                Gerencie vendedores e acompanhe o desempenho da equipe
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Gestão de Usuários</CardTitle>
                <CardDescription>Cadastre e gerencie vendedores e administradores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="nomeUsuario">Nome</Label>
                      <Input id="nomeUsuario" placeholder="Nome completo" />
                    </div>
                    <div>
                      <Label htmlFor="emailUsuario">Email</Label>
                      <Input id="emailUsuario" type="email" placeholder="email@exemplo.com" />
                    </div>
                    <div>
                      <Label htmlFor="whatsappUsuario">WhatsApp</Label>
                      <Input id="whatsappUsuario" placeholder="(11) 99999-9999" />
                    </div>
                  </div>
                  <Button>Adicionar Usuário</Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>WhatsApp</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendedores.map((vendedor) => (
                      <TableRow key={vendedor.id}>
                        <TableCell>{vendedor.nome}</TableCell>
                        <TableCell>{vendedor.email}</TableCell>
                        <TableCell>{vendedor.whatsapp}</TableCell>
                        <TableCell>
                          <Switch checked={vendedor.ativo} />
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">Editar</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ranking de Vendedores</CardTitle>
                <CardDescription>Acompanhe o desempenho da equipe</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ranking.map((vendedor) => (
                    <div key={vendedor.pos} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl font-bold text-primary">#{vendedor.pos}</div>
                        <div>
                          <h3 className="font-semibold">{vendedor.nome}</h3>
                          <p className="text-sm text-muted-foreground">Vendido: {vendedor.valor}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Meta: {vendedor.meta}</p>
                        <p className="text-sm text-muted-foreground">Falta: {vendedor.falta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminUsuarios;