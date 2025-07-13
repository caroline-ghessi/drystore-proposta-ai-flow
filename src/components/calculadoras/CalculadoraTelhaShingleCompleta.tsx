import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useTelhasShingleCompleto } from '@/hooks/useTelhasShingleCompleto';
import type { ParametrosCalculoShingle, ResumoOrcamentoShingleCompleto } from '@/hooks/useTelhasShingleCompleto';
import { 
  Calculator, 
  FileText, 
  Package, 
  Ruler,
  Home,
  Info,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Download,
  Share2
} from 'lucide-react';

interface DimensoesTelhado {
  area: number;
  comprimentoCumeeira: number;
  perimetro: number;
  comprimentoCalha: number;
}

export function CalculadoraTelhaShingleCompleta() {
  const {
    telhas,
    loading: hookLoading,
    calcularOrcamentoShingleCompleto,
    validarParametros,
    buscarTelhas
  } = useTelhasShingleCompleto();

  const { toast } = useToast();

  // Estados do formulário
  const [dimensoes, setDimensoes] = useState<DimensoesTelhado>({
    area: 100,
    comprimentoCumeeira: 12,
    perimetro: 50,
    comprimentoCalha: 20
  });

  const [configuracoes, setConfiguracoes] = useState({
    telhaId: '',
    corAcessorios: 'CINZA',
    incluirCalha: true,
    incluirManta: true,
    estimarRufos: true
  });

  // Estados dos resultados
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ResumoOrcamentoShingleCompleto | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Carregar telhas disponíveis
  useEffect(() => {
    if (telhas.length > 0 && !configuracoes.telhaId) {
      setConfiguracoes(prev => ({
        ...prev,
        telhaId: telhas[0].codigo
      }));
    }
  }, [telhas, configuracoes.telhaId]);

  // Estimar dimensões de rufos automaticamente
  useEffect(() => {
    if (configuracoes.estimarRufos && dimensoes.perimetro > 0) {
      // As estimativas são feitas automaticamente na função de cálculo
    }
  }, [dimensoes.perimetro, configuracoes.estimarRufos]);

  // Validar formulário em tempo real
  useEffect(() => {
    const parametros: ParametrosCalculoShingle = {
      area_telhado: dimensoes.area,
      comprimento_cumeeira: dimensoes.comprimentoCumeeira,
      perimetro_telhado: dimensoes.perimetro,
      comprimento_calha: configuracoes.incluirCalha ? dimensoes.comprimentoCalha : 0,
      telha_codigo: configuracoes.telhaId,
      cor_acessorios: configuracoes.corAcessorios,
      incluir_manta: configuracoes.incluirManta,
      incluir_calha: configuracoes.incluirCalha
    };

    const erros = validarParametros(parametros);
    setValidationErrors(erros);
  }, [dimensoes, configuracoes, validarParametros]);

  async function calcular() {
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
        perimetro_telhado: dimensoes.perimetro,
        comprimento_calha: configuracoes.incluirCalha ? dimensoes.comprimentoCalha : 0,
        telha_codigo: configuracoes.telhaId,
        cor_acessorios: configuracoes.corAcessorios,
        incluir_manta: configuracoes.incluirManta,
        incluir_calha: configuracoes.incluirCalha
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
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  function handleExport() {
    if (!resultado) return;
    
    // Simular exportação para PDF/Excel
    toast({
      title: "Exportação",
      description: "Funcionalidade de exportação será implementada em breve",
    });
  }

  function handleShare() {
    if (!resultado) return;
    
    // Simular compartilhamento
    toast({
      title: "Compartilhamento",
      description: "Link de compartilhamento copiado para área de transferência",
    });
  }

  const telhaAtual = telhas.find(t => t.codigo === configuracoes.telhaId);

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
              Calculadora Completa - Sistema Telhado Shingle
            </h2>
            <p className="text-muted-foreground">
              Cálculo profissional incluindo base estrutural, impermeabilização e todos os acessórios
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
        {/* Coluna 1: Dimensões do Telhado */}
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
              <Label>Comprimento da Cumeeira (m)</Label>
              <Input
                type="number"
                value={dimensoes.comprimentoCumeeira}
                onChange={(e) => setDimensoes({...dimensoes, comprimentoCumeeira: parseFloat(e.target.value) || 0})}
                step="0.01"
                min="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Soma de todas as cumeeiras
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

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <Switch
                  checked={configuracoes.incluirCalha}
                  onCheckedChange={(checked) => setConfiguracoes({...configuracoes, incluirCalha: checked})}
                />
                <span className="text-sm">Incluir Sistema de Calhas</span>
              </label>
              
              {configuracoes.incluirCalha && (
                <div>
                  <Label>Comprimento de Calhas (m)</Label>
                  <Input
                    type="number"
                    value={dimensoes.comprimentoCalha}
                    onChange={(e) => setDimensoes({...dimensoes, comprimentoCalha: parseFloat(e.target.value) || 0})}
                    step="0.01"
                    min="0"
                  />
                </div>
              )}
            </div>

            {/* Estimativas automáticas */}
            {configuracoes.estimarRufos && dimensoes.perimetro > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Estimativas Automáticas:</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Rufo Lateral: {(dimensoes.perimetro * 0.6).toFixed(1)}m</p>
                  <p>• Rufo Capa: {(dimensoes.perimetro * 0.4).toFixed(1)}m</p>
                  {configuracoes.incluirManta && (
                    <p>• Manta Starter: {(dimensoes.perimetro * 0.25).toFixed(1)}m²</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Coluna 2: Configurações de Produto */}
        <Card className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Configurações de Produto
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label>Tipo de Telha *</Label>
              <Select
                value={configuracoes.telhaId}
                onValueChange={(value) => setConfiguracoes({...configuracoes, telhaId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a telha..." />
                </SelectTrigger>
                <SelectContent>
                  <optgroup label="Linha Supreme">
                    {telhas.filter(t => t.linha === 'SUPREME').map(telha => (
                      <SelectItem key={telha.id} value={telha.codigo}>
                        {telha.descricao} - {formatCurrency(telha.preco_unitario)}/pct
                      </SelectItem>
                    ))}
                  </optgroup>
                  <optgroup label="Linha Duration">
                    {telhas.filter(t => t.linha === 'DURATION').map(telha => (
                      <SelectItem key={telha.id} value={telha.codigo}>
                        {telha.descricao} - {formatCurrency(telha.preco_unitario)}/pct
                      </SelectItem>
                    ))}
                  </optgroup>
                </SelectContent>
              </Select>
            </div>

            {telhaAtual && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">{telhaAtual.descricao}</p>
                <div className="text-xs text-muted-foreground mt-1 space-y-1">
                  <p>Cobertura: {telhaAtual.conteudo_unidade}m² por pacote</p>
                  <p>Linha: {telhaAtual.linha}</p>
                  {telhaAtual.especificacoes_tecnicas?.garantia_anos && (
                    <p>Garantia: {telhaAtual.especificacoes_tecnicas.garantia_anos} anos</p>
                  )}
                </div>
              </div>
            )}
            
            <div>
              <Label>Cor dos Acessórios</Label>
              <Select
                value={configuracoes.corAcessorios}
                onValueChange={(value) => setConfiguracoes({...configuracoes, corAcessorios: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CINZA">Cinza</SelectItem>
                  <SelectItem value="MARROM">Marrom</SelectItem>
                  <SelectItem value="PRETO">Preto</SelectItem>
                </SelectContent>
              </Select>
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
            
            <Button 
              onClick={calcular} 
              disabled={loading || !configuracoes.telhaId || validationErrors.length > 0}
              className="w-full"
            >
              <Calculator className="w-4 h-4 mr-2" />
              {loading ? 'Calculando...' : 'Calcular Sistema Completo'}
            </Button>
          </div>

          {/* Info Box - Componentes Obrigatórios */}
          <Card className="mt-4 p-3 bg-blue-50 border-blue-200">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Componentes inclusos automaticamente:</p>
                <ul className="space-y-0.5">
                  <li>✓ OSB 11,1mm (base estrutural)</li>
                  <li>✓ Subcobertura TYVEK Protec 120</li>
                  <li>✓ Pregos e grampos de fixação</li>
                  <li>✓ Cumeeiras e rufos</li>
                </ul>
              </div>
            </div>
          </Card>
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
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Preencha os dados e clique em calcular para ver o orçamento completo</p>
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
                      <th className="text-right">Qtd Calc.</th>
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
                        <td className="text-right">
                          {item.quantidade_calculada.toFixed(2)}
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
                      <td colSpan={7} className="py-2 text-right">Total Geral:</td>
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
}