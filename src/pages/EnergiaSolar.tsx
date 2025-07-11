import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DryStoreSidebar } from "@/components/DryStoreSidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bell, User, Plus, Upload, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const EnergiaSolarPage = () => {
  const { toast } = useToast();

  const handleUploadConta = () => {
    toast({
      title: "Upload realizado",
      description: "Conta de luz enviada para processamento inteligente",
    });
  };

  const produtos = [
    {
      id: 1,
      nome: "Módulo Solar 550W",
      potencia: "550W",
      eficiencia: "21.2%",
      garantia: "25 anos",
      preco: "R$ 890,00"
    },
    {
      id: 2,
      nome: "Inversor String 5kW",
      potencia: "5000W",
      eficiencia: "98.4%",
      garantia: "10 anos",
      preco: "R$ 3.200,00"
    }
  ];

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
                  <h1 className="text-lg font-semibold">Energia Solar</h1>
                  <p className="text-sm text-muted-foreground">
                    Crie propostas inteligentes com IA
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
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Upload de Conta de Luz */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Criar Proposta Inteligente
                  </CardTitle>
                  <CardDescription>
                    Envie a conta de luz do cliente para gerar uma proposta automaticamente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cliente">Nome do Cliente</Label>
                    <Input id="cliente" placeholder="Digite o nome do cliente" />
                  </div>
                  
                  <div>
                    <Label htmlFor="conta">Conta de Luz</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Clique para fazer upload ou arraste a imagem aqui
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG ou PDF até 10MB
                      </p>
                    </div>
                  </div>
                  
                  <Button onClick={handleUploadConta} className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Processar com IA
                  </Button>
                </CardContent>
              </Card>

              {/* Produtos Cadastrados */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Produtos Cadastrados</CardTitle>
                      <CardDescription>
                        Gerencie os produtos de energia solar
                      </CardDescription>
                    </div>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {produtos.map((produto) => (
                      <div key={produto.id} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{produto.nome}</h4>
                            <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                              <span>Potência: {produto.potencia}</span>
                              <span>Eficiência: {produto.eficiencia}</span>
                              <span>Garantia: {produto.garantia}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary">{produto.preco}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default EnergiaSolarPage;