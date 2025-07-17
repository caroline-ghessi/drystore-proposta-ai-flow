import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Trash2, Copy, Settings2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Composicao {
  id: string;
  nome: string;
  categoria: string;
  valor_total_m2: number;
  ativo: boolean;
}

interface Mapeamento {
  id: string;
  tipo_proposta: string;
  composicao_id: string;
  obrigatorio: boolean;
  ordem_calculo: number;
  fator_aplicacao: number;
  ativo: boolean;
  composicao?: Composicao;
}

const TIPOS_PROPOSTA = [
  { value: "energia-solar", label: "Energia Solar" },
  { value: "telhas-shingle", label: "Telhas Shingle" },
  { value: "divisorias-drywall", label: "Divisórias Drywall" },
  { value: "forros-pvc", label: "Forros PVC" },
  { value: "pisos-vinilicos", label: "Pisos Vinílicos" },
  { value: "impermeabilizacao", label: "Impermeabilização" },
  { value: "ventilacao-industrial", label: "Ventilação Industrial" },
  { value: "carpetes-comerciais", label: "Carpetes Comerciais" },
  { value: "divisorias-eucatex", label: "Divisórias Eucatex" },
  { value: "vergalhoes-fibra", label: "Vergalhões de Fibra" }
];

export const TipoPropostaMapeamentos = () => {
  const [composicoes, setComposicoes] = useState<Composicao[]>([]);
  const [mapeamentos, setMapeamentos] = useState<Mapeamento[]>([]);
  const [tipoSelecionado, setTipoSelecionado] = useState<string>("energia-solar");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchComposicoes();
    fetchMapeamentos();
  }, []);

  const fetchComposicoes = async () => {
    const { data, error } = await supabase
      .from("composicoes_mestre")
      .select("*")
      .eq("ativo", true)
      .order("categoria", { ascending: true })
      .order("nome", { ascending: true });

    if (error) {
      toast({
        title: "Erro ao buscar composições",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    setComposicoes(data || []);
  };

  const fetchMapeamentos = async () => {
    const { data, error } = await supabase
      .from("tipo_proposta_composicoes")
      .select(`
        *,
        composicao:composicoes_mestre(*)
      `)
      .order("tipo_proposta", { ascending: true })
      .order("ordem_calculo", { ascending: true });

    if (error) {
      toast({
        title: "Erro ao buscar mapeamentos",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    setMapeamentos(data || []);
  };

  const adicionarComposicao = async (composicaoId: string) => {
    const mapeamentosDoTipo = mapeamentos.filter(m => m.tipo_proposta === tipoSelecionado);
    const proximaOrdem = Math.max(...mapeamentosDoTipo.map(m => m.ordem_calculo), 0) + 1;

    const { error } = await supabase
      .from("tipo_proposta_composicoes")
      .insert({
        tipo_proposta: tipoSelecionado,
        composicao_id: composicaoId,
        ordem_calculo: proximaOrdem,
        obrigatorio: true,
        fator_aplicacao: 1.0
      });

    if (error) {
      toast({
        title: "Erro ao adicionar composição",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Composição adicionada",
      description: "Composição adicionada ao tipo de proposta com sucesso."
    });
    
    fetchMapeamentos();
  };

  const removerMapeamento = async (id: string) => {
    const { error } = await supabase
      .from("tipo_proposta_composicoes")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro ao remover mapeamento",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Mapeamento removido",
      description: "Mapeamento removido com sucesso."
    });
    
    fetchMapeamentos();
  };

  const atualizarMapeamento = async (id: string, updates: Partial<Mapeamento>) => {
    const { error } = await supabase
      .from("tipo_proposta_composicoes")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro ao atualizar mapeamento",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    fetchMapeamentos();
  };

  const copiarConfiguracoes = async (tipoOrigem: string, tipoDestino: string) => {
    const mapeamentosOrigem = mapeamentos.filter(m => m.tipo_proposta === tipoOrigem);
    
    const novosMapeamentos = mapeamentosOrigem.map(m => ({
      tipo_proposta: tipoDestino,
      composicao_id: m.composicao_id,
      obrigatorio: m.obrigatorio,
      ordem_calculo: m.ordem_calculo,
      fator_aplicacao: m.fator_aplicacao
    }));

    const { error } = await supabase
      .from("tipo_proposta_composicoes")
      .insert(novosMapeamentos);

    if (error) {
      toast({
        title: "Erro ao copiar configurações",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Configurações copiadas",
      description: `Configurações copiadas para ${TIPOS_PROPOSTA.find(t => t.value === tipoDestino)?.label}`
    });
    
    fetchMapeamentos();
  };

  const mapeamentosDoTipo = mapeamentos.filter(m => m.tipo_proposta === tipoSelecionado);
  const composicoesDisponiveis = composicoes.filter(c => 
    !mapeamentosDoTipo.some(m => m.composicao_id === c.id) &&
    (searchTerm === "" || c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
     c.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const categorias = [...new Set(composicoesDisponiveis.map(c => c.categoria))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mapeamento Composições ↔ Tipos de Proposta</h2>
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4 mr-2" />
          Configurações Avançadas
        </Button>
      </div>

      <Tabs value={tipoSelecionado} onValueChange={setTipoSelecionado}>
        <div className="w-full overflow-hidden">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex h-12 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-max min-w-full">
              {TIPOS_PROPOSTA.map((tipo) => {
                const qtdMapeamentos = mapeamentos.filter(m => m.tipo_proposta === tipo.value).length;
                return (
                  <TooltipProvider key={tipo.value}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger 
                          value={tipo.value} 
                          className="relative whitespace-nowrap px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                        >
                          <div className="flex flex-col items-center">
                            <span>{tipo.label}</span>
                            {qtdMapeamentos > 0 && (
                              <Badge variant="secondary" className="text-xs mt-1 h-4 px-1">
                                {qtdMapeamentos}
                              </Badge>
                            )}
                          </div>
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{tipo.label}: {qtdMapeamentos} composições mapeadas</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </TabsList>
          </ScrollArea>
        </div>

        {TIPOS_PROPOSTA.map((tipo) => (
          <TabsContent key={tipo.value} value={tipo.value} className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{tipo.label}</h3>
              <div className="flex gap-2">
                <Select onValueChange={(valor) => copiarConfiguracoes(valor, tipo.value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Copiar de..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_PROPOSTA
                      .filter(t => t.value !== tipo.value)
                      .map((tipoOrigem) => (
                        <SelectItem key={tipoOrigem.value} value={tipoOrigem.value}>
                          <div className="flex items-center gap-2">
                            <Copy className="h-4 w-4" />
                            {tipoOrigem.label}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
              {/* Composições Mapeadas */}
              <Card className="flex flex-col">
                <CardHeader className="pb-4">
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span>Composições Mapeadas</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {mapeamentosDoTipo.length} itens
                      </Badge>
                    </div>
                  </CardTitle>
                  {/* Legenda dos controles */}
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-3">
                    <span>Ordem</span>
                    <span>Fator</span>
                    <span>Obrigatório</span>
                    <span>Ações</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ScrollArea className="h-96">
                    <div className="space-y-3 pr-4">
                      {mapeamentosDoTipo.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">
                            Nenhuma composição mapeada
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Adicione composições da lista ao lado
                          </p>
                        </div>
                      ) : (
                        mapeamentosDoTipo.map((mapeamento) => (
                          <div key={mapeamento.id} className="flex flex-col sm:flex-row gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {mapeamento.composicao?.nome}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {mapeamento.composicao?.categoria} • 
                                R$ {mapeamento.composicao?.valor_total_m2.toFixed(2)}/m²
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={mapeamento.ordem_calculo}
                                      onChange={(e) => atualizarMapeamento(mapeamento.id, {
                                        ordem_calculo: parseInt(e.target.value) || 1
                                      })}
                                      className="w-16 h-8 text-center"
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Ordem de cálculo</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Input
                                      type="number"
                                      step="0.1"
                                      min="0.1"
                                      value={mapeamento.fator_aplicacao}
                                      onChange={(e) => atualizarMapeamento(mapeamento.id, {
                                        fator_aplicacao: parseFloat(e.target.value) || 1.0
                                      })}
                                      className="w-20 h-8 text-center"
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Fator de aplicação</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Switch
                                      checked={mapeamento.obrigatorio}
                                      onCheckedChange={(checked) => atualizarMapeamento(mapeamento.id, {
                                        obrigatorio: checked
                                      })}
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{mapeamento.obrigatorio ? 'Obrigatório' : 'Opcional'}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removerMapeamento(mapeamento.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Composições Disponíveis */}
              <Card className="flex flex-col">
                <CardHeader className="pb-4">
                  <CardTitle>Composições Disponíveis</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar composições..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ScrollArea className="h-96">
                    <div className="space-y-4 pr-4">
                      {categorias.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">
                            Nenhuma composição disponível
                          </p>
                          {searchTerm && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Tente buscar por outro termo
                            </p>
                          )}
                        </div>
                      ) : (
                        categorias.map((categoria) => (
                          <div key={categoria} className="space-y-2">
                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                              {categoria}
                              <Badge variant="outline" className="ml-2">
                                {composicoesDisponiveis.filter(c => c.categoria === categoria).length}
                              </Badge>
                            </h4>
                            <div className="space-y-2">
                              {composicoesDisponiveis
                                .filter(c => c.categoria === categoria)
                                .map((composicao) => (
                                  <div
                                    key={composicao.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors group"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm truncate">
                                        {composicao.nome}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        R$ {composicao.valor_total_m2.toFixed(2)}/m²
                                      </div>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => adicionarComposicao(composicao.id)}
                                      className="opacity-60 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TipoPropostaMapeamentos;