import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, ChevronUp, ChevronDown, Calculator, RefreshCw } from 'lucide-react';
import { useCompositionManager, ItemComposicao, NovoItemComposicao } from '@/hooks/useCompositionManager';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CompositionItemsManagerProps {
  composicaoId: string;
  composicaoNome: string;
  valorTotalAtual: number;
  onValorTotalChange?: (novoValor: number) => void;
}

interface ProdutoMestre {
  id: string;
  codigo: string;
  descricao: string;
  preco_unitario: number;
  quantidade_embalagem: number;
  unidade_medida: string;
  categoria: string;
}

export function CompositionItemsManager({ 
  composicaoId, 
  composicaoNome, 
  valorTotalAtual,
  onValorTotalChange 
}: CompositionItemsManagerProps) {
  const [itens, setItens] = useState<ItemComposicao[]>([]);
  const [produtos, setProdutos] = useState<ProdutoMestre[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemComposicao | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const {
    fetchItensComposicao,
    adicionarItem,
    editarItem,
    removerItem,
    reordenarItens,
    recalcularComposicao,
    calcularPreviewItem,
    atualizarValoresComposicao,
    isLoading
  } = useCompositionManager();

  useEffect(() => {
    loadItens();
    loadProdutos();
  }, [composicaoId]);

  const loadItens = async () => {
    const itensData = await fetchItensComposicao(composicaoId);
    setItens(itensData);
  };

  const loadProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos_mestre')
        .select('id, codigo, descricao, preco_unitario, quantidade_embalagem, unidade_medida, categoria')
        .eq('ativo', true)
        .order('codigo');

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos",
        variant: "destructive"
      });
    }
  };

  const handleAddItem = async (formData: NovoItemComposicao) => {
    const success = await adicionarItem(composicaoId, formData);
    if (success) {
      await loadItens();
      setShowAddDialog(false);
      // Recalcular e notificar componente pai
      const novoValor = await recalcularComposicao(composicaoId);
      onValorTotalChange?.(novoValor);
    }
  };

  const handleEditItem = async (itemId: string, formData: Partial<NovoItemComposicao>) => {
    const success = await editarItem(itemId, formData);
    if (success) {
      await loadItens();
      setEditingItem(null);
      const novoValor = await recalcularComposicao(composicaoId);
      onValorTotalChange?.(novoValor);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const success = await removerItem(itemId);
    if (success) {
      await loadItens();
      const novoValor = await recalcularComposicao(composicaoId);
      onValorTotalChange?.(novoValor);
    }
  };

  const handleReorderItem = async (itemId: string, direction: 'up' | 'down') => {
    const currentIndex = itens.findIndex(item => item.id === itemId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= itens.length) return;

    const newItens = [...itens];
    [newItens[currentIndex], newItens[newIndex]] = [newItens[newIndex], newItens[currentIndex]];

    // Atualizar ordens
    const updates = newItens.map((item, index) => ({
      id: item.id,
      ordem: index + 1
    }));

    const success = await reordenarItens(composicaoId, updates);
    if (success) {
      await loadItens();
    }
  };

  const handleAtualizarValores = async () => {
    const success = await atualizarValoresComposicao(composicaoId);
    if (success) {
      await loadItens();
      const novoValor = await recalcularComposicao(composicaoId);
      onValorTotalChange?.(novoValor);
    }
  };

  const filteredProdutos = produtos.filter(produto =>
    produto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const valorTotalCalculado = itens.reduce((total, item) => total + item.valor_por_m2, 0);

  return (
    <div className="space-y-6">
      {/* Cabeçalho com resumo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Itens da Composição: {composicaoNome}
              </CardTitle>
              <CardDescription>
                Gerencie os produtos que compõem esta solução
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleAtualizarValores}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar Valores
              </Button>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <ItemCompositionForm
                    produtos={filteredProdutos}
                    onSave={handleAddItem}
                    onCancel={() => setShowAddDialog(false)}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {itens.length}
              </div>
              <div className="text-sm text-muted-foreground">Itens Cadastrados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                R$ {valorTotalCalculado.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Valor Total/m²</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${Math.abs(valorTotalCalculado - valorTotalAtual) < 0.01 ? 'text-green-600' : 'text-orange-600'}`}>
                {Math.abs(valorTotalCalculado - valorTotalAtual) < 0.01 ? '✓' : '⚠'}
              </div>
              <div className="text-sm text-muted-foreground">
                {Math.abs(valorTotalCalculado - valorTotalAtual) < 0.01 ? 'Sincronizado' : 'Dessincronizado'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de itens */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Itens</CardTitle>
        </CardHeader>
        <CardContent>
          {itens.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum item cadastrado nesta composição</p>
              <p className="text-sm">Clique em "Adicionar Item" para começar</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Consumo/m²</TableHead>
                  <TableHead>Quebra</TableHead>
                  <TableHead>Fator</TableHead>
                  <TableHead>Tipo Cálculo</TableHead>
                  <TableHead>Valor Unit.</TableHead>
                  <TableHead>Valor/m²</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm w-6">{item.ordem}</span>
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={() => handleReorderItem(item.id, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={() => handleReorderItem(item.id, 'down')}
                            disabled={index === itens.length - 1}
                          >
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.produto_codigo}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {item.produto_descricao}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{item.consumo_por_m2}</TableCell>
                    <TableCell>{item.quebra_aplicada}%</TableCell>
                    <TableCell>{item.fator_correcao}</TableCell>
                    <TableCell>
                      <Badge variant={item.tipo_calculo === 'rendimento' ? 'secondary' : item.tipo_calculo === 'customizado' ? 'destructive' : 'default'}>
                        {item.tipo_calculo === 'rendimento' ? 'Rendimento' : item.tipo_calculo === 'customizado' ? 'Custom' : 'Direto'}
                      </Badge>
                    </TableCell>
                    <TableCell>R$ {item.valor_unitario.toFixed(2)}</TableCell>
                    <TableCell className="font-medium">R$ {item.valor_por_m2.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingItem(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de edição */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-w-2xl">
          {editingItem && (
            <ItemCompositionForm
              produtos={filteredProdutos}
              initialData={{
                produto_id: editingItem.produto_id,
                consumo_por_m2: editingItem.consumo_por_m2,
                quebra_aplicada: editingItem.quebra_aplicada,
                fator_correcao: editingItem.fator_correcao,
                ordem: editingItem.ordem,
                tipo_calculo: editingItem.tipo_calculo,
                formula_customizada: editingItem.formula_customizada,
                observacoes_calculo: editingItem.observacoes_calculo
              }}
              onSave={(data) => handleEditItem(editingItem.id, data)}
              onCancel={() => setEditingItem(null)}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ItemCompositionForm({
  produtos,
  initialData,
  onSave,
  onCancel,
  searchTerm,
  onSearchChange,
  isEditing = false
}: {
  produtos: ProdutoMestre[];
  initialData?: Partial<NovoItemComposicao>;
  onSave: (data: NovoItemComposicao) => void;
  onCancel: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isEditing?: boolean;
}) {
  const [selectedProduct, setSelectedProduct] = useState<ProdutoMestre | null>(null);
  const [consumo, setConsumo] = useState(initialData?.consumo_por_m2?.toString() || '1');
  const [quebra, setQuebra] = useState(initialData?.quebra_aplicada?.toString() || '5');
  const [fator, setFator] = useState(initialData?.fator_correcao?.toString() || '1');
  const [tipoCalculo, setTipoCalculo] = useState(initialData?.tipo_calculo || 'direto');
  const [formulaCustomizada, setFormulaCustomizada] = useState(initialData?.formula_customizada || '');
  const [observacoes, setObservacoes] = useState(initialData?.observacoes_calculo || '');

  const { calcularPreviewItem } = useCompositionManager();

  useEffect(() => {
    if (initialData?.produto_id) {
      const produto = produtos.find(p => p.id === initialData.produto_id);
      setSelectedProduct(produto || null);
    }
  }, [initialData, produtos]);

  // Preview do cálculo
  const preview = useMemo(() => {
    if (!selectedProduct || !consumo || !quebra || !fator) return null;
    
    return calcularPreviewItem(
      parseFloat(consumo) || 1,
      selectedProduct.preco_unitario,
      selectedProduct.quantidade_embalagem,
      parseFloat(quebra) || 5,
      parseFloat(fator) || 1,
      tipoCalculo,
      formulaCustomizada
    );
  }, [selectedProduct, consumo, quebra, fator, tipoCalculo, formulaCustomizada, calcularPreviewItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    onSave({
      produto_id: selectedProduct.id,
      consumo_por_m2: parseFloat(consumo),
      quebra_aplicada: parseFloat(quebra),
      fator_correcao: parseFloat(fator),
      tipo_calculo: tipoCalculo,
      formula_customizada: tipoCalculo === 'customizado' ? formulaCustomizada : undefined,
      observacoes_calculo: observacoes || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? 'Editar Item da Composição' : 'Adicionar Item à Composição'}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Busca de produtos */}
        <div className="space-y-2">
          <Label>Buscar Produto</Label>
          <Input
            placeholder="Digite código ou descrição..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Seleção do produto */}
        <div className="space-y-2">
          <Label>Produto *</Label>
          <Select 
            value={selectedProduct?.id || ''} 
            onValueChange={(value) => {
              const produto = produtos.find(p => p.id === value);
              setSelectedProduct(produto || null);
            }}
            disabled={isEditing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um produto" />
            </SelectTrigger>
            <SelectContent>
              {produtos.map(produto => (
                <SelectItem key={produto.id} value={produto.id}>
                  <div className="flex flex-col">
                    <div className="flex gap-2">
                      <span className="font-mono">{produto.codigo}</span>
                      <Badge variant="outline">{produto.categoria}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground truncate">
                      {produto.descricao}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      R$ {produto.preco_unitario.toFixed(2)} / {produto.unidade_medida}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="tipo-calculo">Tipo de Cálculo</Label>
          <Select value={tipoCalculo} onValueChange={setTipoCalculo}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de cálculo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="direto">Direto (consumo × preço)</SelectItem>
              <SelectItem value="rendimento">Rendimento (preço ÷ rendimento)</SelectItem>
              <SelectItem value="customizado">Fórmula Customizada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {tipoCalculo === 'customizado' && (
          <div>
            <Label htmlFor="formula">Fórmula Customizada</Label>
            <Textarea
              id="formula"
              value={formulaCustomizada}
              onChange={(e) => setFormulaCustomizada(e.target.value)}
              placeholder="Ex: {preco} / {rendimento} * (1 + {quebra}/100) * {fator}"
              className="min-h-20"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Variáveis: {'{preco}'}, {'{consumo}'}, {'{quebra}'}, {'{fator}'}, {'{rendimento}'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Consumo por m² *</Label>
            <Input
              type="number"
              step="0.001"
              min="0.001"
              value={consumo}
              onChange={(e) => setConsumo(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Quebra (%) *</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="50"
              value={quebra}
              onChange={(e) => setQuebra(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Fator de Correção *</Label>
            <Input
              type="number"
              step="0.01"
              min="0.1"
              max="10"
              value={fator}
              onChange={(e) => setFator(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Observações sobre este cálculo..."
            className="min-h-16"
          />
        </div>

        {preview && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview do Cálculo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Valor Unitário</Label>
                  <div className="text-lg font-bold">R$ {preview.valor_unitario.toFixed(2)}</div>
                </div>
                <div>
                  <Label>Valor por m²</Label>
                  <div className="text-lg font-bold text-green-600">R$ {preview.valor_por_m2.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!selectedProduct}>
            {isEditing ? 'Atualizar' : 'Adicionar'} Item
          </Button>
        </div>
      </div>
    </form>
  );
}