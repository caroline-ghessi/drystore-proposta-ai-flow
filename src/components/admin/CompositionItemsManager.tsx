
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
                  <TableHead className="w-16">Ordem</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Consumo/m²</TableHead>
                  <TableHead>Quebra%</TableHead>
                  <TableHead>Fator</TableHead>
                  <TableHead>Valor/m²</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead className="w-32">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-sm">{item.ordem}</span>
                        <div className="flex flex-col">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleReorderItem(item.id, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
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
                        <div className="font-medium">{item.produtos_mestre?.codigo}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {item.produtos_mestre?.descricao}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{item.consumo_por_m2.toFixed(3)}</TableCell>
                    <TableCell>{item.quebra_aplicada.toFixed(1)}%</TableCell>
                    <TableCell>{item.fator_correcao.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className="font-bold">R$ {item.valor_por_m2.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.produtos_mestre?.unidade_medida}</Badge>
                    </TableCell>
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
                ordem: editingItem.ordem
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
  const [formData, setFormData] = useState<NovoItemComposicao>({
    produto_id: initialData?.produto_id || '',
    consumo_por_m2: initialData?.consumo_por_m2 || 1,
    quebra_aplicada: initialData?.quebra_aplicada || 5,
    fator_correcao: initialData?.fator_correcao || 1,
    ordem: initialData?.ordem || 1
  });

  const [selectedProduto, setSelectedProduto] = useState<ProdutoMestre | null>(null);

  const { calcularPreviewItem } = useCompositionManager();

  useEffect(() => {
    if (formData.produto_id) {
      const produto = produtos.find(p => p.id === formData.produto_id);
      setSelectedProduto(produto || null);
    }
  }, [formData.produto_id, produtos]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const preview = selectedProduto ? calcularPreviewItem(
    formData.consumo_por_m2,
    selectedProduto.preco_unitario,
    selectedProduto.quantidade_embalagem,
    formData.quebra_aplicada,
    formData.fator_correcao
  ) : null;

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
            value={formData.produto_id} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, produto_id: value }))}
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

        {/* Campos de configuração */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Consumo por m² *</Label>
            <Input
              type="number"
              step="0.001"
              min="0.001"
              value={formData.consumo_por_m2}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                consumo_por_m2: parseFloat(e.target.value) || 0 
              }))}
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
              value={formData.quebra_aplicada}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                quebra_aplicada: parseFloat(e.target.value) || 0 
              }))}
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
              value={formData.fator_correcao}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                fator_correcao: parseFloat(e.target.value) || 1 
              }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Ordem</Label>
            <Input
              type="number"
              min="1"
              value={formData.ordem}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                ordem: parseInt(e.target.value) || 1 
              }))}
            />
          </div>
        </div>

        {/* Preview dos cálculos */}
        {preview && selectedProduto && (
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-sm">Preview dos Cálculos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Valor Unitário:</span>
                  <span className="ml-2 font-medium">
                    R$ {preview.valor_unitario.toFixed(4)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Valor por m²:</span>
                  <span className="ml-2 font-bold text-primary">
                    R$ {preview.valor_por_m2.toFixed(2)}
                  </span>
                </div>
                <div className="col-span-2 text-xs text-muted-foreground">
                  Cálculo: {formData.consumo_por_m2} × {preview.valor_unitario.toFixed(4)} × 
                  (1 + {formData.quebra_aplicada}%) × {formData.fator_correcao} = R$ {preview.valor_por_m2.toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!formData.produto_id}>
          {isEditing ? 'Atualizar' : 'Adicionar'} Item
        </Button>
      </div>
    </form>
  );
}
