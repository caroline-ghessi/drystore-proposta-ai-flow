import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DryStoreSidebar } from "@/components/DryStoreSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Eye, Edit, BarChart3, Palette, FileText, Building2, Sun, Hammer, Grid3X3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AdminLayoutsPropostas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const layoutsPropostas = [
    {
      id: "divisorias",
      nome: "Divisórias de Drywall",
      descricao: "Layout focado em segurança e qualidade Ananda Metais",
      icon: Building2,
      cor: "bg-blue-500",
      estatisticas: {
        propostas: 23,
        conversao: "28%",
        ultimaAtualizacao: "2 dias atrás"
      },
      implementado: true
    },
    {
      id: "energia-solar",
      nome: "Energia Solar",
      descricao: "Layout com foco em economia e sustentabilidade",
      icon: Sun,
      cor: "bg-yellow-500",
      estatisticas: {
        propostas: 45,
        conversao: "35%",
        ultimaAtualizacao: "1 semana atrás"
      },
      implementado: false
    },
    {
      id: "telhas",
      nome: "Telhas Shingle",
      descricao: "Layout destacando proteção e durabilidade",
      icon: Hammer,
      cor: "bg-red-500",
      estatisticas: {
        propostas: 18,
        conversao: "22%",
        ultimaAtualizacao: "3 dias atrás"
      },
      implementado: false
    },
    {
      id: "forros",
      nome: "Forros",
      descricao: "Layout com ênfase em conforto térmico e acústico",
      icon: Grid3X3,
      cor: "bg-green-500",
      estatisticas: {
        propostas: 12,
        conversao: "18%",
        ultimaAtualizacao: "1 semana atrás"
      },
      implementado: false
    },
    {
      id: "pisos",
      nome: "Pisos",
      descricao: "Layout focado em resistência e design",
      icon: FileText,
      cor: "bg-purple-500",
      estatisticas: {
        propostas: 8,
        conversao: "15%",
        ultimaAtualizacao: "2 semanas atrás"
      },
      implementado: false
    },
    {
      id: "materiais",
      nome: "Materiais de Construção",
      descricao: "Layout geral para diversos materiais",
      icon: Building2,
      cor: "bg-gray-500",
      estatisticas: {
        propostas: 31,
        conversao: "25%",
        ultimaAtualizacao: "4 dias atrás"
      },
      implementado: false
    }
  ];

  const handleVisualizarLayout = async (layoutId: string) => {
    setLoading(true);
    
    try {
      // Mapear ID do layout para tipo de proposta
      const tipoMap: Record<string, string> = {
        'divisorias': 'divisorias',
        'energia-solar': 'energia-solar',
        'telhas': 'telhas',
        'forros': 'forros',
        'pisos': 'pisos',
        'materiais': 'materiais-construcao'
      };

      const tipoProposta = tipoMap[layoutId];
      
      // Buscar uma proposta existente deste tipo
      const { data: proposta, error } = await supabase
        .from('propostas')
        .select('url_unica')
        .eq('tipo_proposta', tipoProposta as any)
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (proposta) {
        // Abrir em nova aba para manter contexto da administração
        window.open(`/proposta/${proposta.url_unica}`, '_blank');
      } else {
        alert(`Não há propostas do tipo "${layoutId}" para visualizar ainda.`);
      }
    } catch (error) {
      console.error('Erro ao buscar proposta:', error);
      alert('Erro ao carregar proposta de exemplo');
    } finally {
      setLoading(false);
    }
  };

  const handleEditarLayout = (layoutId: string) => {
    // Redirecionar para editor do layout
    console.log("Editar layout:", layoutId);
  };

  const handleVerEstatisticas = (layoutId: string) => {
    // Mostrar estatísticas detalhadas
    console.log("Ver estatísticas:", layoutId);
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
                <h1 className="text-lg font-semibold">Layouts de Propostas</h1>
              </div>
            </div>
          </header>

          <main className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Templates por Categoria</h2>
              <p className="text-muted-foreground">
                Visualize e gerencie os layouts personalizados de cada tipo de proposta
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {layoutsPropostas.map((layout) => {
                const IconComponent = layout.icon;
                return (
                  <Card key={layout.id} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${layout.cor} text-white`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{layout.nome}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={layout.implementado ? "default" : "secondary"}>
                                {layout.implementado ? "Implementado" : "Pendente"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <CardDescription className="mt-2">
                        {layout.descricao}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Estatísticas */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-2xl font-bold text-primary">{layout.estatisticas.propostas}</div>
                          <div className="text-xs text-muted-foreground">Propostas</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">{layout.estatisticas.conversao}</div>
                          <div className="text-xs text-muted-foreground">Conversão</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Atualização</div>
                          <div className="text-xs font-medium">{layout.estatisticas.ultimaAtualizacao}</div>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleVisualizarLayout(layout.id)}
                          disabled={!layout.implementado || loading}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEditarLayout(layout.id)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {layout.implementado ? "Editar" : "Criar"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleVerEstatisticas(layout.id)}
                        >
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Stats
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Configurações Globais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Configurações Globais</span>
                </CardTitle>
                <CardDescription>
                  Personalize elementos que aparecem em todos os layouts
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start">
                  <Building2 className="h-4 w-4 mr-2" />
                  Logo e Identidade Visual
                </Button>
                <Button variant="outline" className="justify-start">
                  <Palette className="h-4 w-4 mr-2" />
                  Cores e Tipografia
                </Button>
                <Button variant="outline" className="justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Textos Padrão e CTAs
                </Button>
                <Button variant="outline" className="justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Métricas de Conversão
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayoutsPropostas;