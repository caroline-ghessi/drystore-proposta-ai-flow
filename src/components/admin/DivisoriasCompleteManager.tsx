import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calculator, Plus, Wrench, Info, TestTube } from 'lucide-react';

interface CalculoResultado {
  categoria: string;
  item_codigo: string;
  item_descricao: string;
  especificacao: string;
  quantidade_liquida: number;
  quebra_percentual: number;
  quantidade_com_quebra: number;
  quantidade_comercial: number;
  unidade_comercial: string;
  preco_unitario: number;
  valor_total: number;
  peso_total_kg: number;
  observacoes: string;
  ordem_categoria: number;
}

const TIPOS_PAREDE = [
  'Parede Simples ST 48mm',
  'Parede Simples ST 73mm', 
  'Parede Simples RU 73mm',
  'Parede Dupla ST 75mm',
  'Parede Dupla ST 98mm',
  'Parede RF 98mm',
  'Parede Acústica 120mm'
];

export const DivisoriasCompleteManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Parâmetros de entrada
  const [largura, setLargura] = useState<number>(6);
  const [altura, setAltura] = useState<number>(3);
  const [tipoParede, setTipoParede] = useState<string>('Parede Simples ST 73mm');
  const [incluirPortas, setIncluirPortas] = useState(false);
  const [quantidadePortas, setQuantidadePortas] = useState(1);
  const [incluirJanelas, setIncluirJanelas] = useState(false);
  const [quantidadeJanelas, setQuantidadeJanelas] = useState(1);
  const [larguraPorta, setLarguraPorta] = useState<number>(0.80);
  const [alturaPorta, setAlturaPorta] = useState<number>(2.10);
  const [larguraJanela, setLarguraJanela] = useState<number>(1.20);
  const [alturaJanela, setAlturaJanela] = useState<number>(1.20);
  const [espacamentoMontantes, setEspacamentoMontantes] = useState<number>(0.60);
  const [comIsolamento, setComIsolamento] = useState(true);
  const [espessuraIsolamento, setEspessuraIsolamento] = useState<number>(50);
  const [quebraCustomizada, setQuebraCustomizada] = useState<number | null>(null);
  
  // Resultados
  const [resultados, setResultados] = useState<CalculoResultado[]>([]);
  const [resumo, setResumo] = useState<any>(null);

  // Calcular automaticamente
  useEffect(() => {
    if (largura > 0 && altura > 0) {
      calcular();
    }
  }, [largura, altura, tipoParede, incluirPortas, quantidadePortas, incluirJanelas, quantidadeJanelas, espacamentoMontantes, comIsolamento]);

  const calcular = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('calcular_orcamento_drywall_completo', {
        p_largura: largura,
        p_altura: altura,
        p_tipo_parede: tipoParede,
        p_incluir_portas: incluirPortas,
        p_quantidade_portas: quantidadePortas,
        p_incluir_janelas: incluirJanelas,
        p_quantidade_janelas: quantidadeJanelas,
        p_largura_porta: larguraPorta,
        p_altura_porta: alturaPorta,
        p_largura_janela: larguraJanela,
        p_altura_janela: alturaJanela,
        p_espessura_isolamento: espessuraIsolamento,
        p_espacamento_montantes: espacamentoMontantes,
        p_com_isolamento: comIsolamento,
        p_quebra_customizada: quebraCustomizada
      });
      
      if (error) throw error;
      
      if (data) {
        setResultados(data);
        
        // Calcular resumo
        const totalValor = data.reduce((acc: number, item: any) => acc + item.valor_total, 0);
        const totalPeso = data.reduce((acc: number, item: any) => acc + item.peso_total_kg, 0);
        const areaLiquida = largura * altura - (incluirPortas ? quantidadePortas * larguraPorta * alturaPorta * 0.5 : 0) - (incluirJanelas ? quantidadeJanelas * larguraJanela * alturaJanela * 0.5 : 0);
        
        setResumo({
          valorTotal: totalValor,
          valorPorM2: totalValor / areaLiquida,
          pesoTotal: totalPeso,
          areaLiquida: areaLiquida,
          areaBruta: largura * altura
        });
      }
    } catch (error) {
      console.error('Erro ao calcular:', error);
      toast({
        title: "Erro no cálculo",
        description: "Não foi possível calcular o orçamento. Verifique os parâmetros.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testarExemplo = () => {
    // Exemplo do guia: 6m × 3m com porta e janela
    setLargura(6);
    setAltura(3);
    setIncluirPortas(true);
    setQuantidadePortas(1);
    setIncluirJanelas(true);
    setQuantidadeJanelas(1);
    setLarguraPorta(0.80);
    setAlturaPorta(2.10);
    setLarguraJanela(1.20);
    setAlturaJanela(1.20);
    setTipoParede('Parede Simples ST 73mm');
    setComIsolamento(true);
    
    toast({
      title: "Exemplo carregado",
      description: "Carregando exemplo do guia: 6m × 3m com porta e janela"
    });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCategoriaColor = (categoria: string): any => {
    switch (categoria) {
      case 'VEDAÇÃO': return 'default';
      case 'ESTRUTURA': return 'secondary';
      case 'FIXAÇÃO': return 'outline';
      case 'ACABAMENTO': return 'destructive';
      case 'ISOLAMENTO': return 'default';
      default: return 'secondary';
    }
  };

  const areaEsquadrias = (incluirPortas ? quantidadePortas * larguraPorta * alturaPorta : 0) + 
                        (incluirJanelas ? quantidadeJanelas * larguraJanela * alturaJanela : 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Sistema Completo de Cálculo de Divisórias Drywall
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Sistema baseado no guia completo de orçamentação de divisórias de drywall.
              Implementa todas as fórmulas do guia, incluindo desconto de 50% para esquadrias,
              perdas por material e quantidades comerciais.
            </AlertDescription>
          </Alert>

          <div className="flex gap-4 mb-6">
            <Button onClick={testarExemplo} variant="outline">
              <TestTube className="h-4 w-4 mr-2" />
              Carregar Exemplo do Guia
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Parâmetros Básicos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dimensões Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="largura">Largura (m)</Label>
                  <Input
                    id="largura"
                    type="number"
                    value={largura}
                    onChange={(e) => setLargura(parseFloat(e.target.value) || 0)}
                    step="0.01"
                    min="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="altura">Altura (m)</Label>
                  <Input
                    id="altura"
                    type="number"
                    value={altura}
                    onChange={(e) => setAltura(parseFloat(e.target.value) || 0)}
                    step="0.01"
                    min="0"
                  />
                </div>
                
                <div>
                  <Label>Área Bruta</Label>
                  <div className="text-sm bg-muted p-2 rounded">
                    {(largura * altura).toFixed(2)} m²
                  </div>
                </div>

                <div>
                  <Label htmlFor="tipo-parede">Tipo de Parede</Label>
                  <Select value={tipoParede} onValueChange={setTipoParede}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_PAREDE.map(tipo => (
                        <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="espacamento">Espaçamento Montantes (m)</Label>
                  <Select value={espacamentoMontantes.toString()} onValueChange={(value) => setEspacamentoMontantes(parseFloat(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.40">40cm (menor espaçamento)</SelectItem>
                      <SelectItem value="0.60">60cm (padrão)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Esquadrias */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Esquadrias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={incluirPortas}
                    onCheckedChange={setIncluirPortas}
                  />
                  <Label>Incluir Portas</Label>
                </div>
                
                {incluirPortas && (
                  <div className="space-y-2 pl-6">
                    <div>
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        value={quantidadePortas}
                        onChange={(e) => setQuantidadePortas(parseInt(e.target.value) || 0)}
                        min="1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Largura (m)</Label>
                        <Input
                          type="number"
                          value={larguraPorta}
                          onChange={(e) => setLarguraPorta(parseFloat(e.target.value) || 0)}
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label>Altura (m)</Label>
                        <Input
                          type="number"
                          value={alturaPorta}
                          onChange={(e) => setAlturaPorta(parseFloat(e.target.value) || 0)}
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={incluirJanelas}
                    onCheckedChange={setIncluirJanelas}
                  />
                  <Label>Incluir Janelas</Label>
                </div>
                
                {incluirJanelas && (
                  <div className="space-y-2 pl-6">
                    <div>
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        value={quantidadeJanelas}
                        onChange={(e) => setQuantidadeJanelas(parseInt(e.target.value) || 0)}
                        min="1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Largura (m)</Label>
                        <Input
                          type="number"
                          value={larguraJanela}
                          onChange={(e) => setLarguraJanela(parseFloat(e.target.value) || 0)}
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label>Altura (m)</Label>
                        <Input
                          type="number"
                          value={alturaJanela}
                          onChange={(e) => setAlturaJanela(parseFloat(e.target.value) || 0)}
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {areaEsquadrias > 0 && (
                  <div className="text-sm bg-muted p-2 rounded">
                    <div>Área esquadrias: {areaEsquadrias.toFixed(2)} m²</div>
                    <div>Desconto (50%): {(areaEsquadrias * 0.5).toFixed(2)} m²</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Opções Avançadas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Opções Avançadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={comIsolamento}
                    onCheckedChange={setComIsolamento}
                  />
                  <Label>Incluir Isolamento</Label>
                </div>
                
                {comIsolamento && (
                  <div>
                    <Label>Espessura Isolamento (mm)</Label>
                    <Select value={espessuraIsolamento.toString()} onValueChange={(value) => setEspessuraIsolamento(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25mm</SelectItem>
                        <SelectItem value="50">50mm</SelectItem>
                        <SelectItem value="75">75mm</SelectItem>
                        <SelectItem value="100">100mm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label>Quebra Customizada (%)</Label>
                  <Input
                    type="number"
                    value={quebraCustomizada || ''}
                    onChange={(e) => setQuebraCustomizada(e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Padrão: 15%"
                    step="0.1"
                  />
                </div>

                {resumo && (
                  <div className="space-y-2 pt-4">
                    <Separator />
                    <div className="text-sm space-y-1">
                      <div className="font-medium">Resumo:</div>
                      <div>Área líquida: {resumo.areaLiquida.toFixed(2)} m²</div>
                      <div>Peso total: {resumo.pesoTotal.toFixed(0)} kg</div>
                      <div>Valor/m²: {formatCurrency(resumo.valorPorM2)}</div>
                      <div className="font-bold text-primary">
                        Total: {formatCurrency(resumo.valorTotal)}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-6">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              Calculando conforme guia completo...
            </div>
          )}

          {/* Resultados Detalhados */}
          {resultados.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Lista de Materiais Detalhada</h3>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Especificação</TableHead>
                      <TableHead>Qtd. Líquida</TableHead>
                      <TableHead>Quebra %</TableHead>
                      <TableHead>Qtd. c/ Quebra</TableHead>
                      <TableHead>Qtd. Comercial</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Preço Unit.</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Peso (kg)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultados
                      .sort((a, b) => a.ordem_categoria - b.ordem_categoria)
                      .map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge variant={getCategoriaColor(item.categoria)}>
                            {item.categoria}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{item.item_codigo}</TableCell>
                        <TableCell className="font-medium">{item.item_descricao}</TableCell>
                        <TableCell className="text-xs">{item.especificacao}</TableCell>
                        <TableCell className="text-right">{item.quantidade_liquida.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{item.quebra_percentual.toFixed(1)}%</TableCell>
                        <TableCell className="text-right">{item.quantidade_com_quebra.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium">{item.quantidade_comercial}</TableCell>
                        <TableCell className="text-xs">{item.unidade_comercial}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.preco_unitario)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.valor_total)}</TableCell>
                        <TableCell className="text-right">{item.peso_total_kg.toFixed(1)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};