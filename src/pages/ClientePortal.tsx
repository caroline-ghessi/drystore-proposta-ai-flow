import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Eye, Clock, CheckCircle, User, Phone, MessageCircle } from "lucide-react"

const ClientePortalPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [clienteData, setClienteData] = useState({
    nome: "João Silva",
    email: "joao@email.com",
    vendedor: "Carlos Santos"
  });

  const propostas = [
    {
      id: 1,
      titulo: "Sistema de Energia Solar 5kW",
      status: "em-aberto",
      criada: "15/12/2024",
      vencimento: "22/12/2024",
      tipo: "Energia Solar",
      vendedor: "Carlos Santos"
    },
    {
      id: 2,
      titulo: "Cobertura Telhas Shingle",
      status: "expirada",
      criada: "01/12/2024",
      vencimento: "08/12/2024",
      tipo: "Telhas",
      vendedor: "Carlos Santos"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "em-aberto": return "bg-warning text-warning-foreground";
      case "aceita": return "bg-success text-success-foreground";
      case "expirada": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "em-aberto": return "Em Aberto";
      case "aceita": return "Aceita";
      case "expirada": return "Expirada";
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "em-aberto": return <Clock className="h-4 w-4" />;
      case "aceita": return <CheckCircle className="h-4 w-4" />;
      case "expirada": return <Eye className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Portal do Cliente</CardTitle>
            <CardDescription>
              Acesse suas propostas DryStore
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email ou WhatsApp</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com ou (11) 99999-9999"
                defaultValue="joao@email.com"
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Acessar Portal
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Sem necessidade de senha. Acesso simplificado e seguro.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Portal do Cliente</h1>
              <p className="text-sm text-muted-foreground">
                Bem-vindo, {clienteData.nome}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right text-sm">
                <p className="font-medium">Consultor: {clienteData.vendedor}</p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>(11) 99999-9999</span>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Suas Propostas</h2>
          <p className="text-muted-foreground">
            Acompanhe o status de todas as suas propostas DryStore
          </p>
        </div>

        <div className="grid gap-6">
          {propostas.map((proposta) => (
            <Card key={proposta.id} className="hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <CardTitle className="text-lg">{proposta.titulo}</CardTitle>
                      <CardDescription>
                        {proposta.tipo} • Criada em {proposta.criada}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(proposta.status)}>
                      {getStatusIcon(proposta.status)}
                      {getStatusText(proposta.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {proposta.status === "em-aberto" && (
                      <span>Vence em {proposta.vencimento}</span>
                    )}
                    {proposta.status === "expirada" && (
                      <span>Expirou em {proposta.vencimento}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {proposta.status === "em-aberto" && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`/proposta/${proposta.id}`, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar Proposta
                        </Button>
                        <Button size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Contatar Consultor
                        </Button>
                      </>
                    )}
                    {proposta.status === "expirada" && (
                      <Button size="sm" variant="outline">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Solicitar Nova Proposta
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {propostas.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-muted-foreground mb-4">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Nenhuma proposta encontrada</h3>
                <p>Suas propostas aparecerão aqui quando enviadas pelo seu consultor.</p>
              </div>
              <Button>
                <MessageCircle className="h-4 w-4 mr-2" />
                Entrar em Contato
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ClientePortalPage;