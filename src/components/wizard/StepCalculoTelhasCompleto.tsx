import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronUp, 
  Calculator, 
  Building, 
  Package, 
  Home,
  Ruler,
  DollarSign,
  Info,
  FileText,
  Edit,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useProdutos, ProdutoShingleCompleto, ResumoOrcamentoShingle, ItemCalculadoShingle } from '@/hooks/useProdutos';
import { useCalculoMapeamento } from '@/hooks/useCalculoMapeamento';
import { useToast } from '@/hooks/use-toast';
import { TelhaSelectionCard } from './TelhaSelectionCard';
import { ItemAdicionarModal } from '@/components/admin/ItemAdicionarModal';

interface DimensoesTelhadoCompleto {
  area_total_m2: number;
  comprimento_cumeeira: number;
  perimetro_telhado: number;
  comprimento_calha: number;
  comprimento_rufo_lateral?: number;
  comprimento_rufo_capa?: number;
  tipo_telha: string;
  cor_acessorios: string;
  incluir_calha: boolean;
  incluir_manta: boolean;
  estimar_rufos: boolean;
  observacoes?: string;
}

interface StepCalculoTelhasCompletoProps {
  dadosExtraidos: any;
  onCalculoComplete: (calculo: ResumoOrcamentoShingle) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepCalculoTelhasCompleto({
  dadosExtraidos,
  onCalculoComplete,
  onBack,
  onNext
}: StepCalculoTelhasCompletoProps) {
  const [dimensoes, setDimensoes] = useState<DimensoesTelhadoCompleto>({
    area_total_m2: dadosExtraidos.area_total_m2 || 100,
    comprimento_cumeeira: dadosExtraidos.comprimento_cumeeira || 12,
    perimetro_telhado: dadosExtraidos.perimetro_telhado || 50,
    comprimento_calha: dadosExtraidos.comprimento_calha || 20,
    tipo_telha: '10420',
    cor_acessorios: 'CINZA',
    incluir_calha: true,
    incluir_manta: true,
    estimar_rufos: true
  });

  const [orcamento, setOrcamento] = useState<ResumoOrcamentoShingle | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showTelhaSelector, setShowTelhaSelector] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    dimensoes: true,
    configuracoes: true,
    resultados: false,
    detalhamento: false
  });

  // Estados para edição da composição
  const [modoEdicao, setModoEdicao] = useState(false);
  const [itensEditaveis, setItensEditaveis] = useState<ItemCalculadoShingle[]>([]);
  const [showAdicionarModal, setShowAdicionarModal] = useState(false);

  const { canViewMargins } = useUserRole();
  const { 
    produtosShingleCompletos, 
    buscarProdutosShingleCompletos, 
    calcularOrcamentoShingleCompleto,
    loading 
  } = useProdutos();
  const { calcularPorMapeamento, verificarMapeamentosDisponiveis } = useCalculoMapeamento();
  const { toast } = useToast();

  useEffect(() => {
    buscarProdutosShingleCompletos();
  }, []);

  useEffect(() => {
    if (dimensoes.estimar_rufos && dimensoes.perimetro_telhado > 0) {
      setDimensoes(prev => ({
        ...prev,
        comprimento_rufo_lateral: prev.perimetro_telhado * 0.6,
        comprimento_rufo_capa: prev.perimetro_telhado * 0.4
      }));
    }
  }, [dimensoes.perimetro_telhado, dimensoes.estimar_rufos]);

  useEffect(() => {
    if (dimensoes.area_total_m2 > 0) {
      calcular();
    }
  }, [dimensoes]);

  const calcular = async () => {
    if (dimensoes.area_total_m2 <= 0) return;
    
    setIsCalculating(true);
    
    try {
      // Verificar se existem mapeamentos para telhas-shingle
      const temMapeamentos = await verificarMapeamentosDisponiveis('telhas-shingle');
      
      if (temMapeamentos) {
        // Usar sistema de mapeamentos
        const dadosExtras = {
          comprimento_cumeeira: dimensoes.comprimento_cumeeira,
          perimetro_telhado: dimensoes.perimetro_telhado,
          comprimento_calha: dimensoes.incluir_calha ? dimensoes.comprimento_calha : 0,
          tipo_telha: dimensoes.tipo_telha,
          cor_acessorios: dimensoes.cor_acessorios,
          incluir_manta: dimensoes.incluir_manta,
          incluir_calha: dimensoes.incluir_calha
        };

        const itensMapeamento = await calcularPorMapeamento(
          'telhas-shingle',
          dimensoes.area_total_m2,
          dadosExtras
        );

        // Converter para formato compatível
        const itensCompatíveis: ItemCalculadoShingle[] = itensMapeamento.map(item => ({
          tipo_item: item.categoria.replace('_', ' ').toUpperCase(),
          codigo: item.item_codigo,
          descricao: item.item_descricao,
          dimensao_base: item.area_aplicacao,
          unidade_dimensao: 'm²',
          fator_conversao: item.fator_aplicacao,
          quebra_percentual: ((item.quantidade_com_quebra / item.quantidade_liquida) - 1) * 100,
          quantidade_calculada: item.quantidade_liquida,
          quantidade_final: Math.ceil(item.quantidade_com_quebra),
          unidade_venda: 'un',
          preco_unitario: item.preco_unitario,
          valor_total: item.valor_total,
          categoria: item.categoria,
          ordem: item.ordem_calculo
        }));

        // Calcular resumo
        const resumo: ResumoOrcamentoShingle = {
          valorTelhas: 0,
          valorAcessorios: 0,
          valorCalhas: 0,
          valorComplementos: 0,
          valorTotal: 0,
          valorPorM2: 0,
          itens: itensCompatíveis
        };

        itensCompatíveis.forEach(item => {
          resumo.valorTotal += item.valor_total;
          if (item.tipo_item.includes('TELHA')) {
            resumo.valorTelhas += item.valor_total;
          } else if (item.tipo_item.includes('CALHA')) {
            resumo.valorCalhas += item.valor_total;
          } else if (item.tipo_item.includes('CUMEEIRA') || item.tipo_item.includes('RUFO')) {
            resumo.valorAcessorios += item.valor_total;
          } else {
            resumo.valorComplementos += item.valor_total;
          }
        });

        resumo.valorPorM2 = resumo.valorTotal / dimensoes.area_total_m2;

        setOrcamento(resumo);
        setItensEditaveis(itensCompatíveis);
        onCalculoComplete(resumo);
        
        toast({
          title: "Cálculo com Mapeamentos",
          description: "Orçamento calculado usando o sistema de mapeamentos configurado.",
        });
      } else {
        // Usar sistema legado
        const resultado = await calcularOrcamentoShingleCompleto(
          dimensoes.area_total_m2,
          dimensoes.comprimento_cumeeira,
          dimensoes.perimetro_telhado,
          dimensoes.incluir_calha ? dimensoes.comprimento_calha : 0,
          dimensoes.tipo_telha,
          dimensoes.cor_acessorios,
          dimensoes.incluir_manta
        );

        setOrcamento(resultado);
        setItensEditaveis(resultado.itens);
        onCalculoComplete(resultado);
        
        toast({
          title: "Cálculo Legado",
          description: "Orçamento calculado usando o sistema de produtos individual. Configure mapeamentos para usar o novo sistema."
        });
      }
      
      setExpandedSections(prev => ({ ...prev, resultados: true }));
      
    } catch (error) {
      toast({
        title: "Erro no cálculo",
        description: "Não foi possível calcular o orçamento completo. Tente novamente.",
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

  const handleDimensaoChange = (field: keyof DimensoesTelhadoCompleto, value: any) => {
    setDimensoes(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const telhas = produtosShingleCompletos.filter(p => p.tipo_componente === 'TELHA');
  const telhasSelecionada = telhas.find(t => t.codigo === dimensoes.tipo_telha);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Funções para edição da composição
  const iniciarEdicao = () => {
    setModoEdicao(true);
    setExpandedSections(prev => ({ ...prev, detalhamento: true }));
  };

  const cancelarEdicao = () => {
    setModoEdicao(false);
    if (orcamento) {
      setItensEditaveis(orcamento.itens); // Restaurar itens originais
    }
  };

  const salvarEdicao = () => {
    if (!orcamento) return;

    // Recalcular resumo com os itens editados
    const novoResumo: ResumoOrcamentoShingle = {
      valorTelhas: 0,
      valorAcessorios: 0,
      valorCalhas: 0,
      valorComplementos: 0,
      valorTotal: 0,
      valorPorM2: 0,
      itens: itensEditaveis
    };

    itensEditaveis.forEach(item => {
      switch(item.tipo_item) {
        case 'TELHA':
          novoResumo.valorTelhas += item.valor_total;
          break;
        case 'CUMEEIRA':
        case 'RUFO_LATERAL':
        case 'RUFO_CAPA':
          novoResumo.valorAcessorios += item.valor_total;
          break;
        case 'CALHA':
          novoResumo.valorCalhas += item.valor_total;
          break;
        case 'PREGO':
        case 'MANTA_STARTER':
          novoResumo.valorComplementos += item.valor_total;
          break;
      }
      novoResumo.valorTotal += item.valor_total;
    });

    novoResumo.valorPorM2 = novoResumo.valorTotal / dimensoes.area_total_m2;

    setOrcamento(novoResumo);
    onCalculoComplete(novoResumo);
    setModoEdicao(false);

    toast({
      title: "Composição salva",
      description: "As alterações foram aplicadas ao orçamento.",
    });
  };

  const editarQuantidadeItem = (index: number, novaQuantidade: number) => {
    const novosItens = [...itensEditaveis];
    novosItens[index].quantidade_final = novaQuantidade;
    novosItens[index].valor_total = novaQuantidade * novosItens[index].preco_unitario;
    setItensEditaveis(novosItens);
  };

  const removerItem = (index: number) => {
    const novosItens = itensEditaveis.filter((_, i) => i !== index);
    setItensEditaveis(novosItens);
  };

  const adicionarItem = (novoItem: ItemCalculadoShingle) => {
    setItensEditaveis(prev => [...prev, novoItem]);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="text-center">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Home className="w-8 h-8" />
          Sistema Completo de Telhas Shingle
        </h2>
        <p className="text-muted-foreground mt-2">
          Cálculo detalhado incluindo telhas, cumeeiras, rufos, calhas e acessórios
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Dimensões do Telhado */}
        <Card>
          <Collapsible
            open={expandedSections.dimensoes}
            onOpenChange={() => toggleSection('dimensoes')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Ruler className="w-5 h-5" />
                    Dimensões do Telhado
                  </span>
                  {expandedSections.dimensoes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="area">Área Total (m²)</Label>
                    <Input
                      id="area"
                      type="number"
                      step="0.01"
                      value={dimensoes.area_total_m2}
                      onChange={(e) => handleDimensaoChange('area_total_m2', Number(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cumeeira">Cumeeira (m)</Label>
                    <Input
                      id="cumeeira"
                      type="number"
                      step="0.01"
                      value={dimensoes.comprimento_cumeeira}
                      onChange={(e) => handleDimensaoChange('comprimento_cumeeira', Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="perimetro">Perímetro Total (m)</Label>
                    <Input
                      id="perimetro"
                      type="number"
                      step="0.01"
                      value={dimensoes.perimetro_telhado}
                      onChange={(e) => handleDimensaoChange('perimetro_telhado', Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Soma de todos os lados do telhado
                    </p>
                  </div>

                  <div className="space-y-3 sm:col-span-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="estimar-rufos"
                        checked={dimensoes.estimar_rufos}
                        onCheckedChange={(checked) => handleDimensaoChange('estimar_rufos', checked)}
                      />
                      <Label htmlFor="estimar-rufos" className="text-sm">
                        Estimar rufos automaticamente
                      </Label>
                    </div>
                    
                    {dimensoes.estimar_rufos && (
                      <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 p-2 rounded">
                        <p>• Rufo Lateral: {(dimensoes.perimetro_telhado * 0.6).toFixed(1)} m (60%)</p>
                        <p>• Rufo Capa: {(dimensoes.perimetro_telhado * 0.4).toFixed(1)} m (40%)</p>
                      </div>
                    )}

                    {!dimensoes.estimar_rufos && (
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Rufo Lateral (m)"
                          value={dimensoes.comprimento_rufo_lateral || ''}
                          onChange={(e) => handleDimensaoChange('comprimento_rufo_lateral', Number(e.target.value) || 0)}
                        />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Rufo Capa (m)"
                          value={dimensoes.comprimento_rufo_capa || ''}
                          onChange={(e) => handleDimensaoChange('comprimento_rufo_capa', Number(e.target.value) || 0)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 sm:col-span-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="incluir-calha"
                        checked={dimensoes.incluir_calha}
                        onCheckedChange={(checked) => handleDimensaoChange('incluir_calha', checked)}
                      />
                      <Label htmlFor="incluir-calha" className="text-sm">
                        Incluir Calhas
                      </Label>
                    </div>
                    
                    {dimensoes.incluir_calha && (
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Comprimento das calhas (m)"
                        value={dimensoes.comprimento_calha}
                        onChange={(e) => handleDimensaoChange('comprimento_calha', Number(e.target.value))}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Coluna 2: Configurações de Produtos */}
        <Card>
          <Collapsible
            open={expandedSections.configuracoes}
            onOpenChange={() => toggleSection('configuracoes')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Configurações
                  </span>
                  {expandedSections.configuracoes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {/* Telha Selecionada */}
                <div className="space-y-3">
                  <Label>Telha Selecionada</Label>
                  <TelhaSelectionCard 
                    telha={telhasSelecionada}
                    onEdit={() => setShowTelhaSelector(!showTelhaSelector)}
                  />
                </div>

                {/* Seletor de Telha (Collapsible) */}
                {showTelhaSelector && (
                  <div className="space-y-2 border border-border rounded-lg p-3 bg-muted/20">
                    <Label htmlFor="tipo-telha">Escolher Nova Telha</Label>
                    <Select
                      value={dimensoes.tipo_telha}
                      onValueChange={(value) => {
                        handleDimensaoChange('tipo_telha', value);
                        setShowTelhaSelector(false);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a telha" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                          Linha Supreme
                        </div>
                        {telhas.filter(t => t.linha === 'SUPREME').map(telha => (
                          <SelectItem key={telha.codigo} value={telha.codigo}>
                            <div className="flex flex-col gap-1 py-1">
                              <span className="font-medium">{telha.descricao}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatCurrency(telha.preco_unitario)}/pct
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                        
                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground mt-2">
                          Linha Duration
                        </div>
                        {telhas.filter(t => t.linha === 'DURATION').map(telha => (
                          <SelectItem key={telha.codigo} value={telha.codigo}>
                            <div className="flex flex-col gap-1 py-1">
                              <span className="font-medium">{telha.descricao}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatCurrency(telha.preco_unitario)}/pct
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowTelhaSelector(false)}
                      className="w-full mt-2"
                    >
                      Cancelar
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="cor-acessorios">Cor dos Acessórios</Label>
                  <Select
                    value={dimensoes.cor_acessorios}
                    onValueChange={(value) => handleDimensaoChange('cor_acessorios', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CINZA">Cinza</SelectItem>
                      <SelectItem value="MARROM">Marrom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="incluir-manta"
                      checked={dimensoes.incluir_manta}
                      onCheckedChange={(checked) => handleDimensaoChange('incluir_manta', checked)}
                    />
                    <Label htmlFor="incluir-manta" className="text-sm">
                      Incluir Manta Starter
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Manta asfáltica para impermeabilização da base
                  </p>
                </div>

                <Button 
                  onClick={calcular} 
                  disabled={isCalculating || dimensoes.area_total_m2 <= 0}
                  className="w-full"
                  size="lg"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  {isCalculating ? 'Calculando...' : 'Calcular Orçamento Completo'}
                </Button>

                {/* Info das quebras */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-3">
                    <div className="flex gap-2">
                      <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-blue-800">
                        <p className="font-medium mb-1">Quebras aplicadas:</p>
                        <ul className="space-y-0.5">
                          <li>• Telhas: 5%</li>
                          <li>• Cumeeiras: 10%</li>
                          <li>• Rufos/Calhas: 5%</li>
                          <li>• Manta: 10%</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Coluna 3: Resultados */}
        <Card>
          <Collapsible
            open={expandedSections.resultados}
            onOpenChange={() => toggleSection('resultados')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Resultado do Orçamento
                    {isCalculating && <Badge variant="secondary">Calculando...</Badge>}
                  </span>
                  {expandedSections.resultados ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {orcamento && (
                  <>
                    {/* Resumo por categoria */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Telhas:</span>
                        <span className="font-medium">{formatCurrency(orcamento.valorTelhas)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Acessórios:</span>
                        <span className="font-medium">{formatCurrency(orcamento.valorAcessorios)}</span>
                      </div>
                      {orcamento.valorCalhas > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Calhas:</span>
                          <span className="font-medium">{formatCurrency(orcamento.valorCalhas)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span>Complementos:</span>
                        <span className="font-medium">{formatCurrency(orcamento.valorComplementos)}</span>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Valor por m²:</span>
                          <span className="font-bold">
                            {formatCurrency(orcamento.valorPorM2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-lg">
                          <span className="font-bold">Total Geral:</span>
                          <span className="font-bold text-primary">
                            {formatCurrency(orcamento.valorTotal)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Ações */}
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => toggleSection('detalhamento')}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Ver Detalhamento
                      </Button>
                      <Button 
                        className="w-full"
                        onClick={onNext}
                        disabled={!orcamento}
                      >
                        Continuar
                      </Button>
                    </div>
                  </>
                )}

                {!orcamento && !isCalculating && (
                  <div className="text-center text-muted-foreground py-8">
                    <Building className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Configure as dimensões e clique em calcular</p>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>

      {/* Tabela Detalhada */}
      {orcamento && (
        <Collapsible
          open={expandedSections.detalhamento}
          onOpenChange={() => toggleSection('detalhamento')}
        >
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>Detalhamento dos Itens</span>
                    {modoEdicao && <Badge variant="secondary">Modo Edição</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    {!modoEdicao && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          iniciarEdicao();
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    )}
                    {expandedSections.detalhamento ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                {modoEdicao && (
                  <div className="flex gap-2 mb-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowAdicionarModal(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar Item
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={cancelarEdicao}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancelar
                    </Button>
                    <Button 
                      size="sm"
                      onClick={salvarEdicao}
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Salvar Alterações
                    </Button>
                  </div>
                )}
                
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
                        {modoEdicao && <th className="text-center">Ações</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {(modoEdicao ? itensEditaveis : orcamento.itens).map((item, idx) => (
                        <tr key={idx} className={`border-b hover:bg-muted/30 ${modoEdicao ? 'bg-blue-50/30' : ''}`}>
                          <td className="py-2">
                            <div>
                              <p className="font-medium">{item.descricao}</p>
                              <p className="text-xs text-muted-foreground">{item.tipo_item}</p>
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
                            {modoEdicao ? (
                              <Input
                                type="number"
                                value={item.quantidade_final}
                                onChange={(e) => editarQuantidadeItem(idx, Number(e.target.value) || 0)}
                                className="w-20 h-8 text-right"
                                min="0"
                              />
                            ) : (
                              <span>{item.quantidade_final} {item.unidade_venda}</span>
                            )}
                          </td>
                          <td className="text-right">
                            {formatCurrency(item.preco_unitario)}
                          </td>
                          <td className="text-right font-medium">
                            {formatCurrency(item.valor_total)}
                          </td>
                          {modoEdicao && (
                            <td className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removerItem(idx)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Modal de Adição */}
      <ItemAdicionarModal
        open={showAdicionarModal}
        onOpenChange={setShowAdicionarModal}
        produtos={produtosShingleCompletos}
        onAdicionarItem={adicionarItem}
      />

      {/* Navegação */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button 
          onClick={onNext}
          disabled={!orcamento}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}