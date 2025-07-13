import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calculator, ArrowLeft, Shield, Package, AlertCircle, Layers } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

interface StepCalculoImpermeabilizacaoProps {
  dadosExtraidos?: any;
  onCalculoComplete: (calculo: any) => void;
  onBack: () => void;
  onNext: () => void;
}

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

export function StepCalculoImpermeabilizacao({ 
  dadosExtraidos, 
  onCalculoComplete, 
  onBack, 
  onNext 
}: StepCalculoImpermeabilizacaoProps) {
  const [produtos, setProdutos] = useState<ProdutoImpermeabilizacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Inputs do projeto
  const [tipoAplicacao, setTipoAplicacao] = useState('LAJE_DESCOBERTA');
  const [areaTotal, setAreaTotal] = useState(dadosExtraidos?.area || 100);
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

  async function carregarProdutos() {
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
  }

  function calcularAreaTotal() {
    const areaVertical = perimetro * alturaRodape;
    const total = areaTotal + areaVertical;
    setAreaImpermeabilizar(total);
  }

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

        const calculo = {
          areaTotal,
          perimetro,
          alturaRodape,
          areaImpermeabilizar,
          tipoAplicacao,
          comTela,
          comPrimer,
          quebraPercentual: quebra,
          itens: data,
          valorTotal: total,
          valorPorM2: total / areaImpermeabilizar,
          tipo: 'impermeabilizacao'
        };

        onCalculoComplete(calculo);
        onNext();
      }
    } catch (error) {
      console.error('Erro ao calcular orçamento:', error);
    } finally {
      setIsCalculating(false);
    }
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
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Shield className="w-6 h-6" />
          Cálculo de Impermeabilização
        </h2>
        <p className="text-muted-foreground">
          Configure os parâmetros para calcular o orçamento de impermeabilização
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Dados do Projeto */}
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

        {/* Coluna 2: Seleção de Produtos */}
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

        {/* Coluna 3: Resultado */}
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

                <Card className="p-4 bg-primary/5">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Valor Total do Orçamento</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(valorTotal)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(valorTotal / areaImpermeabilizar)}/m²
                    </p>
                  </div>
                </Card>
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

      {/* Dicas de Aplicação */}
      <Card className="p-4">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Layers className="w-5 h-5" />
          Sistema de Impermeabilização por Tipo de Aplicação
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">🏢 Laje Descoberta</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Impermeabilizante cimentício</li>
              <li>• Tela de reforço</li>
              <li>• 2-3 demãos cruzadas</li>
              <li>• Proteção mecânica</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">🏊 Piscina</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Impermeabilizante flexível</li>
              <li>• Tela em pontos críticos</li>
              <li>• Primer específico</li>
              <li>• Teste de estanqueidade</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">💧 Reservatório</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Produto atóxico</li>
              <li>• Reforço em cantos</li>
              <li>• Mínimo 3 demãos</li>
              <li>• Certificação potabilidade</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">🏗️ Fundação</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Impermeabilizante asfáltico</li>
              <li>• Primer base solvente</li>
              <li>• Proteção contra umidade</li>
              <li>• Aplicação antes do aterro</li>
            </ul>
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Button 
          onClick={onNext} 
          disabled={!valorTotal}
          variant="default"
        >
          Continuar
          <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
        </Button>
      </div>
    </div>
  );
}