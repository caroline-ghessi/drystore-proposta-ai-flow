import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Calculator, Building, Palette, Shield, Package, AlertCircle } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useProdutos, TelhaShingle } from '@/hooks/useProdutos';
import { useToast } from '@/hooks/use-toast';

interface DadosTelhas {
  area_total_m2: number;
  inclinacao_telhado: number;
  tipo_estrutura: string;
  regiao_climatica: string;
  cor_preferida: string;
  telha_id?: string;
  quebra_personalizada?: number;
  observacoes_especiais?: string;
}

interface CalculoTelhas {
  telha: TelhaShingle;
  calculo: {
    area_original: number;
    area_corrigida: number;
    inclinacao_percentual: number;
    quebra_percentual: number;
    fator_correcao: number;
    quantidade_pacotes_calculada: number;
    quantidade_pacotes_arredondada: number;
    valor_total: number;
    valor_por_m2: number;
  };
  economias: {
    peso_total_kg: number;
    peso_vs_ceramica: number;
    economia_estrutural: string;
  };
}

interface StepCalculoTelhasProps {
  dadosExtraidos: DadosTelhas;
  onCalculoComplete: (calculo: CalculoTelhas) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepCalculoTelhas({
  dadosExtraidos,
  onCalculoComplete,
  onBack,
  onNext
}: StepCalculoTelhasProps) {
  const [dadosAjustados, setDadosAjustados] = useState<DadosTelhas>(dadosExtraidos);
  const [calculo, setCalculo] = useState<CalculoTelhas | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    especificacoes: true,
    produtos: false,
    economias: false,
    financeiro: false
  });

  const { canViewMargins } = useUserRole();
  const { telhasShingle, buscarTelhasShingle, calcularOrcamentoShingle, loading } = useProdutos();
  const { toast } = useToast();

  useEffect(() => {
    buscarTelhasShingle();
  }, []);

  useEffect(() => {
    if (dadosAjustados.telha_id && dadosAjustados.area_total_m2 > 0) {
      calcularTelhas();
    }
  }, [dadosAjustados]);

  const calcularTelhas = async () => {
    if (!dadosAjustados.telha_id || dadosAjustados.area_total_m2 <= 0) return;
    
    setIsCalculating(true);
    
    try {
      const resultado = await calcularOrcamentoShingle(
        dadosAjustados.area_total_m2,
        dadosAjustados.telha_id,
        dadosAjustados.quebra_personalizada,
        dadosAjustados.inclinacao_telhado
      );

      setCalculo(resultado as unknown as CalculoTelhas);
      onCalculoComplete(resultado as unknown as CalculoTelhas);
      
    } catch (error) {
      toast({
        title: "Erro no cálculo",
        description: "Não foi possível calcular o orçamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleInputChange = (field: keyof DadosTelhas, value: any) => {
    // Validar inclinação mínima para telhas shingle
    if (field === 'inclinacao_telhado' && value > 0 && value < 18) {
      toast({
        title: "Inclinação inválida",
        description: "Telhas shingle exigem inclinação mínima de 18%",
        variant: "destructive"
      });
      return;
    }
    
    setDadosAjustados(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const telhasPorLinha = (linha: 'SUPREME' | 'DURATION') => 
    telhasShingle.filter(t => t.linha === linha);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Cálculo de Telhas Shingle</h2>
        <p className="text-muted-foreground">Configure os parâmetros e visualize o orçamento detalhado</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Parâmetros de Entrada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Parâmetros do Projeto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="area">Área Total (m²)</Label>
                <Input
                  id="area"
                  type="number"
                  step="0.01"
                  value={dadosAjustados.area_total_m2}
                  onChange={(e) => handleInputChange('area_total_m2', Number(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="inclinacao">Inclinação (%) *</Label>
                <Input
                  id="inclinacao"
                  type="number"
                  step="1"
                  min="18"
                  max="85"
                  value={dadosAjustados.inclinacao_telhado}
                  onChange={(e) => handleInputChange('inclinacao_telhado', Number(e.target.value))}
                  className={dadosAjustados.inclinacao_telhado > 0 && dadosAjustados.inclinacao_telhado < 18 ? 'border-red-500' : ''}
                />
                <p className="text-xs text-muted-foreground">
                  Mínimo: 18% | Máximo: 85%
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="telha_linha">Linha do Produto</Label>
                <Select
                  value={telhasShingle.find(t => t.id === dadosAjustados.telha_id)?.linha || ''}
                  onValueChange={(linha) => {
                    const primeiraTelha = telhasPorLinha(linha as 'SUPREME' | 'DURATION')[0];
                    if (primeiraTelha) {
                      handleInputChange('telha_id', primeiraTelha.id);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a linha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPREME">
                      <div className="flex flex-col">
                        <span>Linha Supreme</span>
                        <span className="text-xs text-muted-foreground">Custo-benefício ideal</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="DURATION">
                      <div className="flex flex-col">
                        <span>Linha Duration</span>
                        <span className="text-xs text-muted-foreground">Premium - maior resistência</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="telha_especifica">Telha Específica</Label>
                <Select
                  value={dadosAjustados.telha_id || ''}
                  onValueChange={(value) => handleInputChange('telha_id', value)}
                  disabled={!telhasShingle.length}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a telha" />
                  </SelectTrigger>
                  <SelectContent>
                    {telhasShingle.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Linha Supreme</div>
                        {telhasPorLinha('SUPREME').map(telha => (
                          <SelectItem key={telha.id} value={telha.id}>
                            <div className="flex justify-between items-center w-full">
                              <span>{telha.cor}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                R$ {telha.preco_unitario.toFixed(2)}/pct
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                        
                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground mt-2">Linha Duration</div>
                        {telhasPorLinha('DURATION').map(telha => (
                          <SelectItem key={telha.id} value={telha.id}>
                            <div className="flex justify-between items-center w-full">
                              <span>{telha.cor}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                R$ {telha.preco_unitario.toFixed(2)}/pct
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quebra">Quebra Personalizada (%)</Label>
                <Input
                  id="quebra"
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  placeholder="Padrão: 5%"
                  value={dadosAjustados.quebra_personalizada || ''}
                  onChange={(e) => handleInputChange('quebra_personalizada', 
                    e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultado dos Cálculos */}
        {calculo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Resultado do Cálculo
                {isCalculating && <Badge variant="secondary">Calculando...</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Especificações do Produto */}
              <Collapsible
                open={expandedSections.produtos}
                onOpenChange={() => toggleSection('produtos')}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                    <span className="font-semibold flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Produto Selecionado
                    </span>
                    {expandedSections.produtos ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Produto:</span>
                      <span className="font-medium">{calculo.telha.descricao}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Linha:</span>
                      <span className="font-medium">{calculo.telha.linha}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cor:</span>
                      <span className="font-medium">{calculo.telha.cor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cobertura/pacote:</span>
                      <span className="font-medium">{calculo.telha.qtd_unidade_venda} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Garantia:</span>
                      <span className="font-medium">{calculo.telha.garantia_anos} anos</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Resistência vento:</span>
                      <span className="font-medium">{calculo.telha.resistencia_vento_kmh} km/h</span>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Separator />

              {/* Especificações Técnicas */}
              <Collapsible
                open={expandedSections.especificacoes}
                onOpenChange={() => toggleSection('especificacoes')}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                    <span className="font-semibold flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Cálculos Técnicos
                    </span>
                    {expandedSections.especificacoes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Área Original:</span>
                      <span className="font-medium">{calculo.calculo.area_original} m²</span>
                    </div>
                    {calculo.calculo.area_corrigida !== calculo.calculo.area_original && (
                      <div className="flex justify-between">
                        <span>Área Corrigida (inclinação):</span>
                        <span className="font-medium">{calculo.calculo.area_corrigida} m²</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Fator Multiplicador:</span>
                      <span className="font-medium">{calculo.telha.fator_multiplicador.toFixed(4)} pct/m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quebra Aplicada:</span>
                      <span className="font-medium">{calculo.calculo.quebra_percentual}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fator com Quebra:</span>
                      <span className="font-medium">{calculo.calculo.fator_correcao.toFixed(4)} pct/m²</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span>Pacotes Calculados:</span>
                      <span className="font-medium">{calculo.calculo.quantidade_pacotes_calculada} pacotes</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Pacotes a Comprar:</span>
                      <span className="text-primary">{calculo.calculo.quantidade_pacotes_arredondada} pacotes</span>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Separator />

              {/* Vantagens e Economias */}
              <Collapsible
                open={expandedSections.economias}
                onOpenChange={() => toggleSection('economias')}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                    <span className="font-semibold flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Vantagens do Shingle
                    </span>
                    {expandedSections.economias ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Peso Total Shingle:</span>
                      <span className="font-medium">{calculo.economias.peso_total_kg} kg</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Economia vs Cerâmica:</span>
                      <span className="font-medium">-{calculo.economias.peso_vs_ceramica} kg</span>
                    </div>
                    <div className="p-2 bg-green-50 rounded text-xs text-green-800">
                      <AlertCircle className="h-3 w-3 inline mr-1" />
                      {calculo.economias.economia_estrutural}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Separator />

              {/* Resumo Financeiro */}
              {canViewMargins() && (
                <Collapsible
                  open={expandedSections.financeiro}
                  onOpenChange={() => toggleSection('financeiro')}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                      <span className="font-semibold">Detalhes Financeiros (Admin)</span>
                      {expandedSections.financeiro ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 mt-2">
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Preço Unitário:</span>
                        <span className="font-medium">R$ {calculo.telha.preco_unitario.toFixed(2)}/pct</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Custo Base (sem margem):</span>
                        <span className="font-medium">
                          R$ {(calculo.calculo.quantidade_pacotes_arredondada * calculo.telha.preco_unitario).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Valor Final */}
              <div className="bg-primary/5 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Valor Total:</span>
                    <span className="text-primary">R$ {calculo.calculo.valor_total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Valor por m²:</span>
                    <span>R$ {calculo.calculo.valor_por_m2.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Botões de navegação */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button onClick={onNext} disabled={!calculo || isCalculating || loading}>
          Continuar
        </Button>
      </div>
    </div>
  );
}