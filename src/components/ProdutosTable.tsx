import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Calculator } from 'lucide-react';

interface Produto {
  codigo: string;
  descricao: string;
  quantidade: number;
  unidade: string;
  preco_unitario: number;
  total: number;
}

interface ProdutosTableProps {
  produtos: Produto[];
  valorFrete: number;
  valorTotal: number;
  onProdutosChange: (produtos: Produto[]) => void;
  onFreteChange: (frete: number) => void;
  readonly?: boolean;
  ocultarPrecosUnitarios?: boolean;
}

export function ProdutosTable({ 
  produtos, 
  valorFrete, 
  valorTotal, 
  onProdutosChange, 
  onFreteChange,
  readonly = false,
  ocultarPrecosUnitarios = false 
}: ProdutosTableProps) {
  const [editandoItem, setEditandoItem] = useState<string | null>(null);

  const atualizarProduto = (codigo: string, campo: string, valor: any) => {
    const novoProdutos = produtos.map(produto => {
      if (produto.codigo === codigo) {
        const produtoAtualizado = { ...produto, [campo]: valor };
        
        // Recalcular total se quantidade ou preço unitário mudaram
        if (campo === 'quantidade' || campo === 'preco_unitario') {
          produtoAtualizado.total = produtoAtualizado.quantidade * produtoAtualizado.preco_unitario;
        }
        
        return produtoAtualizado;
      }
      return produto;
    });
    
    onProdutosChange(novoProdutos);
  };

  const removerProduto = (codigo: string) => {
    const novoProdutos = produtos.filter(produto => produto.codigo !== codigo);
    onProdutosChange(novoProdutos);
  };

  const calcularSubtotal = () => {
    return produtos.reduce((acc, produto) => acc + produto.total, 0);
  };

  const calcularTotal = () => {
    return calcularSubtotal() + valorFrete;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Lista de Produtos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descrição</TableHead>
                {!ocultarPrecosUnitarios && <TableHead>Qtd</TableHead>}
                {!ocultarPrecosUnitarios && <TableHead>Unidade</TableHead>}
                {!ocultarPrecosUnitarios && <TableHead>Preço Unit.</TableHead>}
                <TableHead>Total</TableHead>
                {!readonly && <TableHead className="w-[100px]">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtos.map((produto) => (
                <TableRow key={produto.codigo}>
                  <TableCell>
                    <Badge variant="outline">{produto.codigo}</Badge>
                  </TableCell>
                  <TableCell>
                    {editandoItem === produto.codigo && !readonly ? (
                      <Input
                        value={produto.descricao}
                        onChange={(e) => atualizarProduto(produto.codigo, 'descricao', e.target.value)}
                        onBlur={() => setEditandoItem(null)}
                        autoFocus
                      />
                    ) : (
                      <span 
                        className={!readonly ? "cursor-pointer hover:bg-muted p-1 rounded" : ""}
                        onClick={() => !readonly && setEditandoItem(produto.codigo)}
                      >
                        {produto.descricao}
                      </span>
                    )}
                  </TableCell>
                  {!ocultarPrecosUnitarios && (
                    <TableCell>
                      {editandoItem === produto.codigo && !readonly ? (
                        <Input
                          type="number"
                          value={produto.quantidade}
                          onChange={(e) => atualizarProduto(produto.codigo, 'quantidade', parseFloat(e.target.value) || 0)}
                          onBlur={() => setEditandoItem(null)}
                          className="w-20"
                        />
                      ) : (
                        <span 
                          className={!readonly ? "cursor-pointer hover:bg-muted p-1 rounded" : ""}
                          onClick={() => !readonly && setEditandoItem(produto.codigo)}
                        >
                          {produto.quantidade}
                        </span>
                      )}
                    </TableCell>
                  )}
                  {!ocultarPrecosUnitarios && <TableCell>{produto.unidade}</TableCell>}
                  {!ocultarPrecosUnitarios && (
                    <TableCell>
                      {editandoItem === produto.codigo && !readonly ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={produto.preco_unitario}
                          onChange={(e) => atualizarProduto(produto.codigo, 'preco_unitario', parseFloat(e.target.value) || 0)}
                          onBlur={() => setEditandoItem(null)}
                          className="w-24"
                        />
                      ) : (
                        <span 
                          className={!readonly ? "cursor-pointer hover:bg-muted p-1 rounded" : ""}
                          onClick={() => !readonly && setEditandoItem(produto.codigo)}
                        >
                          R$ {produto.preco_unitario.toFixed(2)}
                        </span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="font-medium">
                    R$ {produto.total.toFixed(2)}
                  </TableCell>
                  {!readonly && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditandoItem(produto.codigo)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removerProduto(produto.codigo)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Resumo de valores */}
        <div className="mt-4 space-y-2 max-w-md ml-auto">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>R$ {calcularSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Frete:</span>
            {!readonly ? (
              <Input
                type="number"
                step="0.01"
                value={valorFrete}
                onChange={(e) => onFreteChange(parseFloat(e.target.value) || 0)}
                className="w-24 text-right"
              />
            ) : (
              <span>R$ {valorFrete.toFixed(2)}</span>
            )}
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>R$ {calcularTotal().toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}