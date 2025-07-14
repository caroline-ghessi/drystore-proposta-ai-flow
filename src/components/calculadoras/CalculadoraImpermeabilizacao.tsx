import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { 
  Calculator, 
  Shield, 
  Package, 
  FileText,
  AlertCircle, 
  Layers 
} from 'lucide-react'

interface ProdutoImpermeabilizacao {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  categoria: string;
  consumo_m2: number;
  unidade_medida: string;
  unidade_venda: string;
  quantidade_unidade_venda: number;
  preco_unitario: number;
  aplicacoes: string[];
}

interface ItemCalculado {
  produto_id: string;
  produto_codigo: string;
  produto_nome: string;
  tipo: string;
  funcao: string;
  consumo_m2: number;
  area_aplicacao: number;
  quantidade_necessaria: number;
  quantidade_com_quebra: number;
  unidades_compra: number;
  unidade_venda: string;
  preco_unitario: number;
  valor_total: number;
  ordem: number;
}

const TIPOS_APLICACAO = [
  { value: 'LAJE_DESCOBERTA', label: 'Laje Descoberta', icon: '🏢' },
  { value: 'LAJE_TRANSITO', label: 'Laje com Trânsito', icon: '🚶' },
  { value: 'PISCINA', label: 'Piscina', icon: '🏊' },
  { value: 'RESERVATORIO', label: 'Reservatório', icon: '💧' },
  { value: 'FUNDACAO', label: 'Fundação/Baldrame', icon: '🏗️' },
  { value: 'JARDINEIRA', label: 'Jardineira/Floreira', icon: '🌿' },
  { value: 'AREA_MOLHADA', label: 'Área Molhada', icon: '🚿' },
  { value: 'FACHADA', label: 'Fachada', icon: '🏠' }
]

export const CalculadoraImpermeabilizacao = () => {
  const { toast } = useToast();
  const [produtos, setProdutos] = useState<ProdutoImpermeabilizacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Inputs do projeto
  const [tipoAplicacao, setTipoAplicacao] = useState('LAJE_DESCOBERTA');
  const [areaTotal, setAreaTotal] = useState(100);
  const [perimetro, setPerimetro] = useState(40);
  const [alturaRodape, setAlturaRodape] = useState(0.30);
  const [comTela, setComTela] = useState(true);
  const [comPrimer, setComPrimer] = useState(true);
  const [quebraPersonalizada, setQuebraPersonalizada] = useState(false);
  const [quebraPercentual, setQuebraPercentual] = useState(5);
  const [produtoImpermeabilizante, setProdutoImpermeabilizante] = useState('');
  
  // Resultado
  const [itensCalculados, setItensCalculados] = useState<ItemCalculado[]>([]);
  const [valorTotal, setValorTotal] = useState(0);
  const [areaImpermeabilizar, setAreaImpermeabilizar] = useState(0);

  useEffect(() => {
    carregarProdutos();
  }, []);

  useEffect(() => {
    calcularAreaTotal();
  }, [areaTotal, perimetro, alturaRodape]);

  const carregarProdutos = async () => {
    const { data, error } = await supabase
      .from('produtos_impermeabilizacao')
      .select('*')
      .eq('ativo', true)
      .order('tipo')
      .order('nome');

    if (data) {
      setProdutos(data);
      
      // Selecionar produto padrão baseado no tipo de aplicação
      const impermeabilizante = data.find(p => 
        p.categoria === 'IMPERMEABILIZANTE' && 
        (p.aplicacoes.includes(tipoAplicacao.toLowerCase()) || p.aplicacoes.includes('universal'))
      );
      
      if (impermeabilizante) {
        setProdutoImpermeabilizante(impermeabilizante.id);
      }
    }
    setLoading(false);
  };

  const calcularAreaTotal = () => {
    const areaVertical = perimetro * alturaRodape;
    const total = areaTotal + areaVertical;
    setAreaImpermeabilizar(total);
  };

  const calcularOrcamento = async () => {
    setIsCalculating(true);
    
    try {
      const quebra = quebraPersonalizada ? quebraPercentual : 5;
      
      const { data, error } = await supabase.rpc('calcular_orcamento_impermeabilizacao', {
        p_area_total: areaTotal,
        p_tipo_aplicacao: tipoAplicacao,
        p_perimetro: perimetro,
        p_altura_subida: alturaRodape,
        p_com_tela: comTela,
        p_com_primer: comPrimer,
        p_quebra: quebra,
        p_produto_principal_id: produtoImpermeabilizante || null
      });

      if (error) throw error;

      if (data) {
        setItensCalculados(data);
        const total = data.reduce((acc: number, item: ItemCalculado) => acc + item.valor_total, 0);
        setValorTotal(total);

        toast({
          title: "Cálculo Concluído",
          description: `Orçamento calculado: ${formatCurrency(total)}`,
        });
      }
    } catch (error) {
      console.error('Erro ao calcular orçamento:', error);
      toast({
        title: "Erro no cálculo",
        description: "Não foi possível calcular o orçamento.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const gerarProposta = () => {
    toast({
      title: "Proposta em desenvolvimento",
      description: "Funcionalidade de geração de proposta será implementada em breve."
    });
  };

  // Filtrar produtos por categoria
  const produtosImpermeabilizantes = produtos.filter(p => 
    p.categoria === 'IMPERMEABILIZANTE' && 
    (p.aplicacoes.includes(tipoAplicacao.toLowerCase()) || p.aplicacoes.includes('universal'))
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Calculadora de Impermeabilização
        </h2>
        <p className="text-muted-foreground">
          Configure os parâmetros para calcular o orçamento de impermeabilização
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna Esquerda: Formulário */}
        <div className="space-y-6">
          {/* Dados do Projeto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados do Projeto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tipo-aplicacao">Tipo de Aplicação</Label>
                <Select value={tipoAplicacao} onValueChange={setTipoAplicacao}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_APLICACAO.map(tipo => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.icon} {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="area-total">Área Total (m²)</Label>
                <Input
                  id="area-total"
                  type="number"
                  value={areaTotal}
                  onChange={(e) => setAreaTotal(parseFloat(e.target.value) || 0)}
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="perimetro">Perímetro (m)</Label>
                <Input
                  id="perimetro"
                  type="number"
                  value={perimetro}
                  onChange={(e) => setPerimetro(parseFloat(e.target.value) || 0)}
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="altura-rodape">Altura do Rodapé (m)</Label>
                <Input
                  id="altura-rodape"
                  type="number"
                  value={alturaRodape}
                  onChange={(e) => setAlturaRodape(parseFloat(e.target.value) || 0)}
                  step="0.01"
                  min="0"
                  max="2"
                />
              </div>

              <Card className="p-3 bg-secondary/50">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Área Horizontal:</span>
                    <span className="font-medium">{areaTotal.toFixed(2)} m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Área Vertical (rodapé):</span>
                    <span className="font-medium">{(perimetro * alturaRodape).toFixed(2)} m²</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-1">
                    <span>Área Total a Impermeabilizar:</span>
                    <span>{areaImpermeabilizar.toFixed(2)} m²</span>
                  </div>
                </div>
              </Card>
            </CardContent>
          </Card>

          {/* Seleção de Produtos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seleção de Produtos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="produto-principal">Impermeabilizante Principal</Label>
                <Select value={produtoImpermeabilizante} onValueChange={setProdutoImpermeabilizante}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {produtosImpermeabilizantes.map(produto => (
                      <SelectItem key={produto.id} value={produto.id}>
                        <div className="flex flex-col">
                          <span>{produto.nome}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatCurrency(produto.preco_unitario)}/{produto.unidade_venda}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="com-tela"
                    checked={comTela}
                    onCheckedChange={(checked) => setComTela(checked as boolean)}
                  />
                  <Label htmlFor="com-tela">Incluir Tela de Reforço</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="com-primer"
                    checked={comPrimer}
                    onCheckedChange={(checked) => setComPrimer(checked as boolean)}
                  />
                  <Label htmlFor="com-primer">Incluir Primer</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="quebra-personalizada"
                    checked={quebraPersonalizada}
                    onCheckedChange={(checked) => setQuebraPersonalizada(checked as boolean)}
                  />
                  <Label htmlFor="quebra-personalizada">Quebra Personalizada</Label>
                </div>

                {quebraPersonalizada && (
                  <div>
                    <Label htmlFor="quebra-percentual">Quebra (%)</Label>
                    <Input
                      id="quebra-percentual"
                      type="number"
                      value={quebraPercentual}
                      onChange={(e) => setQuebraPercentual(parseFloat(e.target.value) || 0)}
                      step="0.1"
                      min="0"
                      max="50"
                    />
                  </div>
                )}
                
                {!quebraPersonalizada && (
                  <p className="text-sm text-muted-foreground">Usando quebra padrão: 5%</p>
                )}
              </div>

              <Button 
                onClick={calcularOrcamento} 
                className="w-full"
                disabled={!areaImpermeabilizar || !produtoImpermeabilizante || isCalculating}
              >
                <Calculator className="w-4 h-4 mr-2" />
                {isCalculating ? 'Calculando...' : 'Calcular Orçamento'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita: Resultado */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resultado do Orçamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {itensCalculados.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {itensCalculados.map((item, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm">{item.produto_nome}</p>
                            <p className="text-xs text-muted-foreground">{item.funcao}</p>
                          </div>
                          <Package className="w-4 h-4 text-muted-foreground" />
                        </div>
                        
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span>Consumo:</span>
                            <span>{item.consumo_m2} kg/m²</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Área:</span>
                            <span>{item.area_aplicacao.toFixed(2)} m²</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Necessário:</span>
                            <span>{item.quantidade_necessaria.toFixed(2)} kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Com quebra:</span>
                            <span>{item.quantidade_com_quebra.toFixed(2)} kg</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Comprar:</span>
                            <span>{item.unidades_compra} {item.unidade_venda}</span>
                          </div>
                          <div className="flex justify-between text-sm font-bold border-t pt-1 mt-1">
                            <span>Valor:</span>
                            <span className="text-primary">{formatCurrency(item.valor_total)}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Separator />

                  <Card className="p-4 bg-primary/5">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Valor Total do Orçamento</p>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(valorTotal)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(valorTotal / areaImpermeabilizar)}/m²
                      </p>
                    </div>
                  </Card>

                  <Button onClick={gerarProposta} className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Gerar Proposta
                  </Button>
                </>
              ) : (
                <Card className="p-4 text-center text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Configure os parâmetros e clique em calcular</p>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};