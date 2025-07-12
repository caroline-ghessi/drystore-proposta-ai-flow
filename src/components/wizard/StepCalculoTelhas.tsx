import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Calculator, Building, Palette, Shield } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

interface DadosTelhas {
  area_total_m2: number;
  inclinacao_telhado: string;
  tipo_estrutura: string;
  regiao_climatica: string;
  cor_preferida: string;
  acabamento_desejado: string;
  necessita_isolamento: boolean;
  necessita_manta: boolean;
  observacoes_especiais: string;
}

interface CalculoTelhas {
  especificacoes_tecnicas: {
    area_cobertura: number;
    quantidade_telhas: number;
    quantidade_rufo_m: number;
    quantidade_cumeeira_m: number;
    quantidade_pregos_kg: number;
    area_manta_m2: number;
    inclinacao: string;
    tipo_estrutura: string;
    cor_especificada: string;
    nivel_acabamento: string;
  };
  orcamento: {
    materiais: {
      telhas: number;
      rufo: number;
      cumeeira: number;
      pregos: number;
      manta: number;
      subtotal: number;
    };
    instalacao: number;
    subtotal_geral: number;
    margem_percentual: number;
    valor_margem: number;
    valor_total: number;
    valor_m2: number;
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
    materiais: false,
    financeiro: false
  });

  const { canViewMargins } = useUserRole();

  useEffect(() => {
    calcularTelhas();
  }, [dadosAjustados]);

  const calcularTelhas = async () => {
    setIsCalculating(true);
    
    // Simular cálculo (depois será função Supabase)
    const area = dadosAjustados.area_total_m2;
    const telhasPorM2 = 3.2;
    const quantidadeTelhas = Math.ceil(area * telhasPorM2);
    
    const especificacoes = {
      area_cobertura: area,
      quantidade_telhas: quantidadeTelhas,
      quantidade_rufo_m: Math.ceil(area * 0.1),
      quantidade_cumeeira_m: Math.ceil(area * 0.05),
      quantidade_pregos_kg: Math.ceil(quantidadeTelhas * 4 / 1000),
      area_manta_m2: dadosAjustados.necessita_manta ? area * 1.1 : 0,
      inclinacao: dadosAjustados.inclinacao_telhado,
      tipo_estrutura: dadosAjustados.tipo_estrutura,
      cor_especificada: dadosAjustados.cor_preferida,
      nivel_acabamento: dadosAjustados.acabamento_desejado
    };

    const valorTelhas = quantidadeTelhas * 25;
    const valorRufo = especificacoes.quantidade_rufo_m * 15;
    const valorCumeeira = especificacoes.quantidade_cumeeira_m * 18;
    const valorPregas = especificacoes.quantidade_pregos_kg * 8;
    const valorManta = especificacoes.area_manta_m2 * 12;
    
    const subtotalMateriais = valorTelhas + valorRufo + valorCumeeira + valorPregas + valorManta;
    const custoInstalacao = subtotalMateriais * 0.4;
    const margem = 0.25;
    
    const subtotal = subtotalMateriais + custoInstalacao;
    const valorTotal = subtotal * (1 + margem);

    const novoCalculo: CalculoTelhas = {
      especificacoes_tecnicas: especificacoes,
      orcamento: {
        materiais: {
          telhas: valorTelhas,
          rufo: valorRufo,
          cumeeira: valorCumeeira,
          pregos: valorPregas,
          manta: valorManta,
          subtotal: subtotalMateriais
        },
        instalacao: custoInstalacao,
        subtotal_geral: subtotal,
        margem_percentual: margem * 100,
        valor_margem: subtotal * margem,
        valor_total: Math.round(valorTotal),
        valor_m2: Math.round(valorTotal / area)
      }
    };

    setCalculo(novoCalculo);
    onCalculoComplete(novoCalculo);
    setIsCalculating(false);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleInputChange = (field: keyof DadosTelhas, value: any) => {
    setDadosAjustados(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Cálculo de Telhas Shingle</h2>
        <p className="text-muted-foreground">Ajuste os parâmetros e visualize o orçamento</p>
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
                  value={dadosAjustados.area_total_m2}
                  onChange={(e) => handleInputChange('area_total_m2', Number(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="inclinacao">Inclinação do Telhado</Label>
                <Select
                  value={dadosAjustados.inclinacao_telhado}
                  onValueChange={(value) => handleInputChange('inclinacao_telhado', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa (&lt; 15°)</SelectItem>
                    <SelectItem value="média">Média (15° - 30°)</SelectItem>
                    <SelectItem value="alta">Alta (&gt; 30°)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estrutura">Tipo de Estrutura</Label>
                <Select
                  value={dadosAjustados.tipo_estrutura}
                  onValueChange={(value) => handleInputChange('tipo_estrutura', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="madeira">Madeira</SelectItem>
                    <SelectItem value="metálica">Metálica</SelectItem>
                    <SelectItem value="concreto">Concreto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="acabamento">Nível de Acabamento</Label>
                <Select
                  value={dadosAjustados.acabamento_desejado}
                  onValueChange={(value) => handleInputChange('acabamento_desejado', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="luxo">Luxo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cor">Cor Preferida</Label>
                <Input
                  id="cor"
                  value={dadosAjustados.cor_preferida}
                  onChange={(e) => handleInputChange('cor_preferida', e.target.value)}
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
              {/* Especificações Técnicas */}
              <Collapsible
                open={expandedSections.especificacoes}
                onOpenChange={() => toggleSection('especificacoes')}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                    <span className="font-semibold flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Especificações Técnicas
                    </span>
                    {expandedSections.especificacoes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Área de Cobertura:</span>
                      <span className="font-medium">{calculo.especificacoes_tecnicas.area_cobertura} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantidade de Telhas:</span>
                      <span className="font-medium">{calculo.especificacoes_tecnicas.quantidade_telhas} un</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rufo Linear:</span>
                      <span className="font-medium">{calculo.especificacoes_tecnicas.quantidade_rufo_m} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cumeeira:</span>
                      <span className="font-medium">{calculo.especificacoes_tecnicas.quantidade_cumeeira_m} m</span>
                    </div>
                    {calculo.especificacoes_tecnicas.area_manta_m2 > 0 && (
                      <div className="flex justify-between">
                        <span>Manta Asfáltica:</span>
                        <span className="font-medium">{calculo.especificacoes_tecnicas.area_manta_m2} m²</span>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Separator />

              {/* Composição de Materiais */}
              <Collapsible
                open={expandedSections.materiais}
                onOpenChange={() => toggleSection('materiais')}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                    <span className="font-semibold flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Composição de Materiais
                    </span>
                    {expandedSections.materiais ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Telhas Shingle:</span>
                      <span className="font-medium">R$ {calculo.orcamento.materiais.telhas.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rufo e Cumeeira:</span>
                      <span className="font-medium">R$ {(calculo.orcamento.materiais.rufo + calculo.orcamento.materiais.cumeeira).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fixações:</span>
                      <span className="font-medium">R$ {calculo.orcamento.materiais.pregos.toLocaleString()}</span>
                    </div>
                    {calculo.orcamento.materiais.manta > 0 && (
                      <div className="flex justify-between">
                        <span>Manta Asfáltica:</span>
                        <span className="font-medium">R$ {calculo.orcamento.materiais.manta.toLocaleString()}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Subtotal Materiais:</span>
                      <span>R$ {calculo.orcamento.materiais.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Instalação (40%):</span>
                      <span className="font-medium">R$ {calculo.orcamento.instalacao.toLocaleString()}</span>
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
                      <span className="font-semibold">Resumo Financeiro (Admin)</span>
                      {expandedSections.financeiro ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 mt-2">
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal (Materiais + Instalação):</span>
                        <span className="font-medium">R$ {calculo.orcamento.subtotal_geral.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-accent-foreground">
                        <span>Margem ({calculo.orcamento.margem_percentual}%):</span>
                        <span className="font-medium">R$ {calculo.orcamento.valor_margem.toLocaleString()}</span>
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
                    <span className="text-primary">R$ {calculo.orcamento.valor_total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Valor por m²:</span>
                    <span>R$ {calculo.orcamento.valor_m2.toLocaleString()}</span>
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
        <Button onClick={onNext} disabled={!calculo}>
          Continuar
        </Button>
      </div>
    </div>
  );
}