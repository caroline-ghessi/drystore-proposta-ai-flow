import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Removendo drag and drop por enquanto
import { Plus, Trash2, Copy, Settings2 } from "lucide-react";
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
    !mapeamentosDoTipo.some(m => m.composicao_id === c.id)
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
        <TabsList className="grid grid-cols-5 lg:grid-cols-10">
          {TIPOS_PROPOSTA.map((tipo) => (
            <TabsTrigger key={tipo.value} value={tipo.value} className="text-xs">
              {tipo.label.split(" ")[0]}
            </TabsTrigger>
          ))}
        </TabsList>

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Composições Mapeadas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Composições Mapeadas
                    <Badge variant="secondary">
                      {mapeamentosDoTipo.length} itens
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mapeamentosDoTipo.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhuma composição mapeada
                    </p>
                  ) : (
                    mapeamentosDoTipo.map((mapeamento, index) => (
                      <div key={mapeamento.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">
                            {mapeamento.composicao?.nome}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {mapeamento.composicao?.categoria} • 
                            R$ {mapeamento.composicao?.valor_total_m2.toFixed(2)}/m²
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            value={mapeamento.ordem_calculo}
                            onChange={(e) => atualizarMapeamento(mapeamento.id, {
                              ordem_calculo: parseInt(e.target.value) || 1
                            })}
                            className="w-16 h-8"
                          />
                          
                          <Input
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={mapeamento.fator_aplicacao}
                            onChange={(e) => atualizarMapeamento(mapeamento.id, {
                              fator_aplicacao: parseFloat(e.target.value) || 1.0
                            })}
                            className="w-20 h-8"
                          />
                          
                          <Switch
                            checked={mapeamento.obrigatorio}
                            onCheckedChange={(checked) => atualizarMapeamento(mapeamento.id, {
                              obrigatorio: checked
                            })}
                          />
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removerMapeamento(mapeamento.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Composições Disponíveis */}
              <Card>
                <CardHeader>
                  <CardTitle>Composições Disponíveis</CardTitle>
                </CardHeader>
                <CardContent>
                  {categorias.map((categoria) => (
                    <div key={categoria} className="mb-4">
                      <h4 className="font-medium mb-2 text-sm text-muted-foreground">
                        {categoria}
                      </h4>
                      <div className="space-y-2">
                        {composicoesDisponiveis
                          .filter(c => c.categoria === categoria)
                          .map((composicao) => (
                            <div
                              key={composicao.id}
                              className="flex items-center justify-between p-2 border rounded hover:bg-muted/50"
                            >
                              <div>
                                <div className="font-medium text-sm">
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
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};