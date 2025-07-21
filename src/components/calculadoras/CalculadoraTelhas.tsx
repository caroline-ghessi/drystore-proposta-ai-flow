
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useTelhasShingleCompleto } from '@/hooks/useTelhasShingleCompleto';
import { SistemaShingleSelector } from '@/components/wizard/SistemaShingleSelector';
import type { ParametrosCalculoShingle, ResumoOrcamentoShingleCompleto } from '@/hooks/useTelhasShingleCompleto';
import { 
  Calculator, 
  Home,
  Ruler,
  Package,
  FileText,
  CheckCircle,
  AlertTriangle,
  Info,
  DollarSign,
  Download,
  Share2
} from 'lucide-react';

interface DimensoesTelhado {
  area: number;
  comprimentoCumeeira: number;
  comprimentoEspigao: number;
  comprimentoAguaFurtada: number;
  perimetro: number;
}

export const CalculadoraTelhas = () => {
  const { toast } = useToast();
  const {
    sistemasDisponiveis,
    loading: hookLoading,
    calcularOrcamentoShingleCompleto,
    validarParametros
  } = useTelhasShingleCompleto();

  // Estados do formulário
  const [dimensoes, setDimensoes] = useState<DimensoesTelhado>({
    area: 100,
    comprimentoCumeeira: 12,
    comprimentoEspigao: 0,
    comprimentoAguaFurtada: 0,
    perimetro: 50
  });

  const [configuracoes, setConfiguracoes] = useState({
    sistemaId: '',
    corAcessorios: 'CINZA',
    incluirManta: true
  });

  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ResumoOrcamentoShingleCompleto | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Definir sistema padrão (Supreme)
  useEffect(() => {
    if (sistemasDisponiveis.length > 0 && !configuracoes.sistemaId) {
      const supremeSystem = sistemasDisponiveis.find(s => s.codigo === '1.16');
      if (supremeSystem) {
        setConfiguracoes(prev => ({
          ...prev,
          sistemaId: supremeSystem.codigo
        }));
      }
    }
  }, [sistemasDisponiveis, configuracoes.sistemaId]);

  // Validar formulário em tempo real
  useEffect(() => {
    if (!configuracoes.sistemaId) return;
    
    const parametros: ParametrosCalculoShingle = {
      area_telhado: dimensoes.area,
      comprimento_cumeeira: dimensoes.comprimentoCumeeira,
      comprimento_espigao: dimensoes.comprimentoEspigao,
      comprimento_agua_furtada: dimensoes.comprimentoAguaFurtada,
      perimetro_telhado: dimensoes.perimetro,
      telha_codigo: configuracoes.sistemaId,
      cor_acessorios: configuracoes.corAcessorios,
      incluir_manta: configuracoes.incluirManta
    };

    const erros = validarParametros(parametros);
    setValidationErrors(erros);
  }, [dimensoes, configuracoes, validarParametros]);

  const calcular = async () => {
    if (validationErrors.length > 0) {
      toast({
        title: "Erro de Validação",
        description: validationErrors.join(', '),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const parametros: ParametrosCalculoShingle = {
        area_telhado: dimensoes.area,
        comprimento_cumeeira: dimensoes.comprimentoCumeeira,
        comprimento_espigao: dimensoes.comprimentoEspigao,
        comprimento_agua_furtada: dimensoes.comprimentoAguaFurtada,
        perimetro_telhado: dimensoes.perimetro,
        telha_codigo: configuracoes.sistemaId,
        cor_acessorios: configuracoes.corAcessorios,
        incluir_manta: configuracoes.incluirManta
      };

      const resultadoCalculo = await calcularOrcamentoShingleCompleto(parametros);
      
      if (resultadoCalculo) {
        setResultado(resultadoCalculo);
        toast({
          title: "Cálculo Concluído",
          description: `Orçamento calculado: ${formatCurrency(resultadoCalculo.valor_total_geral)}`,
        });
      }
    } catch (error) {
      console.error('Erro ao calcular:', error);
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

  const handleExport = () => {
    if (!resultado) return;
    
    toast({
      title: "Exportação",
      description: "Funcionalidade de exportação será implementada em breve",
    });
  };

  const handleShare = () => {
    if (!resultado) return;
    
    toast({
      title: "Compartilhamento",
      description: "Link de compartilhamento copiado para área de transferência",
    });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (hookLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">Carregando calculadora...</div>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Home className="w-6 h-6" />
              Calculadora Telhas Shingle
            </h2>
            <p className="text-muted-foreground">
              Sistema completo incluindo base estrutural, impermeabilização e acessórios
            </p>
          </div>
          
          {validationErrors.length > 0 && (
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">Verifique os dados inseridos</span>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Seleção do Sistema */}
        <Card className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Sistema Shingle
          </h3>
          
          <SistemaShingleSelector
            sistemas={sistemasDisponiveis}
            sistemaSelecionado={configuracoes.sistemaId}
            onSelecionarSistema={(codigo) => setConfiguracoes({...configuracoes, sistemaId: codigo})}
            loading={loading}
          />

          <div className="mt-6 space-y-4">
            <div>
              <Label>Cor dos Acessórios</Label>
              <select
                value={configuracoes.corAcessorios}
                onChange={(e) => setConfiguracoes({...configuracoes, corAcessorios: e.target.value})}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="CINZA">Cinza</option>
                <option value="MARROM">Marrom</option>
                <option value="PRETO">Preto</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <Switch
                  checked={configuracoes.incluirManta}
                  onCheckedChange={(checked) => setConfiguracoes({...configuracoes, incluirManta: checked})}
                />
                <span className="text-sm">Incluir Manta Starter</span>
              </label>
              <p className="text-xs text-muted-foreground">
                Manta asfáltica para impermeabilização do perímetro
              </p>
            </div>
          </div>
        </Card>

        {/* Coluna 2: Dimensões do Telhado */}
        <Card className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Ruler className="w-4 h-4" />
            Dimensões do Telhado
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label>Área Total (m²) *</Label>
              <Input
                type="number"
                value={dimensoes.area}
                onChange={(e) => setDimensoes({...dimensoes, area: parseFloat(e.target.value) || 0})}
                step="0.01"
                min="1"
                className={validationErrors.some(e => e.includes('Área')) ? 'border-destructive' : ''}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Área de cobertura do telhado
              </p>
            </div>
            
            <div>
              <Label>Perímetro do Telhado (m)</Label>
              <Input
                type="number"
                value={dimensoes.perimetro}
                onChange={(e) => setDimensoes({...dimensoes, perimetro: parseFloat(e.target.value) || 0})}
                step="0.01"
                min="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Para cálculo de rufos e manta starter
              </p>
            </div>

            <Separator />

            <div>
              <Label>Comprimento da Cumeeira (m)</Label>
              <Input
                type="number"
                value={dimensoes.comprimentoCumeeira}
                onChange={(e) => setDimensoes({...dimensoes, comprimentoCumeeira: parseFloat(e.target.value) || 0})}
                step="0.01"
                min="0"
              />
            </div>
            
            <div>
              <Label>Comprimento do Espigão (m)</Label>
              <Input
                type="number"
                value={dimensoes.comprimentoEspigao}
                onChange={(e) => setDimensoes({...dimensoes, comprimentoEspigao: parseFloat(e.target.value) || 0})}
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <Label>Comprimento de Água Furtada (m)</Label>
              <Input
                type="number"
                value={dimensoes.comprimentoAguaFurtada}
                onChange={(e) => setDimensoes({...dimensoes, comprimentoAguaFurtada: parseFloat(e.target.value) || 0})}
                step="0.01"
                min="0"
              />
            </div>

            <Button 
              onClick={calcular} 
              disabled={loading || !configuracoes.sistemaId || validationErrors.length > 0}
              className="w-full"
            >
              <Calculator className="w-4 h-4 mr-2" />
              {loading ? 'Calculando...' : 'Calcular Sistema Completo'}
            </Button>
          </div>
        </Card>

        {/* Coluna 3: Resultados */}
        <Card className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Resultado do Orçamento
          </h3>
          
          {resultado ? (
            <div className="space-y-4">
              {/* Resumo Financeiro */}
              <div className="space-y-2">
                {Object.entries(resultado.resumo_por_categoria).map(([categoria, resumo]) => (
                  <div key={categoria} className="flex justify-between text-sm">
                    <span>{categoria}:</span>
                    <span>{formatCurrency(resumo.valor_total)}</span>
                  </div>
                ))}
                
                <div className="border-t pt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Valor por m²:</span>
                    <span className="font-bold">
                      {formatCurrency(resultado.valor_por_m2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total Geral:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(resultado.valor_total_geral)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Benefícios */}
              {resultado.economia_peso_vs_ceramica && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Economia de Peso
                    </span>
                  </div>
                  <p className="text-xs text-green-700">
                    {resultado.economia_peso_vs_ceramica.toFixed(0)}kg mais leve que telha cerâmica
                  </p>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              </div>

              <Button onClick={gerarProposta} className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Gerar Proposta
              </Button>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Selecione um sistema e preencha os dados para calcular</p>
            </div>
          )}
        </Card>
      </div>

      {/* Tabela Detalhada dos Resultados */}
      {resultado && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Detalhamento Completo do Sistema</h3>
            <div className="flex gap-2">
              <Badge variant="outline">
                {resultado.itens.length} itens
              </Badge>
              <Badge variant="outline">
                {resultado.area_telhado}m²
              </Badge>
            </div>
          </div>
          
          <Tabs defaultValue="por-categoria" className="space-y-4">
            <TabsList>
              <TabsTrigger value="por-categoria">Por Categoria</TabsTrigger>
              <TabsTrigger value="detalhado">Detalhado</TabsTrigger>
              <TabsTrigger value="observacoes">Observações Técnicas</TabsTrigger>
            </TabsList>

            <TabsContent value="por-categoria">
              <div className="space-y-4">
                {Object.entries(resultado.resumo_por_categoria).map(([categoria, resumo]) => {
                  const itensCategoria = resultado.itens.filter(item => item.categoria === categoria);
                  return (
                    <Card key={categoria} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{categoria}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{resumo.quantidade_itens} itens</Badge>
                          <Badge variant="outline">{formatCurrency(resumo.valor_total)}</Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {itensCategoria.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div>
                              <span className="font-medium">{item.descricao}</span>
                              <span className="text-muted-foreground ml-2">
                                {item.quantidade_final} {item.unidade_venda}
                              </span>
                            </div>
                            <span>{formatCurrency(item.valor_total)}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="detalhado">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Item</th>
                      <th className="text-right">Dimensão</th>
                      <th className="text-right">Fator</th>
                      <th className="text-right">Quebra</th>
                      <th className="text-right">Qtd Final</th>
                      <th className="text-right">Preço Unit.</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.itens.map((item, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="py-2">
                          <div>
                            <p className="font-medium">{item.descricao}</p>
                            <p className="text-xs text-muted-foreground">{item.categoria}</p>
                          </div>
                        </td>
                        <td className="text-right">
                          {item.dimensao_base.toFixed(2)} {item.unidade_dimensao}
                        </td>
                        <td className="text-right">
                          {item.fator_conversao.toFixed(3)}
                        </td>
                        <td className="text-right">
                          {item.quebra_percentual}%
                        </td>
                        <td className="text-right font-medium">
                          {item.quantidade_final} {item.unidade_venda}
                        </td>
                        <td className="text-right">
                          {formatCurrency(item.preco_unitario)}
                        </td>
                        <td className="text-right font-medium">
                          {formatCurrency(item.valor_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t font-bold">
                      <td colSpan={6} className="py-2 text-right">Total Geral:</td>
                      <td className="text-right">{formatCurrency(resultado.valor_total_geral)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="observacoes">
              <div className="space-y-3">
                {resultado.observacoes_tecnicas.map((observacao, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{observacao}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
};
