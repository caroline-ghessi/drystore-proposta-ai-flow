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

interface ProdutoDrywall {
  id: string;
  categoria: string;
  codigo: string;
  descricao: string;
  tipo_placa: string | null;
  espessura: number | null;
  unidade_medida: string;
  peso_unitario: number | null;
  preco_unitario: number | null;
  ativo: boolean | null;
}

const CATEGORIAS = [
  { value: 'PLACA', label: 'Placas' },
  { value: 'PERFIL', label: 'Perfis' },
  { value: 'ISOLAMENTO', label: 'Isolamento' },
  { value: 'ACESSORIO', label: 'Acessórios' },
  { value: 'ACABAMENTO', label: 'Acabamento' }
];

const TIPOS_PLACA = [
  { value: 'ST', label: 'Standard (ST)' },
  { value: 'RU', label: 'Resistente à Umidade (RU)' },
  { value: 'RF', label: 'Resistente ao Fogo (RF)' },
  { value: 'PERFORMA', label: 'Performa (Acústica)' },
  { value: 'GLASROC', label: 'Glasroc X' }
];

export const DrywallManager = () => {
  const [produtos, setProdutos] = useState<ProdutoDrywall[]>([]);
  const [filteredProdutos, setFilteredProdutos] = useState<ProdutoDrywall[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingProduto, setEditingProduto] = useState<ProdutoDrywall | null>(null);
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
        .from('produtos_drywall')
        .select('*')
        .order('categoria', { ascending: true })
        .order('codigo', { ascending: true });
      
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
        produto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoriaFilter !== "all") {
      filtered = filtered.filter(produto => produto.categoria === categoriaFilter);
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(produto => 
        statusFilter === "ativo" ? produto.ativo : !produto.ativo
      );
    }
    
    setFilteredProdutos(filtered);
  };

  const handleSave = async (produtoData: Partial<ProdutoDrywall>) => {
    try {
      if (editingProduto) {
        const { error } = await supabase
          .from('produtos_drywall')
          .update(produtoData)
          .eq('id', editingProduto.id);
        
        if (error) throw error;
        toast({ title: "Sucesso", description: "Produto atualizado com sucesso" });
      } else {
        const { error } = await supabase
          .from('produtos_drywall')
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

  const toggleStatus = async (produto: ProdutoDrywall) => {
    try {
      const { error } = await supabase
        .from('produtos_drywall')
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

  const openEditDialog = (produto?: ProdutoDrywall) => {
    setEditingProduto(produto || null);
    setIsDialogOpen(true);
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'PLACA': return 'default';
      case 'PERFIL': return 'secondary';
      case 'ISOLAMENTO': return 'outline';
      case 'ACESSORIO': return 'destructive';
      case 'ACABAMENTO': return 'default';
      default: return 'secondary';
    }
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
            Produtos Drywall
          </CardTitle>
          <CardDescription>
            Gerencie placas, perfis, isolamentos e acessórios para drywall
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
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo Placa</TableHead>
                  <TableHead>Espessura</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProdutos.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-medium">{produto.codigo}</TableCell>
                    <TableCell>
                      <Badge variant={getCategoriaColor(produto.categoria)}>
                        {produto.categoria}
                      </Badge>
                    </TableCell>
                    <TableCell>{produto.descricao}</TableCell>
                    <TableCell>{produto.tipo_placa || '-'}</TableCell>
                    <TableCell>
                      {produto.espessura ? `${produto.espessura}mm` : '-'}
                    </TableCell>
                    <TableCell>
                      {produto.preco_unitario ? `R$ ${produto.preco_unitario.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={produto.ativo || false}
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
  produto: ProdutoDrywall | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<ProdutoDrywall>) => void;
}

const ProdutoEditDialog = ({ produto, open, onOpenChange, onSave }: ProdutoEditDialogProps) => {
  const [formData, setFormData] = useState<Partial<ProdutoDrywall>>({});

  useEffect(() => {
    if (produto) {
      setFormData(produto);
    } else {
      setFormData({
        categoria: 'PLACA',
        codigo: '',
        descricao: '',
        tipo_placa: null,
        espessura: null,
        unidade_medida: 'm²',
        peso_unitario: null,
        preco_unitario: 0,
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
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                value={formData.codigo || ''}
                onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="categoria">Categoria *</Label>
              <Select 
                value={formData.categoria || 'PLACA'} 
                onValueChange={(value) => setFormData({...formData, categoria: value})}
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
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo_placa">Tipo Placa</Label>
              <Select 
                value={formData.tipo_placa || ''} 
                onValueChange={(value) => setFormData({...formData, tipo_placa: value || null})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Não se aplica</SelectItem>
                  {TIPOS_PLACA.map(tipo => (
                    <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="espessura">Espessura (mm)</Label>
              <Input
                id="espessura"
                type="number"
                step="0.1"
                value={formData.espessura || ''}
                onChange={(e) => setFormData({...formData, espessura: e.target.value ? parseFloat(e.target.value) : null})}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="unidade_medida">Unidade *</Label>
              <Select 
                value={formData.unidade_medida || 'm²'} 
                onValueChange={(value) => setFormData({...formData, unidade_medida: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m²">m²</SelectItem>
                  <SelectItem value="m">m</SelectItem>
                  <SelectItem value="un">un</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="cto">cto</SelectItem>
                  <SelectItem value="rl">rl</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="peso_unitario">Peso Unitário (kg)</Label>
              <Input
                id="peso_unitario"
                type="number"
                step="0.01"
                value={formData.peso_unitario || ''}
                onChange={(e) => setFormData({...formData, peso_unitario: e.target.value ? parseFloat(e.target.value) : null})}
              />
            </div>
            <div>
              <Label htmlFor="preco_unitario">Preço Unitário</Label>
              <Input
                id="preco_unitario"
                type="number"
                step="0.01"
                value={formData.preco_unitario || ''}
                onChange={(e) => setFormData({...formData, preco_unitario: e.target.value ? parseFloat(e.target.value) : null})}
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