import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Calculator, 
  Package,
  Ruler,
  FileText,
  Lightbulb
} from 'lucide-react';

interface ItemCalculado {
  descricao: string;
  area: number;
  quantidade: number;
  unidade: string;
  preco_unitario: number;
  valor_total: number;
}

const TIPOS_FORRO = [
  {
    value: 'pvc_comum',
    label: 'PVC Comum 200mm',
    preco_m2: 28.50,
    descricao: 'Forro de PVC tradicional'
  },
  {
    value: 'pvc_decorativo',
    label: 'PVC Decorativo 200mm',
    preco_m2: 35.80,
    descricao: 'Forro PVC com textura'
  },
  {
    value: 'gesso_liso',
    label: 'Gesso Liso 12mm',
    preco_m2: 22.00,
    descricao: 'Placa de gesso lisa tradicional'
  },
  {
    value: 'gesso_decorativo',
    label: 'Gesso Decorativo 12mm',
    preco_m2: 32.50,
    descricao: 'Placa de gesso com textura'
  },
  {
    value: 'mineral_comum',
    label: 'Mineral Comum 625x625mm',
    preco_m2: 18.90,
    descricao: 'Placa mineral básica'
  },
  {
    value: 'mineral_premium',
    label: 'Mineral Premium 625x625mm',
    preco_m2: 26.70,
    descricao: 'Placa mineral com melhor acabamento'
  }
];

export const CalculadoraForros = () => {
  const { toast } = useToast();
  
  // Estados do formulário
  const [area, setArea] = useState(50);
  const [tipoForro, setTipoForro] = useState('pvc_comum');
  const [incluirEstrutura, setIncluirEstrutura] = useState(true);
  const [incluirMaoObra, setIncluirMaoObra] = useState(true);
  const [incluirAcessorios, setIncluirAcessorios] = useState(true);
  const [quebraPersonalizada, setQuebraPersonalizada] = useState(false);
  const [quebraPercentual, setQuebraPercentual] = useState(10);
  
  // Estados do resultado
  const [itensCalculados, setItensCalculados] = useState<ItemCalculado[]>([]);
  const [valorTotal, setValorTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const calcular = async () => {
    setLoading(true);
    
    try {
      const forroSelecionado = TIPOS_FORRO.find(f => f.value === tipoForro);
      if (!forroSelecionado) return;

      const quebra = quebraPersonalizada ? quebraPercentual : 10;
      const areaComQuebra = area * (1 + quebra / 100);
      
      const itens: ItemCalculado[] = [];

      // 1. Forro principal
      itens.push({
        descricao: forroSelecionado.label,
        area: areaComQuebra,
        quantidade: areaComQuebra,
        unidade: 'm²',
        preco_unitario: forroSelecionado.preco_m2,
        valor_total: areaComQuebra * forroSelecionado.preco_m2
      });

      // 2. Estrutura (se incluída)
      if (incluirEstrutura) {
        const custoEstrutura = tipoForro.includes('gesso') ? 12.50 : 8.90;
        itens.push({
          descricao: tipoForro.includes('gesso') ? 'Estrutura Metálica para Gesso' : 'Estrutura de Alumínio',
          area: area,
          quantidade: area,
          unidade: 'm²',
          preco_unitario: custoEstrutura,
          valor_total: area * custoEstrutura
        });
      }

      // 3. Acessórios (se incluídos)
      if (incluirAcessorios) {
        const custoAcessorios = area * 3.50; // R$ 3,50/m² em acessórios
        itens.push({
          descricao: 'Acessórios (tabicas, cantoneiras, parafusos)',
          area: area,
          quantidade: 1,
          unidade: 'lote',
          preco_unitario: custoAcessorios,
          valor_total: custoAcessorios
        });
      }

      // 4. Mão de obra (se incluída)
      if (incluirMaoObra) {
        const custoMaoObra = area * 15.00; // R$ 15,00/m² mão de obra
        itens.push({
          descricao: 'Mão de obra para instalação',
          area: area,
          quantidade: area,
          unidade: 'm²',
          preco_unitario: 15.00,
          valor_total: custoMaoObra
        });
      }

      setItensCalculados(itens);
      const total = itens.reduce((acc, item) => acc + item.valor_total, 0);
      setValorTotal(total);

      toast({
        title: "Cálculo Concluído",
        description: `Orçamento calculado: ${formatCurrency(total)}`,
      });
    } catch (error) {
      toast({
        title: "Erro no cálculo",
        description: "Não foi possível calcular o orçamento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const gerarProposta = () => {
    toast({
      title: "Proposta em desenvolvimento",
      description: "Funcionalidade de geração de proposta será implementada em breve."
    });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const forroSelecionado = TIPOS_FORRO.find(f => f.value === tipoForro);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Package className="w-6 h-6" />
          Calculadora de Forros
        </h2>
        <p className="text-muted-foreground">
          Orçamento completo para instalação de forros PVC, gesso e mineral
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna Esquerda: Formulário */}
        <div className="space-y-6">
          {/* Dimensões */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              Dimensões do Ambiente
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="area">Área Total (m²)</Label>
                <Input
                  id="area"
                  type="number"
                  value={area}
                  onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
                  step="0.01"
                  min="1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Área do teto onde será instalado o forro
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    Quebra personalizada
                  </Label>
                  <Switch
                    checked={quebraPersonalizada}
                    onCheckedChange={setQuebraPersonalizada}
                  />
                </div>
                
                {quebraPersonalizada ? (
                  <div>
                    <Label htmlFor="quebra">Quebra (%)</Label>
                    <Input
                      id="quebra"
                      type="number"
                      value={quebraPercentual}
                      onChange={(e) => setQuebraPercentual(parseFloat(e.target.value) || 0)}
                      step="0.1"
                      min="0"
                      max="50"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Usando quebra padrão: 10%</p>
                )}
              </div>
            </div>
          </Card>

          {/* Tipo de Forro */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Tipo de Forro
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label>Material do Forro</Label>
                <Select value={tipoForro} onValueChange={setTipoForro}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <optgroup label="PVC">
                      {TIPOS_FORRO.filter(f => f.value.includes('pvc')).map(forro => (
                        <SelectItem key={forro.value} value={forro.value}>
                          <div className="flex flex-col">
                            <span>{forro.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatCurrency(forro.preco_m2)}/m²
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </optgroup>
                    <optgroup label="Gesso">
                      {TIPOS_FORRO.filter(f => f.value.includes('gesso')).map(forro => (
                        <SelectItem key={forro.value} value={forro.value}>
                          <div className="flex flex-col">
                            <span>{forro.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatCurrency(forro.preco_m2)}/m²
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </optgroup>
                    <optgroup label="Mineral">
                      {TIPOS_FORRO.filter(f => f.value.includes('mineral')).map(forro => (
                        <SelectItem key={forro.value} value={forro.value}>
                          <div className="flex flex-col">
                            <span>{forro.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatCurrency(forro.preco_m2)}/m²
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </optgroup>
                  </SelectContent>
                </Select>
              </div>

              {forroSelecionado && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">{forroSelecionado.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {forroSelecionado.descricao}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Preço: {formatCurrency(forroSelecionado.preco_m2)}/m²
                  </p>
                </div>
              )}

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    Incluir estrutura de fixação
                  </Label>
                  <Switch
                    checked={incluirEstrutura}
                    onCheckedChange={setIncluirEstrutura}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    Incluir acessórios
                  </Label>
                  <Switch
                    checked={incluirAcessorios}
                    onCheckedChange={setIncluirAcessorios}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    Incluir mão de obra
                  </Label>
                  <Switch
                    checked={incluirMaoObra}
                    onCheckedChange={setIncluirMaoObra}
                  />
                </div>
              </div>

              <Button 
                onClick={calcular}
                disabled={loading || area <= 0}
                className="w-full"
              >
                <Calculator className="w-4 h-4 mr-2" />
                {loading ? 'Calculando...' : 'Calcular Orçamento'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Coluna Direita: Resultados */}
        <div>
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Resultado do Orçamento
            </h3>
            
            {itensCalculados.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  {itensCalculados.map((item, index) => (
                    <div key={index} className="flex justify-between items-start p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.descricao}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantidade.toFixed(2)} {item.unidade} × {formatCurrency(item.preco_unitario)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(item.valor_total)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Valor Total:</span>
                    <span className="text-primary">{formatCurrency(valorTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Valor por m²:</span>
                    <span>{formatCurrency(valorTotal / area)}</span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Dica de Instalação
                    </span>
                  </div>
                  <p className="text-xs text-blue-700">
                    {tipoForro.includes('pvc') && 'Forros PVC são ideais para áreas úmidas como banheiros e cozinhas.'}
                    {tipoForro.includes('gesso') && 'Forros de gesso oferecem excelente acabamento e permitem embutir iluminação.'}
                    {tipoForro.includes('mineral') && 'Forros minerais são práticos para escritórios com fácil acesso às instalações.'}
                  </p>
                </div>

                <Button onClick={gerarProposta} className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Gerar Proposta
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Preencha os dados e clique em calcular</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};