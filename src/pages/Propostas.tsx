import { Calendar, FileText, Plus, Search, Users, Upload, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DryStoreSidebar } from "@/components/DryStoreSidebar";
// Dashboard removido - não necessário na página de propostas
import NotificacaoRealTime from "@/components/NotificacaoRealTime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const Propostas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tipoProduto, setTipoProduto] = useState("");
  const navigate = useNavigate();

  const propostas = [
    {
      id: 1,
      cliente: "João Silva",
      produto: "Energia Solar",
      valor: "R$ 45.000,00",
      status: "em-analise",
      data: "15/12/2024",
      visualizada: true,
      aceita: false
    },
    {
      id: 2,
      cliente: "Maria Santos",
      produto: "Telhas Shingle",
      valor: "R$ 28.500,00",
      status: "aceita",
      data: "10/12/2024",
      visualizada: true,
      aceita: true
    },
    {
      id: 3,
      cliente: "Pedro Costa",
      produto: "Energia Solar",
      valor: "R$ 67.200,00",
      status: "enviada",
      data: "01/12/2024",
      visualizada: false,
      aceita: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "enviada": return "default";
      case "em-analise": return "secondary";
      case "aceita": return "default";
      default: return "outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "enviada": return "Enviada";
      case "em-analise": return "Em Análise";
      case "aceita": return "Aceita";
      default: return status;
    }
  };

  const filteredPropostas = propostas.filter(proposta =>
    proposta.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proposta.produto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DryStoreSidebar />
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center">
              <SidebarTrigger className="ml-4" />
              <div className="flex-1" />
            </div>
          </header>
          
          <main className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Propostas</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar propostas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <NotificacaoRealTime />
              <Dialog open={mostrarModal} onOpenChange={setMostrarModal}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Proposta
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nova Proposta</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Tipo de Produto</Label>
                      <Select value={tipoProduto} onValueChange={setTipoProduto}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="energia-solar">
                            <div className="flex items-center space-x-2">
                              <Zap className="w-4 h-4" />
                              <span>Energia Solar</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="outros">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4" />
                              <span>Outros Produtos</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Documento</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {tipoProduto === "energia-solar" 
                            ? "Envie a foto da conta de luz" 
                            : "Envie o PDF do projeto"
                          }
                        </p>
                        <input 
                          type="file" 
                          className="hidden" 
                          id="arquivo"
                          accept={tipoProduto === "energia-solar" ? "image/*" : ".pdf"}
                        />
                        <Button 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => document.getElementById('arquivo')?.click()}
                        >
                          Selecionar Arquivo
                        </Button>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setMostrarModal(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        className="flex-1"
                        disabled={!tipoProduto}
                        onClick={() => {
                          navigate("/processamento", { 
                            state: { tipoProduto, arquivo: "mock-file" } 
                          });
                          setMostrarModal(false);
                        }}
                      >
                        Processar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {filteredPropostas.map((proposta) => (
                <Card key={proposta.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">
                      {proposta.cliente}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {proposta.visualizada && (
                        <Badge variant="outline" className="text-xs">
                          Visualizada
                        </Badge>
                      )}
                      <Badge variant={getStatusColor(proposta.status)}>
                        {getStatusText(proposta.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{proposta.produto}</p>
                        <p className="text-xs text-muted-foreground">
                          Criada em {proposta.data}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{proposta.valor}</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Dashboard removido da página de propostas */}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Propostas;