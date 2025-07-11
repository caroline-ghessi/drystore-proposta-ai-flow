import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { DryStoreSidebar } from "@/components/DryStoreSidebar";
import { DebugConsole } from "@/components/DebugConsole";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TrendingUp, Users, AlertTriangle, DollarSign, Package, ShoppingCart, Settings, FileText, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Mock data
  const metricas = {
    totalVendas: "R$ 125.000",
    vendedoresAtivos: 8,
    vendedoresInativos: 2,
    propostasAbertas: 15,
    taxaConversao: "32%"
  };

  const propostas = [
    { id: "1", cliente: "João Silva", vendedor: "Carlos Santos", valor: "R$ 25.000", status: "aberta", tipo: "energia-solar" },
    { id: "2", cliente: "Maria Costa", vendedor: "Ana Lima", valor: "R$ 8.500", status: "aceita", tipo: "telhas" },
    { id: "3", cliente: "Pedro Oliveira", vendedor: "João Pedro", valor: "R$ 15.000", status: "expirada", tipo: "energia-solar" }
  ];

  const solicitacoesDesconto = [
    { id: "1", vendedor: "Carlos Santos", cliente: "João Silva", desconto: "15%", motivo: "Cliente concorrente", status: "pendente" },
    { id: "2", vendedor: "Ana Lima", cliente: "Maria Costa", desconto: "10%", motivo: "Fidelidade", status: "pendente" }
  ];

  const vendedores = [
    { id: "1", nome: "Carlos Santos", email: "carlos@drystore.com", whatsapp: "(11) 99999-0001", ativo: true },
    { id: "2", nome: "Ana Lima", email: "ana@drystore.com", whatsapp: "(11) 99999-0002", ativo: true },
    { id: "3", nome: "João Pedro", email: "joao@drystore.com", whatsapp: "(11) 99999-0003", ativo: false }
  ];

  const handleAprovarDesconto = (id: string, aprovado: boolean) => {
    toast({
      title: aprovado ? "Desconto Aprovado" : "Desconto Rejeitado",
      description: `Solicitação ${id} foi ${aprovado ? 'aprovada' : 'rejeitada'} com sucesso.`
    });
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
                <h1 className="text-lg font-semibold">Painel Administrativo</h1>
              </div>
            </div>
          </header>

          <main className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-9">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="propostas">Propostas</TabsTrigger>
                <TabsTrigger value="clientes">Clientes</TabsTrigger>
                <TabsTrigger value="ranking">Ranking</TabsTrigger>
                <TabsTrigger value="produtos">Produtos</TabsTrigger>
                <TabsTrigger value="aprovacoes">Aprovações</TabsTrigger>
                <TabsTrigger value="usuarios">Usuários</TabsTrigger>
                <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
                <TabsTrigger value="debug">Debug</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
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
              </TabsContent>

              <TabsContent value="propostas" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Todas as Propostas</CardTitle>
                    <CardDescription>Gerencie todas as propostas do sistema</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Vendedor</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {propostas.map((proposta) => (
                          <TableRow key={proposta.id}>
                            <TableCell>{proposta.cliente}</TableCell>
                            <TableCell>{proposta.vendedor}</TableCell>
                            <TableCell>{proposta.valor}</TableCell>
                            <TableCell>{proposta.tipo}</TableCell>
                            <TableCell>
                              <Badge variant={
                                proposta.status === 'aceita' ? 'default' :
                                proposta.status === 'aberta' ? 'secondary' : 'destructive'
                              }>
                                {proposta.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="produtos" className="space-y-6">
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
              </TabsContent>

              <TabsContent value="aprovacoes" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Solicitações de Desconto</CardTitle>
                    <CardDescription>Aprove ou rejeite solicitações de desconto dos vendedores</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vendedor</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Desconto</TableHead>
                          <TableHead>Motivo</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {solicitacoesDesconto.map((solicitacao) => (
                          <TableRow key={solicitacao.id}>
                            <TableCell>{solicitacao.vendedor}</TableCell>
                            <TableCell>{solicitacao.cliente}</TableCell>
                            <TableCell>{solicitacao.desconto}</TableCell>
                            <TableCell>{solicitacao.motivo}</TableCell>
                            <TableCell className="space-x-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleAprovarDesconto(solicitacao.id, true)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Aprovar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleAprovarDesconto(solicitacao.id, false)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Rejeitar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="usuarios" className="space-y-6">
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
              </TabsContent>

              <TabsContent value="pagamentos" className="space-y-6">
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
              </TabsContent>

              <TabsContent value="debug" className="space-y-6">
                <DebugConsole />
              </TabsContent>

              <TabsContent value="ranking" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ranking de Vendedores</CardTitle>
                    <CardDescription>Acompanhe o desempenho da equipe</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { pos: 1, nome: "Carlos Santos", valor: "R$ 45.000", meta: "R$ 50.000", falta: "R$ 5.000" },
                        { pos: 2, nome: "Ana Lima", valor: "R$ 38.000", meta: "R$ 40.000", falta: "R$ 2.000" },
                        { pos: 3, nome: "João Pedro", valor: "R$ 25.000", meta: "R$ 35.000", falta: "R$ 10.000" }
                      ].map((vendedor) => (
                        <div key={vendedor.pos} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl font-bold text-primary">#{vendedor.pos}</div>
                            <div>
                              <div className="font-semibold">{vendedor.nome}</div>
                              <div className="text-sm text-muted-foreground">Vendas: {vendedor.valor}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-orange-600">
                              Falta {vendedor.falta} para o bônus!
                            </div>
                            <div className="text-sm text-muted-foreground">Meta: {vendedor.meta}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="clientes" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Lista de Clientes</CardTitle>
                    <CardDescription>Todos os clientes cadastrados no sistema</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>WhatsApp</TableHead>
                          <TableHead>Vendedor</TableHead>
                          <TableHead>Propostas</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>João Silva</TableCell>
                          <TableCell>joao@email.com</TableCell>
                          <TableCell>(11) 99999-1111</TableCell>
                          <TableCell>Carlos Santos</TableCell>
                          <TableCell>2</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Maria Costa</TableCell>
                          <TableCell>maria@email.com</TableCell>
                          <TableCell>(11) 99999-2222</TableCell>
                          <TableCell>Ana Lima</TableCell>
                          <TableCell>1</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
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

export default Admin;