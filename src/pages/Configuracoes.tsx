import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DryStoreSidebar } from "@/components/DryStoreSidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Bell, User, Settings, CreditCard, Users, Percent, MessageSquare, Bug } from "lucide-react"

const ConfiguracoesPage = () => {
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
                  <h1 className="text-lg font-semibold">Configurações</h1>
                  <p className="text-sm text-muted-foreground">
                    Gerencie configurações do sistema e integrações
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
            <Tabs defaultValue="geral" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="geral">Geral</TabsTrigger>
                <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
                <TabsTrigger value="usuarios">Usuários</TabsTrigger>
                <TabsTrigger value="aprovacoes">Aprovações</TabsTrigger>
                <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
                <TabsTrigger value="debug">Debug</TabsTrigger>
              </TabsList>

              <TabsContent value="geral" className="mt-6">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Configurações Gerais
                      </CardTitle>
                      <CardDescription>
                        Configurações básicas da plataforma
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="empresa">Nome da Empresa</Label>
                          <Input id="empresa" defaultValue="DryStore Ltda" />
                        </div>
                        <div>
                          <Label htmlFor="logo">URL do Logo</Label>
                          <Input id="logo" placeholder="https://..." />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="descricao">Descrição da Empresa</Label>
                        <Input id="descricao" defaultValue="Especialista em Energia Solar e Materiais de Construção" />
                      </div>
                      <Button>Salvar Configurações</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Regras de Recomendação</CardTitle>
                      <CardDescription>
                        Configure produtos complementares para cross-selling
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Energia Solar + Telhas</Label>
                          <p className="text-sm text-muted-foreground">Recomendar telhas para clientes de energia solar</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Materiais + Pisos</Label>
                          <p className="text-sm text-muted-foreground">Recomendar pisos complementares</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="pagamentos" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Formas de Pagamento
                    </CardTitle>
                    <CardDescription>
                      Configure opções de pagamento disponíveis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="parcelas">Máximo de Parcelas</Label>
                        <Input id="parcelas" type="number" defaultValue="12" />
                      </div>
                      <div>
                        <Label htmlFor="juros">Taxa de Juros (%)</Label>
                        <Input id="juros" type="number" step="0.01" defaultValue="2.5" />
                      </div>
                      <div>
                        <Label htmlFor="desconto">Desconto à Vista (%)</Label>
                        <Input id="desconto" type="number" step="0.01" defaultValue="5" />
                      </div>
                    </div>
                    <Button>Atualizar Configurações</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="usuarios" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Gestão de Usuários
                    </CardTitle>
                    <CardDescription>
                      Cadastre e gerencie vendedores e administradores
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nome">Nome Completo</Label>
                        <Input id="nome" placeholder="Nome do usuário" />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="email@empresa.com" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input id="telefone" placeholder="(11) 99999-9999" />
                      </div>
                      <div>
                        <Label htmlFor="cargo">Cargo</Label>
                        <select className="w-full p-2 border rounded-md">
                          <option value="vendedor">Vendedor</option>
                          <option value="admin">Administrador</option>
                          <option value="representante">Representante</option>
                        </select>
                      </div>
                    </div>
                    <Button>Cadastrar Usuário</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="aprovacoes" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Percent className="h-5 w-5" />
                      Sistema de Aprovações
                    </CardTitle>
                    <CardDescription>
                      Gerencie solicitações de desconto da equipe
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">Desconto de 15% - João Silva</h4>
                            <p className="text-sm text-muted-foreground">Cliente: Maria Santos - R$ 45.000</p>
                            <p className="text-xs text-muted-foreground">Solicitado em 15/12/2024</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">Rejeitar</Button>
                            <Button size="sm">Aprovar</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notificacoes" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Configurações de Notificação
                    </CardTitle>
                    <CardDescription>
                      Configure integrações do WhatsApp e notificações
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="whatsapp-token">Token da API WhatsApp (Whapi)</Label>
                      <Input id="whatsapp-token" type="password" placeholder="Insira o token da API" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Notificar quando cliente visualiza proposta</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Notificar quando proposta é aceita</Label>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    <Button>Salvar Configurações</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="debug" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bug className="h-5 w-5" />
                      Debug de Integrações
                    </CardTitle>
                    <CardDescription>
                      Monitore e teste as integrações do sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="border rounded-lg p-3 text-center">
                        <div className="text-success text-2xl">✓</div>
                        <p className="text-sm font-medium">Dify API</p>
                        <p className="text-xs text-muted-foreground">Conectado</p>
                      </div>
                      <div className="border rounded-lg p-3 text-center">
                        <div className="text-success text-2xl">✓</div>
                        <p className="text-sm font-medium">Supabase</p>
                        <p className="text-xs text-muted-foreground">Conectado</p>
                      </div>
                      <div className="border rounded-lg p-3 text-center">
                        <div className="text-warning text-2xl">⚠</div>
                        <p className="text-sm font-medium">WhatsApp API</p>
                        <p className="text-xs text-muted-foreground">Configurar</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full">Testar Dify API</Button>
                      <Button variant="outline" className="w-full">Testar WhatsApp</Button>
                      <Button variant="outline" className="w-full">Logs do Sistema</Button>
                    </div>
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

export default ConfiguracoesPage;