import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DryStoreSidebar } from "@/components/DryStoreSidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, User, Upload, FileText, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const MateriaisPage = () => {
  const { toast } = useToast();

  const handleUploadPDF = () => {
    toast({
      title: "Upload realizado",
      description: "PDF enviado para processamento automático",
    });
  };

  const categorias = {
    telhas: [
      { nome: "Telha Shingle Premium", medida: "1m x 0.3m", cor: "Cinza Escuro", preco: "R$ 45,00/m²" },
      { nome: "Telha Shingle Classic", medida: "1m x 0.3m", cor: "Marrom", preco: "R$ 38,00/m²" }
    ],
    divisorias: [
      { nome: "Divisória Drywall 70mm", medida: "2.5m x 1.2m", tipo: "Acústica", preco: "R$ 120,00/m²" },
      { nome: "Divisória Eucatex", medida: "2.4m x 1.2m", tipo: "Decorativa", preco: "R$ 95,00/m²" }
    ],
    pisos: [
      { nome: "Piso Vinílico Premium", medida: "18x18cm", tipo: "Antiderrapante", preco: "R$ 85,00/m²" },
      { nome: "Piso Laminado", medida: "19x19cm", tipo: "Residencial", preco: "R$ 65,00/m²" }
    ]
  };

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
                  <h1 className="text-lg font-semibold">Materiais de Construção</h1>
                  <p className="text-sm text-muted-foreground">
                    Telhas, divisórias, pisos e mais
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
            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              {/* Upload de PDF */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Criar Proposta via PDF
                  </CardTitle>
                  <CardDescription>
                    Envie especificações em PDF para processamento automático
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cliente">Nome do Cliente</Label>
                    <Input id="cliente" placeholder="Digite o nome do cliente" />
                  </div>
                  
                  <div>
                    <Label htmlFor="pdf">Especificações (PDF)</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                      <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Upload do PDF
                      </p>
                    </div>
                  </div>
                  
                  <Button onClick={handleUploadPDF} className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Processar PDF
                  </Button>
                </CardContent>
              </Card>

              {/* Catálogo de Produtos */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Catálogo de Produtos</CardTitle>
                      <CardDescription>
                        Produtos disponíveis por categoria
                      </CardDescription>
                    </div>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Produto
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="telhas" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="telhas">Telhas Shingle</TabsTrigger>
                      <TabsTrigger value="divisorias">Divisórias</TabsTrigger>
                      <TabsTrigger value="pisos">Pisos</TabsTrigger>
                    </TabsList>

                    {Object.entries(categorias).map(([categoria, produtos]) => (
                      <TabsContent key={categoria} value={categoria} className="mt-4">
                        <div className="space-y-3">
                          {produtos.map((produto, index) => (
                            <div key={index} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{produto.nome}</h4>
                                  <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                                    <span>Medida: {produto.medida}</span>
                                    <span>{produto.cor || produto.tipo}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-primary">{produto.preco}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MateriaisPage;