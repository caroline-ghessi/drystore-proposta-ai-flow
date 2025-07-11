import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DryStoreSidebar } from "@/components/DryStoreSidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, User, MessageCircle, Calendar, Percent, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const PropostasPage = () => {
  const { toast } = useToast();

  const propostas = [
    {
      id: 1,
      cliente: "João Silva",
      valor: "R$ 45.000,00",
      status: "em-aberto",
      tipo: "Energia Solar",
      criada: "15/12/2024",
      vencimento: "22/12/2024",
      visualizada: true
    },
    {
      id: 2,
      cliente: "Maria Santos",
      valor: "R$ 28.500,00",
      status: "fechada",
      tipo: "Telhas Shingle",
      criada: "10/12/2024",
      vencimento: "17/12/2024",
      visualizada: true
    },
    {
      id: 3,
      cliente: "Pedro Costa",
      valor: "R$ 67.200,00",
      status: "expirada",
      tipo: "Energia Solar",
      criada: "01/12/2024",
      vencimento: "08/12/2024",
      visualizada: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "em-aberto": return "bg-warning text-warning-foreground";
      case "fechada": return "bg-success text-success-foreground";
      case "expirada": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "em-aberto": return "Em Aberto";
      case "fechada": return "Fechada";
      case "expirada": return "Expirada";
      default: return status;
    }
  };

  const handleFollowUp = (clienteNome: string) => {
    toast({
      title: "Follow-up enviado",
      description: `Mensagem de follow-up enviada para ${clienteNome} via WhatsApp`,
    });
  };

  const handleLembrete = (clienteNome: string) => {
    toast({
      title: "Lembrete agendado",
      description: `Lembrete agendado para acompanhar proposta de ${clienteNome}`,
    });
  };

  const handleSolicitarDesconto = (clienteNome: string) => {
    toast({
      title: "Solicitação enviada",
      description: `Solicitação de desconto para ${clienteNome} enviada para aprovação`,
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DryStoreSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                <div className="hidden md:block">
                  <h1 className="text-lg font-semibold">Propostas</h1>
                  <p className="text-sm text-muted-foreground">
                    Gerencie suas propostas e acompanhe o status
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

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            <Tabs defaultValue="todas" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="todas">Todas</TabsTrigger>
                <TabsTrigger value="em-aberto">Em Aberto</TabsTrigger>
                <TabsTrigger value="fechada">Fechadas</TabsTrigger>
                <TabsTrigger value="expirada">Expiradas</TabsTrigger>
              </TabsList>

              <TabsContent value="todas" className="mt-6">
                <div className="grid gap-4">
                  {propostas.map((proposta) => (
                    <Card key={proposta.id} className="hover:shadow-lg transition-all duration-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-lg">{proposta.cliente}</CardTitle>
                            <Badge className={getStatusColor(proposta.status)}>
                              {getStatusText(proposta.status)}
                            </Badge>
                            {proposta.visualizada && (
                              <Badge variant="outline" className="text-xs">
                                <Eye className="h-3 w-3 mr-1" />
                                Visualizada
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-primary">{proposta.valor}</p>
                            <p className="text-sm text-muted-foreground">{proposta.tipo}</p>
                          </div>
                        </div>
                        <CardDescription>
                          Criada em {proposta.criada} • Vence em {proposta.vencimento}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2 flex-wrap">
                          {proposta.status === "em-aberto" && proposta.visualizada && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFollowUp(proposta.cliente)}
                              className="gap-1"
                            >
                              <MessageCircle className="h-3 w-3" />
                              Follow-up WhatsApp
                            </Button>
                          )}
                          {proposta.status === "em-aberto" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleLembrete(proposta.cliente)}
                                className="gap-1"
                              >
                                <Calendar className="h-3 w-3" />
                                Agendar Lembrete
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSolicitarDesconto(proposta.cliente)}
                                className="gap-1"
                              >
                                <Percent className="h-3 w-3" />
                                Solicitar Desconto
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="em-aberto" className="mt-6">
                <div className="grid gap-4">
                  {propostas.filter(p => p.status === "em-aberto").map((proposta) => (
                    <Card key={proposta.id} className="hover:shadow-lg transition-all duration-200">
                      {/* ... mesmo conteúdo do card acima ... */}
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="fechada" className="mt-6">
                <div className="grid gap-4">
                  {propostas.filter(p => p.status === "fechada").map((proposta) => (
                    <Card key={proposta.id} className="hover:shadow-lg transition-all duration-200">
                      {/* ... mesmo conteúdo do card acima ... */}
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="expirada" className="mt-6">
                <div className="grid gap-4">
                  {propostas.filter(p => p.status === "expirada").map((proposta) => (
                    <Card key={proposta.id} className="hover:shadow-lg transition-all duration-200">
                      {/* ... mesmo conteúdo do card acima ... */}
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default PropostasPage;