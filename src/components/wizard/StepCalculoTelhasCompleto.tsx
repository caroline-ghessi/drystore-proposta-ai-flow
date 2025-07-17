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
import { Checkbox } from '@/components/ui/checkbox';

interface DimensoesTelhadoCompleto {
  area_total_m2: number;
  comprimento_cumeeira: number;
  perimetro_telhado: number;
  observacoes?: string;
}

interface ComposicaoMapeada {
  composicao_id: string;
  composicao_nome: string;
  composicao_codigo: string;
  categoria: string;
  valor_por_m2: number;
  descricao?: string;
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
    perimetro_telhado: dadosExtraidos.perimetro_telhado || 50
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

  // Estados para mapeamento de composições
  const [composicoesDisponiveis, setComposicoesDisponiveis] = useState<ComposicaoMapeada[]>([]);
  const [composicoesSelecionadas, setComposicoesSelecionadas] = useState<string[]>([]);
  const [usarMapeamento, setUsarMapeamento] = useState(false);
  
  // Estados para exibir produtos das composições
  const [itensComposicoes, setItensComposicoes] = useState<{ [composicaoId: string]: any[] }>({});
  const [loadingItens, setLoadingItens] = useState<{ [composicaoId: string]: boolean }>({});

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
    verificarComposicoesDisponiveis();
  }, []);

  const verificarComposicoesDisponiveis = async () => {
    try {
      const temMapeamentos = await verificarMapeamentosDisponiveis('telhas-shingle');
      if (temMapeamentos) {
        // Buscar composições disponíveis
        const mapeamentos = await calcularPorMapeamento('telhas-shingle', 100); // Usar 100m² como base
        
        // Agrupar por composição
        const composicoesMap = new Map<string, ComposicaoMapeada>();
        
        mapeamentos.forEach(item => {
          if (!composicoesMap.has(item.composicao_id)) {
            composicoesMap.set(item.composicao_id, {
              composicao_id: item.composicao_id,
              composicao_nome: item.composicao_nome,
              composicao_codigo: item.composicao_codigo,
              categoria: item.categoria,
              valor_por_m2: 0,
              descricao: item.composicao_nome
            });
          }
          
          const composicao = composicoesMap.get(item.composicao_id)!;
          composicao.valor_por_m2 += item.valor_total / 100; // Valor por m²
        });
        
        const composicoes = Array.from(composicoesMap.values());
        setComposicoesDisponiveis(composicoes);
        setUsarMapeamento(true);
        
        // Selecionar todas as composições por padrão
        setComposicoesSelecionadas(composicoes.map(c => c.composicao_id));
      }
    } catch (error) {
      console.error('Erro ao verificar mapeamentos:', error);
    }
  };


  useEffect(() => {
    if (dimensoes.area_total_m2 > 0) {
      calcular();
    }
  }, [dimensoes]);

  const calcular = async () => {
    if (dimensoes.area_total_m2 <= 0 || composicoesSelecionadas.length === 0) return;
    
    setIsCalculating(true);
    
    try {
      // Usar exclusivamente sistema de mapeamentos
      const dadosExtras = {
        comprimento_cumeeira: dimensoes.comprimento_cumeeira,
        perimetro_telhado: dimensoes.perimetro_telhado,
        composicoes_selecionadas: composicoesSelecionadas
      };

      const itensMapeamento = await calcularPorMapeamento(
        'telhas-shingle',
        dimensoes.area_total_m2,
        dadosExtras
      );

      // Filtrar apenas as composições selecionadas
      const itensFiltrados = itensMapeamento.filter(item => 
        composicoesSelecionadas.includes(item.composicao_id)
      );

      // Converter para formato compatível
      const itensCompatíveis: ItemCalculadoShingle[] = itensFiltrados.map(item => ({
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
        // Classificar por categoria do mapeamento
        if (item.categoria.toLowerCase().includes('telha')) {
          resumo.valorTelhas += item.valor_total;
        } else if (item.categoria.toLowerCase().includes('cumeeira')) {
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
        title: "Cálculo Shingle Completo",
        description: `Orçamento calculado usando ${composicoesSelecionadas.length} composição(ões) selecionada(s).`,
      });
      
      setExpandedSections(prev => ({ ...prev, resultados: true }));
      
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

  const handleDimensaoChange = (field: keyof DimensoesTelhadoCompleto, value: any) => {
    setDimensoes(prev => ({
      ...prev,
      [field]: value
    }));
  };


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

  const toggleComposicao = async (composicaoId: string) => {
    setComposicoesSelecionadas(prev => 
      prev.includes(composicaoId) 
        ? prev.filter(id => id !== composicaoId)
        : [...prev, composicaoId]
    );
    
    // Buscar itens da composição para mostrar ao usuário
    if (!itensComposicoes[composicaoId]) {
      await buscarItensComposicao(composicaoId);
    }
  };

  const buscarItensComposicao = async (composicaoId: string) => {
    setLoadingItens(prev => ({ ...prev, [composicaoId]: true }));
    
    try {
      // Buscar itens usando área base de 1m² para mostrar consumos unitários
      const itens = await calcularPorMapeamento('telhas-shingle', 1, {});
      const itensComposicao = itens.filter(item => item.composicao_id === composicaoId);
      
      setItensComposicoes(prev => ({
        ...prev,
        [composicaoId]: itensComposicao
      }));
    } catch (error) {
      console.error('Erro ao buscar itens da composição:', error);
    } finally {
      setLoadingItens(prev => ({ ...prev, [composicaoId]: false }));
    }
  };

  // Buscar itens das composições selecionadas quando carregarem
  useEffect(() => {
    composicoesSelecionadas.forEach(composicaoId => {
      if (!itensComposicoes[composicaoId]) {
        buscarItensComposicao(composicaoId);
      }
    });
  }, [composicoesSelecionadas]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="text-center">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Home className="w-8 h-8" />
          Sistema de Telhas Shingle
        </h2>
        <p className="text-muted-foreground mt-2">
          Selecione as composições desejadas e informe as dimensões do telhado
        </p>
      </div>

      {/* Layout responsivo: 2 colunas em desktop, 1 em mobile */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Seção Esquerda: Dimensões e Configurações */}
        <div className="space-y-6">
          {/* Dimensões do Telhado */}
          <Card className="shadow-lg">
            <Collapsible
              open={expandedSections.dimensoes}
              onOpenChange={() => toggleSection('dimensoes')}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-3">
                      <Ruler className="w-6 h-6 text-primary" />
                      Dimensões do Telhado
                    </span>
                    {expandedSections.dimensoes ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-3">
                      <Label htmlFor="area" className="text-base font-medium">Área Total (m²)</Label>
                      <Input
                        id="area"
                        type="number"
                        step="0.01"
                        value={dimensoes.area_total_m2}
                        onChange={(e) => handleDimensaoChange('area_total_m2', Number(e.target.value))}
                        className="text-lg h-12"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="cumeeira" className="text-base font-medium">Cumeeira (m)</Label>
                      <Input
                        id="cumeeira"
                        type="number"
                        step="0.01"
                        value={dimensoes.comprimento_cumeeira}
                        onChange={(e) => handleDimensaoChange('comprimento_cumeeira', Number(e.target.value))}
                        className="text-lg h-12"
                      />
                    </div>

                    <div className="space-y-3 sm:col-span-2">
                      <Label htmlFor="perimetro" className="text-base font-medium">Perímetro Total (m)</Label>
                      <Input
                        id="perimetro"
                        type="number"
                        step="0.01"
                        value={dimensoes.perimetro_telhado}
                        onChange={(e) => handleDimensaoChange('perimetro_telhado', Number(e.target.value))}
                        className="text-lg h-12"
                      />
                      <p className="text-sm text-muted-foreground">
                        Soma de todos os lados do telhado
                      </p>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Configurações de Produtos */}
          <Card className="shadow-lg">
            <Collapsible
              open={expandedSections.configuracoes}
              onOpenChange={() => toggleSection('configuracoes')}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-3">
                      <Package className="w-6 h-6 text-primary" />
                      Configurações
                    </span>
                    {expandedSections.configuracoes ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-6 pt-6">
                  {/* Seleção de Composições */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Escolha o tipo de sistema Shingle</Label>
                    {composicoesDisponiveis.length > 0 ? (
                      <div className="space-y-4">
                         {composicoesDisponiveis.map((composicao) => (
                           <div key={composicao.composicao_id} className="border border-border rounded-lg overflow-hidden">
                             <div className="flex items-center space-x-4 p-4 hover:bg-muted/30 transition-colors">
                               <Checkbox
                                 id={`composicao-${composicao.composicao_id}`}
                                 checked={composicoesSelecionadas.includes(composicao.composicao_id)}
                                 onCheckedChange={() => toggleComposicao(composicao.composicao_id)}
                                 className="scale-125"
                               />
                               <div className="flex-1 min-w-0">
                                 <Label
                                   htmlFor={`composicao-${composicao.composicao_id}`}
                                   className="text-base font-medium cursor-pointer block"
                                 >
                                   {composicao.composicao_nome}
                                 </Label>
                                 <p className="text-sm text-muted-foreground">
                                   {composicao.composicao_codigo}
                                 </p>
                               </div>
                               <div className="text-right">
                                 <span className="text-base font-semibold text-primary">
                                   {formatCurrency(composicao.valor_por_m2)}/m²
                                 </span>
                               </div>
                             </div>
                            
                             {/* Produtos desta composição */}
                             {composicoesSelecionadas.includes(composicao.composicao_id) && (
                               <div className="px-4 pb-4">
                                 <div className="bg-muted/30 rounded-lg p-4 border-l-4 border-primary/30">
                                   <p className="text-sm font-medium text-foreground mb-3">Produtos desta composição:</p>
                                   {loadingItens[composicao.composicao_id] ? (
                                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                       <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                       Carregando produtos...
                                     </div>
                                   ) : itensComposicoes[composicao.composicao_id]?.length > 0 ? (
                                     <div className="grid gap-3 sm:grid-cols-2">
                                       {itensComposicoes[composicao.composicao_id].slice(0, 6).map((item, idx) => (
                                         <div key={idx} className="bg-background/60 rounded-lg p-3 border">
                                           <div className="flex justify-between items-start">
                                             <div className="flex-1 min-w-0">
                                               <p className="text-sm font-medium text-foreground truncate">
                                                 {item.item_descricao}
                                               </p>
                                               <p className="text-xs text-muted-foreground mt-1">
                                                 ~{item.consumo_por_m2.toFixed(2)} {item.item_codigo.includes('M2') ? 'm²' : item.item_codigo.includes('KG') ? 'kg' : 'un'}/m²
                                               </p>
                                             </div>
                                             <div className="text-right ml-3">
                                               <span className="text-sm font-semibold text-primary">
                                                 {formatCurrency(item.preco_unitario)}
                                               </span>
                                             </div>
                                           </div>
                                         </div>
                                       ))}
                                       {itensComposicoes[composicao.composicao_id].length > 6 && (
                                         <div className="col-span-full">
                                           <p className="text-sm text-muted-foreground text-center italic">
                                             + {itensComposicoes[composicao.composicao_id].length - 6} outros produtos...
                                           </p>
                                         </div>
                                       )}
                                     </div>
                                   ) : (
                                     <p className="text-sm text-muted-foreground">Nenhum produto encontrado</p>
                                   )}
                                 </div>
                               </div>
                             )}
                           </div>
                         ))}
                       </div>
                     ) : (
                       <div className="text-center text-muted-foreground py-8">
                         <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                         <p className="text-base">Carregando composições disponíveis...</p>
                       </div>
                     )}
                     {composicoesSelecionadas.length === 0 && composicoesDisponiveis.length > 0 && (
                       <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                         <p className="text-sm text-orange-700 font-medium">
                           ⚠️ Selecione pelo menos uma composição para calcular o orçamento.
                         </p>
                       </div>
                     )}
                   </div>

                   <Button 
                     onClick={calcular} 
                     disabled={isCalculating || dimensoes.area_total_m2 <= 0 || composicoesSelecionadas.length === 0}
                     className="w-full"
                     size="lg"
                   >
                     <Calculator className="w-5 h-5 mr-2" />
                     {isCalculating ? 'Calculando...' : 'Calcular Orçamento'}
                   </Button>

                   {/* Info do sistema de composições */}
                   <Card className="bg-blue-50 border-blue-200">
                     <CardContent className="p-4">
                       <div className="flex gap-3">
                         <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                         <div className="text-sm text-blue-800">
                           <p className="font-medium mb-2">Sistema de Composições Shingle:</p>
                           <p>Os cálculos incluem telhas, OSB, cumeeiras e todos os componentes necessários para a instalação, baseados nas dimensões informadas e nas composições selecionadas.</p>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 </CardContent>
               </CollapsibleContent>
             </Collapsible>
           </Card>
         </div>

         {/* Seção Direita: Resultados */}
         <div className="space-y-6">
           <Card className="shadow-lg">
             <Collapsible
               open={expandedSections.resultados}
               onOpenChange={() => toggleSection('resultados')}
             >
               <CollapsibleTrigger asChild>
                 <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                   <CardTitle className="flex items-center justify-between text-lg">
                     <span className="flex items-center gap-3">
                       <DollarSign className="w-6 h-6 text-primary" />
                       Resultado do Orçamento
                       {isCalculating && <Badge variant="secondary" className="ml-2">Calculando...</Badge>}
                     </span>
                     {expandedSections.resultados ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                   </CardTitle>
                 </CardHeader>
               </CollapsibleTrigger>
               <CollapsibleContent>
                 <CardContent className="space-y-6 pt-6">
                   {orcamento && (
                     <>
                       {/* Resumo por categoria */}
                       <div className="space-y-4">
                         {[
                           { label: 'Telhas', value: orcamento.valorTelhas, show: true },
                           { label: 'Acessórios', value: orcamento.valorAcessorios, show: true },
                           { label: 'Calhas', value: orcamento.valorCalhas, show: orcamento.valorCalhas > 0 },
                           { label: 'Complementos', value: orcamento.valorComplementos, show: true }
                         ].filter(item => item.show).map((item, idx) => (
                           <div key={idx} className="flex justify-between items-center py-2 border-b border-border/50">
                             <span className="text-base">{item.label}:</span>
                             <span className="text-base font-semibold">{formatCurrency(item.value)}</span>
                           </div>
                         ))}
                         
                         <Separator className="my-4" />
                         
                         <div className="space-y-3">
                           <div className="flex justify-between items-center py-2">
                             <span className="text-lg font-medium">Valor por m²:</span>
                             <span className="text-lg font-bold text-primary">
                               {formatCurrency(orcamento.valorPorM2)}
                             </span>
                           </div>
                           <div className="flex justify-between items-center py-3 bg-primary/5 rounded-lg px-4">
                             <span className="text-xl font-bold">Total Geral:</span>
                             <span className="text-2xl font-bold text-primary">
                               {formatCurrency(orcamento.valorTotal)}
                             </span>
                           </div>
                         </div>
                       </div>

                       <Separator />

                       {/* Ações */}
                       <div className="space-y-3">
                         <Button 
                           variant="outline" 
                           className="w-full"
                           size="lg"
                           onClick={() => toggleSection('detalhamento')}
                         >
                           <FileText className="w-5 h-5 mr-2" />
                           Ver Detalhamento
                         </Button>
                         <Button 
                           className="w-full"
                           size="lg"
                           onClick={onNext}
                           disabled={!orcamento}
                         >
                           Continuar
                         </Button>
                       </div>
                     </>
                   )}

                   {!orcamento && !isCalculating && (
                     <div className="text-center text-muted-foreground py-12">
                       <Building className="w-16 h-16 mx-auto mb-4 opacity-40" />
                       <p className="text-lg">Configure as dimensões e clique em calcular</p>
                       <p className="text-sm mt-2">O resultado aparecerá aqui após o cálculo</p>
                     </div>
                   )}
                 </CardContent>
               </CollapsibleContent>
             </Collapsible>
           </Card>
         </div>
       </div>

       {/* Tabela Detalhada - Full Width */}
       {orcamento && (
         <Collapsible
           open={expandedSections.detalhamento}
           onOpenChange={() => toggleSection('detalhamento')}
         >
           <Card className="shadow-lg">
             <CollapsibleTrigger asChild>
               <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                 <CardTitle className="flex items-center justify-between text-lg">
                   <div className="flex items-center gap-3">
                     <FileText className="w-6 h-6 text-primary" />
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
                     {expandedSections.detalhamento ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                   </div>
                 </CardTitle>
               </CardHeader>
             </CollapsibleTrigger>
             <CollapsibleContent>
               <CardContent className="pt-6">
                 {modoEdicao && (
                   <div className="flex gap-2 mb-6">
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
                 
                 {/* Versão Mobile - Cards */}
                 <div className="block lg:hidden space-y-4">
                   {(modoEdicao ? itensEditaveis : orcamento.itens).map((item, idx) => (
                     <Card key={idx} className={`${modoEdicao ? 'bg-blue-50/30' : ''}`}>
                       <CardContent className="p-4">
                         <div className="space-y-3">
                           <div>
                             <p className="font-semibold">{item.descricao}</p>
                             <p className="text-sm text-muted-foreground">{item.tipo_item}</p>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-3 text-sm">
                             <div>
                               <span className="text-muted-foreground">Dimensão:</span>
                               <p className="font-medium">{item.dimensao_base.toFixed(2)} {item.unidade_dimensao}</p>
                             </div>
                             <div>
                               <span className="text-muted-foreground">Fator:</span>
                               <p className="font-medium">{item.fator_conversao.toFixed(3)}</p>
                             </div>
                             <div>
                               <span className="text-muted-foreground">Quebra:</span>
                               <p className="font-medium">{item.quebra_percentual}%</p>
                             </div>
                             <div>
                               <span className="text-muted-foreground">Qtd Final:</span>
                               {modoEdicao ? (
                                 <Input
                                   type="number"
                                   value={item.quantidade_final}
                                   onChange={(e) => editarQuantidadeItem(idx, Number(e.target.value) || 0)}
                                   className="h-8 mt-1"
                                   min="0"
                                 />
                               ) : (
                                 <p className="font-medium">{item.quantidade_final} {item.unidade_venda}</p>
                               )}
                             </div>
                           </div>
                           
                           <div className="flex justify-between pt-2 border-t">
                             <span className="text-muted-foreground">Preço Unit.:</span>
                             <span className="font-medium">{formatCurrency(item.preco_unitario)}</span>
                           </div>
                           
                           <div className="flex justify-between items-center pt-1">
                             <span className="font-semibold">Total:</span>
                             <span className="font-bold text-primary text-lg">{formatCurrency(item.valor_total)}</span>
                           </div>
                           
                           {modoEdicao && (
                             <div className="pt-2">
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => removerItem(idx)}
                                 className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                               >
                                 <Trash2 className="w-4 h-4 mr-1" />
                                 Remover Item
                               </Button>
                             </div>
                           )}
                         </div>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
                 
                 {/* Versão Desktop - Tabela */}
                 <div className="hidden lg:block overflow-x-auto">
                   <table className="w-full">
                     <thead>
                       <tr className="border-b-2 border-border">
                         <th className="text-left py-4 px-2 font-semibold">Item</th>
                         <th className="text-right py-4 px-2 font-semibold">Dimensão</th>
                         <th className="text-right py-4 px-2 font-semibold">Fator</th>
                         <th className="text-right py-4 px-2 font-semibold">Quebra</th>
                         <th className="text-right py-4 px-2 font-semibold">Qtd Calc.</th>
                         <th className="text-right py-4 px-2 font-semibold">Qtd Final</th>
                         <th className="text-right py-4 px-2 font-semibold">Preço Unit.</th>
                         <th className="text-right py-4 px-2 font-semibold">Total</th>
                         {modoEdicao && <th className="text-center py-4 px-2 font-semibold">Ações</th>}
                       </tr>
                     </thead>
                     <tbody>
                       {(modoEdicao ? itensEditaveis : orcamento.itens).map((item, idx) => (
                         <tr key={idx} className={`border-b hover:bg-muted/30 transition-colors ${modoEdicao ? 'bg-blue-50/30' : ''}`}>
                           <td className="py-4 px-2">
                             <div>
                               <p className="font-medium text-base">{item.descricao}</p>
                               <p className="text-sm text-muted-foreground">{item.tipo_item}</p>
                             </div>
                           </td>
                           <td className="text-right py-4 px-2">
                             <span className="text-base">{item.dimensao_base.toFixed(2)} {item.unidade_dimensao}</span>
                           </td>
                           <td className="text-right py-4 px-2">
                             <span className="text-base">{item.fator_conversao.toFixed(3)}</span>
                           </td>
                           <td className="text-right py-4 px-2">
                             <span className="text-base">{item.quebra_percentual}%</span>
                           </td>
                           <td className="text-right py-4 px-2">
                             <span className="text-base">{item.quantidade_calculada.toFixed(2)}</span>
                           </td>
                           <td className="text-right py-4 px-2">
                             {modoEdicao ? (
                               <Input
                                 type="number"
                                 value={item.quantidade_final}
                                 onChange={(e) => editarQuantidadeItem(idx, Number(e.target.value) || 0)}
                                 className="w-24 h-10 text-right"
                                 min="0"
                               />
                             ) : (
                               <span className="text-base font-medium">{item.quantidade_final} {item.unidade_venda}</span>
                             )}
                           </td>
                           <td className="text-right py-4 px-2">
                             <span className="text-base">{formatCurrency(item.preco_unitario)}</span>
                           </td>
                           <td className="text-right py-4 px-2">
                             <span className="text-base font-semibold text-primary">{formatCurrency(item.valor_total)}</span>
                           </td>
                           {modoEdicao && (
                             <td className="text-center py-4 px-2">
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
       <div className="flex justify-between pt-6">
         <Button variant="outline" onClick={onBack} size="lg">
           Voltar
         </Button>
         <Button 
           onClick={onNext}
           disabled={!orcamento}
           size="lg"
         >
           Continuar
         </Button>
       </div>
     </div>
   );
 }