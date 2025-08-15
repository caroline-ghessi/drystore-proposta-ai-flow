import { useState, useEffect } from "react";
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
import { Edit, Plus, Search, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProdutoDrywallMestre {
  id: string;
  codigo_funcao: string;
  categoria_funcao: string;
  descricao: string;
  especificacao: string;
  preco_unitario: number;
  peso_unitario: number;
  unidade_comercial: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

const CATEGORIAS = [
  { value: 'VEDAÇÃO', label: 'Vedação' },
  { value: 'ESTRUTURA', label: 'Estrutura' },
  { value: 'FIXAÇÃO', label: 'Fixação' },
  { value: 'ACABAMENTO', label: 'Acabamento' },
  { value: 'ISOLAMENTO', label: 'Isolamento' },
];

const UNIDADES_COMERCIAIS = [
  { value: 'un', label: 'Unidade' },
  { value: 'barra', label: 'Barra' },
  { value: 'cx-1000', label: 'Caixa (1000 un)' },
  { value: 'rolo', label: 'Rolo' },
  { value: 'saco-20kg', label: 'Saco (20kg)' },
];

export const DrywallManager = () => {
  const [produtos, setProdutos] = useState<ProdutoDrywallMestre[]>([]);
  const [filteredProdutos, setFilteredProdutos] = useState<ProdutoDrywallMestre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingProduto, setEditingProduto] = useState<ProdutoDrywallMestre | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProdutos();
  }, []);

  useEffect(() => {
    filterProdutos();
  }, [produtos, searchTerm, categoriaFilter, statusFilter]);

  const fetchProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos_drywall_mestre')
        .select('*')
        .order('categoria_funcao', { ascending: true })
        .order('codigo_funcao', { ascending: true });
      
      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos drywall",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProdutos = () => {
    let filtered = produtos;
    
    if (searchTerm) {
      filtered = filtered.filter(produto =>
        produto.codigo_funcao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoriaFilter !== "all") {
      filtered = filtered.filter(produto => produto.categoria_funcao === categoriaFilter);
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(produto => 
        statusFilter === "ativo" ? produto.ativo : !produto.ativo
      );
    }
    
    setFilteredProdutos(filtered);
  };

  const handleSave = async (produtoData: Partial<ProdutoDrywallMestre>) => {
    try {
      if (editingProduto) {
        const { error } = await supabase
          .from('produtos_drywall_mestre')
          .update(produtoData)
          .eq('id', editingProduto.id);
        
        if (error) throw error;
        toast({ title: "Sucesso", description: "Produto atualizado com sucesso" });
      } else {
        const { error } = await supabase
          .from('produtos_drywall_mestre')
          .insert([produtoData as any]);
        
        if (error) throw error;
        toast({ title: "Sucesso", description: "Produto criado com sucesso" });
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

  const toggleStatus = async (produto: ProdutoDrywallMestre) => {
    try {
      const { error } = await supabase
        .from('produtos_drywall_mestre')
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

  const openEditDialog = (produto?: ProdutoDrywallMestre) => {
    setEditingProduto(produto || null);
    setIsDialogOpen(true);
  };

  const getCategoriaColor = (categoria: string) => {
    const colors = {
      'VEDAÇÃO': 'bg-blue-100 text-blue-800',
      'ESTRUTURA': 'bg-green-100 text-green-800',
      'FIXAÇÃO': 'bg-yellow-100 text-yellow-800',
      'ACABAMENTO': 'bg-purple-100 text-purple-800',
      'ISOLAMENTO': 'bg-orange-100 text-orange-800',
    };
    return colors[categoria as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Produtos Drywall Mestre
          </CardTitle>
          <CardDescription>
            Gerencie produtos para cálculos de orçamento drywall (integração com função SQL)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {CATEGORIAS.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="inativo">Inativos</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => openEditDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Especificação</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Preço Unit.</TableHead>
                  <TableHead>Peso Unit.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProdutos.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-medium">{produto.codigo_funcao}</TableCell>
                    <TableCell>{produto.descricao}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{produto.especificacao}</TableCell>
                    <TableCell>
                      <Badge className={getCategoriaColor(produto.categoria_funcao)}>
                        {produto.categoria_funcao}
                      </Badge>
                    </TableCell>
                    <TableCell>{produto.unidade_comercial}</TableCell>
                    <TableCell>R$ {produto.preco_unitario.toFixed(2)}</TableCell>
                    <TableCell>{produto.peso_unitario.toFixed(2)} kg</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={produto.ativo}
                          onCheckedChange={() => toggleStatus(produto)}
                        />
                        <span className="text-sm">
                          {produto.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
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
        </CardContent>
      </Card>

      <ProdutoEditDialog
        produto={editingProduto}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
      />
    </div>
  );
};

interface ProdutoEditDialogProps {
  produto: ProdutoDrywallMestre | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<ProdutoDrywallMestre>) => void;
}

const ProdutoEditDialog = ({ produto, open, onOpenChange, onSave }: ProdutoEditDialogProps) => {
  const [formData, setFormData] = useState<Partial<ProdutoDrywallMestre>>({});

  useEffect(() => {
    if (produto) {
      setFormData(produto);
    } else {
      setFormData({
        codigo_funcao: '',
        descricao: '',
        especificacao: '',
        categoria_funcao: 'VEDAÇÃO',
        unidade_comercial: 'un',
        preco_unitario: 0,
        peso_unitario: 0,
        ativo: true
      });
    }
  }, [produto]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {produto ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="codigo_funcao">Código Função *</Label>
              <Input
                id="codigo_funcao"
                value={formData.codigo_funcao || ''}
                onChange={(e) => setFormData({...formData, codigo_funcao: e.target.value})}
                placeholder="Ex: DRY-ST-12.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="categoria_funcao">Categoria *</Label>
              <Select 
                value={formData.categoria_funcao || 'VEDAÇÃO'} 
                onValueChange={(value) => setFormData({...formData, categoria_funcao: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              value={formData.descricao || ''}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              placeholder="Descrição do produto"
              required
            />
          </div>

          <div>
            <Label htmlFor="especificacao">Especificação *</Label>
            <Input
              id="especificacao"
              value={formData.especificacao || ''}
              onChange={(e) => setFormData({...formData, especificacao: e.target.value})}
              placeholder="Especificação técnica detalhada"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="unidade_comercial">Unidade *</Label>
              <Select 
                value={formData.unidade_comercial || 'un'} 
                onValueChange={(value) => setFormData({...formData, unidade_comercial: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIDADES_COMERCIAIS.map(unidade => (
                    <SelectItem key={unidade.value} value={unidade.value}>{unidade.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="preco_unitario">Preço Unitário *</Label>
              <Input
                id="preco_unitario"
                type="number"
                step="0.01"
                value={formData.preco_unitario || ''}
                onChange={(e) => setFormData({...formData, preco_unitario: e.target.value ? parseFloat(e.target.value) : 0})}
                required
              />
            </div>
            <div>
              <Label htmlFor="peso_unitario">Peso Unitário (kg) *</Label>
              <Input
                id="peso_unitario"
                type="number"
                step="0.001"
                value={formData.peso_unitario || ''}
                onChange={(e) => setFormData({...formData, peso_unitario: e.target.value ? parseFloat(e.target.value) : 0})}
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.ativo || false}
              onCheckedChange={(checked) => setFormData({...formData, ativo: checked})}
            />
            <Label>Produto ativo</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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