import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus } from 'lucide-react';
import { ProdutoShingleCompleto, ItemCalculadoShingle } from '@/hooks/useProdutos';

interface ItemAdicionarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produtos: ProdutoShingleCompleto[];
  onAdicionarItem: (item: ItemCalculadoShingle) => void;
}

const TIPOS_COMPONENTE = [
  { value: 'TELHA', label: 'Telhas' },
  { value: 'CUMEEIRA', label: 'Cumeeiras' },
  { value: 'RUFO_LATERAL', label: 'Rufos Laterais' },
  { value: 'RUFO_CAPA', label: 'Rufos Capa' },
  { value: 'CALHA', label: 'Calhas' },
  { value: 'MANTA_STARTER', label: 'Manta Starter' },
  { value: 'PREGO', label: 'Pregos' },
  { value: 'GRAMPO', label: 'Grampos' },
  { value: 'OSB', label: 'OSB' },
  { value: 'SUBCOBERTURA', label: 'Subcobertura' }
];

export function ItemAdicionarModal({ 
  open, 
  onOpenChange, 
  produtos, 
  onAdicionarItem 
}: ItemAdicionarModalProps) {
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [busca, setBusca] = useState('');
  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoShingleCompleto | null>(null);
  const [quantidade, setQuantidade] = useState<number>(1);
  const [dimensaoBase, setDimensaoBase] = useState<number>(1);

  const produtosFiltrados = produtos.filter(produto => {
    const matchTipo = !filtroTipo || produto.tipo_componente === filtroTipo;
    const matchBusca = !busca || 
      produto.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      produto.codigo.toLowerCase().includes(busca.toLowerCase());
    return matchTipo && matchBusca;
  });

  const calcularPreview = () => {
    if (!produtoSelecionado) return { quantidade: 0, valor: 0 };
    
    const quantidadeCalculada = dimensaoBase * (1.0 / produtoSelecionado.conteudo_unidade);
    const quantidadeComQuebra = quantidadeCalculada * (1 + produtoSelecionado.quebra_padrao / 100);
    const quantidadeFinal = Math.ceil(quantidadeComQuebra);
    const valor = quantidadeFinal * produtoSelecionado.preco_unitario;
    
    return { quantidade: quantidadeFinal, valor };
  };

  const handleAdicionar = () => {
    if (!produtoSelecionado) return;
    
    const quantidadeCalculada = dimensaoBase * (1.0 / produtoSelecionado.conteudo_unidade);
    const quantidadeComQuebra = quantidadeCalculada * (1 + produtoSelecionado.quebra_padrao / 100);
    const quantidadeFinal = Math.ceil(quantidadeComQuebra);
    
    const novoItem: ItemCalculadoShingle = {
      tipo_item: produtoSelecionado.tipo_componente,
      codigo: produtoSelecionado.codigo,
      descricao: produtoSelecionado.descricao,
      dimensao_base: dimensaoBase,
      unidade_dimensao: getUnidadeDimensao(produtoSelecionado.tipo_componente),
      fator_conversao: 1.0 / produtoSelecionado.conteudo_unidade,
      quebra_percentual: produtoSelecionado.quebra_padrao,
      quantidade_calculada: quantidadeCalculada,
      quantidade_final: quantidadeFinal,
      unidade_venda: produtoSelecionado.unidade_medida,
      preco_unitario: produtoSelecionado.preco_unitario,
      valor_total: quantidadeFinal * produtoSelecionado.preco_unitario
    };

    onAdicionarItem(novoItem);
    
    // Reset form
    setProdutoSelecionado(null);
    setQuantidade(1);
    setDimensaoBase(1);
    onOpenChange(false);
  };

  const getUnidadeDimensao = (tipoComponente: string): string => {
    switch (tipoComponente) {
      case 'TELHA':
      case 'OSB':
      case 'SUBCOBERTURA':
      case 'MANTA_STARTER':
        return 'm²';
      case 'CUMEEIRA':
      case 'RUFO_LATERAL':
      case 'RUFO_CAPA':
      case 'CALHA':
        return 'm';
      case 'PREGO':
      case 'GRAMPO':
        return 'kg';
      default:
        return 'un';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const preview = calcularPreview();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Item à Composição
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Componente</Label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  {TIPOS_COMPONENTE.map(tipo => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Código ou descrição..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Lista de produtos */}
          <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
            {produtosFiltrados.map(produto => (
              <div
                key={produto.id}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                  produtoSelecionado?.id === produto.id ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setProdutoSelecionado(produto)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {produto.tipo_componente}
                      </Badge>
                      <span className="text-sm font-medium text-muted-foreground">
                        {produto.codigo}
                      </span>
                    </div>
                    <p className="font-medium">{produto.descricao}</p>
                    <p className="text-sm text-muted-foreground">
                      Conteúdo: {produto.conteudo_unidade} {produto.unidade_medida}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(produto.preco_unitario)}</p>
                    <p className="text-xs text-muted-foreground">
                      Quebra: {produto.quebra_padrao}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Configuração do item */}
          {produtoSelecionado && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">Configurar Item Selecionado</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Dimensão Base ({getUnidadeDimensao(produtoSelecionado.tipo_componente)})
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={dimensaoBase}
                    onChange={(e) => setDimensaoBase(Number(e.target.value) || 1)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Preview do Cálculo</Label>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm">
                      Quantidade: <span className="font-medium">{preview.quantidade} {produtoSelecionado.unidade_medida}</span>
                    </p>
                    <p className="text-sm">
                      Valor Total: <span className="font-bold text-primary">{formatCurrency(preview.valor)}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAdicionar}
              disabled={!produtoSelecionado || dimensaoBase <= 0}
            >
              Adicionar Item
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}