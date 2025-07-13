import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Plus, Search, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProdutoTelha {
  id: string;
  categoria: string;
  nome: string;
  fabricante: string | null;
  preco_unitario: number | null;
  especificacoes_tecnicas: any | null;
  unidade: string;
  ativo: boolean;
}

export const TelhasManager = () => {
  const [produtos, setProdutos] = useState<ProdutoTelha[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingProduto, setEditingProduto] = useState<ProdutoTelha | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('categoria', 'telhas')
        .order('nome', { ascending: true });
      
      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos de telhas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProdutos = useMemo(() => {
    let filtered = produtos;

    if (searchTerm) {
      filtered = filtered.filter(produto =>
        produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.fabricante?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(produto => 
        statusFilter === "ativo" ? produto.ativo : !produto.ativo
      );
    }

    return filtered;
  }, [produtos, searchTerm, statusFilter]);

  const handleSave = async (produtoData: Partial<ProdutoTelha>) => {
    try {
      const dataToSave = {
        ...produtoData,
        categoria: 'telhas'
      };

      if (editingProduto) {
        const { error } = await supabase
          .from('produtos')
          .update(dataToSave)
          .eq('id', editingProduto.id);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Produto atualizado com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('produtos')
          .insert([dataToSave as any]);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso", 
          description: "Produto criado com sucesso"
        });
      }

      setIsDialogOpen(false);
      setEditingProduto(null);
      fetchProdutos();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar produto",
        variant: "destructive"
      });
    }
  };

  const toggleStatus = async (produto: ProdutoTelha) => {
    try {
      const { error } = await supabase
        .from('produtos')
        .update({ ativo: !produto.ativo })
        .eq('id', produto.id);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: `Produto ${!produto.ativo ? 'ativado' : 'desativado'} com sucesso`
      });
      
      fetchProdutos();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status do produto",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (produto?: ProdutoTelha) => {
    setEditingProduto(produto || null);
    setIsDialogOpen(true);
  };

  const exportarCSV = () => {
    const headers = ['Nome', 'Fabricante', 'Preço', 'Unidade', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredProdutos.map(p => [
        p.nome,
        p.fabricante || '',
        p.preco_unitario || '',
        p.unidade,
        p.ativo ? 'Ativo' : 'Inativo'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'produtos-telhas.csv';
    a.click();
  };

  if (loading) {
    return <div className="p-6">Carregando produtos de telhas...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Telhas</CardTitle>
        <CardDescription>
          Gerencie o catálogo de produtos de telhas convencionais
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Controles */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou fabricante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-80"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="inativo">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={exportarCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button onClick={() => openEditDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{produtos.length}</div>
              <p className="text-xs text-muted-foreground">Total de produtos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {produtos.filter(p => p.ativo).length}
              </div>
              <p className="text-xs text-muted-foreground">Produtos ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {produtos.filter(p => !p.ativo).length}
              </div>
              <p className="text-xs text-muted-foreground">Produtos inativos</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Fabricante</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProdutos.map((produto) => (
                <TableRow key={produto.id}>
                  <TableCell className="font-medium">{produto.nome}</TableCell>
                  <TableCell>{produto.fabricante || '-'}</TableCell>
                  <TableCell>
                    {produto.preco_unitario 
                      ? `R$ ${produto.preco_unitario.toFixed(2)}`
                      : '-'
                    }
                  </TableCell>
                  <TableCell>{produto.unidade}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={produto.ativo ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => toggleStatus(produto)}
                    >
                      {produto.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(produto)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Dialog de Edição */}
        <ProdutoEditDialog
          produto={editingProduto}
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingProduto(null);
          }}
          onSave={handleSave}
        />
      </CardContent>
    </Card>
  );
};

interface ProdutoEditDialogProps {
  produto: ProdutoTelha | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ProdutoTelha>) => void;
}

const ProdutoEditDialog = ({ produto, isOpen, onClose, onSave }: ProdutoEditDialogProps) => {
  const [formData, setFormData] = useState<Partial<ProdutoTelha>>({
    categoria: 'telhas',
    nome: '',
    fabricante: '',
    preco_unitario: 0,
    unidade: 'un',
    ativo: true,
    especificacoes_tecnicas: {}
  });

  useEffect(() => {
    if (produto) {
      setFormData(produto);
    } else {
      setFormData({
        categoria: 'telhas',
        nome: '',
        fabricante: '',
        preco_unitario: 0,
        unidade: 'un',
        ativo: true,
        especificacoes_tecnicas: {}
      });
    }
  }, [produto]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {produto ? 'Editar Produto' : 'Novo Produto de Telha'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="fabricante">Fabricante</Label>
              <Input
                id="fabricante"
                value={formData.fabricante || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, fabricante: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="preco">Preço Unitário</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                value={formData.preco_unitario || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, preco_unitario: Number(e.target.value) }))}
              />
            </div>

            <div>
              <Label htmlFor="unidade">Unidade</Label>
              <Select 
                value={formData.unidade} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, unidade: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="un">Unidade</SelectItem>
                  <SelectItem value="m²">m²</SelectItem>
                  <SelectItem value="pç">Peça</SelectItem>
                  <SelectItem value="cx">Caixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
            />
            <Label htmlFor="ativo">Produto ativo</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {produto ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};