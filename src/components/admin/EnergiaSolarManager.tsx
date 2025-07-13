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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Plus, Search, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProdutoEnergiaSolar {
  id: string;
  categoria: string;
  nome: string;
  fabricante: string | null;
  potencia_wp: number | null;
  eficiencia: number | null;
  tensao_v: number | null;
  corrente_a: number | null;
  dimensoes: any | null;
  peso_kg: number | null;
  garantia_anos: number | null;
  preco_unitario: number | null;
  especificacoes_tecnicas: any | null;
  compatibilidades: any | null;
  unidade: string;
  ativo: boolean;
}

const CATEGORIAS = [
  { value: 'painel-solar', label: 'Painéis Solares' },
  { value: 'inversor', label: 'Inversores' },
  { value: 'estrutura', label: 'Estruturas' },
  { value: 'cabo', label: 'Cabos' },
  { value: 'protecao', label: 'Proteções' },
  { value: 'acessorio', label: 'Acessórios' }
];

export const EnergiaSolarManager = () => {
  const [produtos, setProdutos] = useState<ProdutoEnergiaSolar[]>([]);
  const [filteredProdutos, setFilteredProdutos] = useState<ProdutoEnergiaSolar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingProduto, setEditingProduto] = useState<ProdutoEnergiaSolar | null>(null);
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
        .from('produtos')
        .select('*')
        .order('categoria', { ascending: true })
        .order('nome', { ascending: true });
      
      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos de energia solar",
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
        produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (produto.fabricante && produto.fabricante.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const handleSave = async (produtoData: Partial<ProdutoEnergiaSolar>) => {
    try {
      if (editingProduto) {
        const { error } = await supabase
          .from('produtos')
          .update(produtoData)
          .eq('id', editingProduto.id);
        
        if (error) throw error;
        toast({ title: "Sucesso", description: "Produto atualizado com sucesso" });
      } else {
        const { error } = await supabase
          .from('produtos')
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

  const toggleStatus = async (produto: ProdutoEnergiaSolar) => {
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

  const openEditDialog = (produto?: ProdutoEnergiaSolar) => {
    setEditingProduto(produto || null);
    setIsDialogOpen(true);
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'painel-solar': return 'default';
      case 'inversor': return 'secondary';
      case 'estrutura': return 'outline';
      case 'cabo': return 'destructive';
      case 'protecao': return 'default';
      case 'acessorio': return 'secondary';
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
            <Sun className="h-5 w-5" />
            Produtos Energia Solar
          </CardTitle>
          <CardDescription>
            Gerencie painéis, inversores, estruturas e acessórios para energia solar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou fabricante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                {CATEGORIAS.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="inativo">Inativos</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => openEditDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Fabricante</TableHead>
                  <TableHead>Potência</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProdutos.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-medium">{produto.nome}</TableCell>
                    <TableCell>
                      <Badge variant={getCategoriaColor(produto.categoria)}>
                        {produto.categoria.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{produto.fabricante || '-'}</TableCell>
                    <TableCell>
                      {produto.potencia_wp ? `${produto.potencia_wp}W` : '-'}
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
  produto: ProdutoEnergiaSolar | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<ProdutoEnergiaSolar>) => void;
}

const ProdutoEditDialog = ({ produto, open, onOpenChange, onSave }: ProdutoEditDialogProps) => {
  const [formData, setFormData] = useState<Partial<ProdutoEnergiaSolar>>({});

  useEffect(() => {
    if (produto) {
      setFormData(produto);
    } else {
      setFormData({
        categoria: 'painel-solar',
        nome: '',
        fabricante: '',
        potencia_wp: null,
        eficiencia: null,
        tensao_v: null,
        corrente_a: null,
        dimensoes: null,
        peso_kg: null,
        garantia_anos: null,
        preco_unitario: 0,
        especificacoes_tecnicas: null,
        compatibilidades: null,
        unidade: 'un',
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {produto ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome || ''}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="categoria">Categoria *</Label>
              <Select 
                value={formData.categoria || 'painel-solar'} 
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fabricante">Fabricante</Label>
              <Input
                id="fabricante"
                value={formData.fabricante || ''}
                onChange={(e) => setFormData({...formData, fabricante: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="unidade">Unidade *</Label>
              <Select 
                value={formData.unidade || 'un'} 
                onValueChange={(value) => setFormData({...formData, unidade: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="un">un</SelectItem>
                  <SelectItem value="m">m</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="kit">kit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="potencia_wp">Potência (W)</Label>
              <Input
                id="potencia_wp"
                type="number"
                step="1"
                value={formData.potencia_wp || ''}
                onChange={(e) => setFormData({...formData, potencia_wp: e.target.value ? parseInt(e.target.value) : null})}
              />
            </div>
            <div>
              <Label htmlFor="eficiencia">Eficiência (%)</Label>
              <Input
                id="eficiencia"
                type="number"
                step="0.1"
                value={formData.eficiencia || ''}
                onChange={(e) => setFormData({...formData, eficiencia: e.target.value ? parseFloat(e.target.value) : null})}
              />
            </div>
            <div>
              <Label htmlFor="tensao_v">Tensão (V)</Label>
              <Input
                id="tensao_v"
                type="number"
                step="0.1"
                value={formData.tensao_v || ''}
                onChange={(e) => setFormData({...formData, tensao_v: e.target.value ? parseFloat(e.target.value) : null})}
              />
            </div>
            <div>
              <Label htmlFor="corrente_a">Corrente (A)</Label>
              <Input
                id="corrente_a"
                type="number"
                step="0.1"
                value={formData.corrente_a || ''}
                onChange={(e) => setFormData({...formData, corrente_a: e.target.value ? parseFloat(e.target.value) : null})}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="peso_kg">Peso (kg)</Label>
              <Input
                id="peso_kg"
                type="number"
                step="0.1"
                value={formData.peso_kg || ''}
                onChange={(e) => setFormData({...formData, peso_kg: e.target.value ? parseFloat(e.target.value) : null})}
              />
            </div>
            <div>
              <Label htmlFor="garantia_anos">Garantia (anos)</Label>
              <Input
                id="garantia_anos"
                type="number"
                value={formData.garantia_anos || ''}
                onChange={(e) => setFormData({...formData, garantia_anos: e.target.value ? parseInt(e.target.value) : null})}
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

          <div>
            <Label htmlFor="especificacoes_tecnicas">Especificações Técnicas (JSON)</Label>
            <Textarea
              id="especificacoes_tecnicas"
              value={formData.especificacoes_tecnicas ? JSON.stringify(formData.especificacoes_tecnicas, null, 2) : ''}
              onChange={(e) => {
                try {
                  const json = e.target.value ? JSON.parse(e.target.value) : null;
                  setFormData({...formData, especificacoes_tecnicas: json});
                } catch {
                  // Ignore invalid JSON
                }
              }}
              placeholder='{"certificacoes": ["IEC", "INMETRO"], "tipo_celula": "Monocristalina"}'
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="compatibilidades">Compatibilidades (JSON)</Label>
            <Textarea
              id="compatibilidades"
              value={formData.compatibilidades ? JSON.stringify(formData.compatibilidades, null, 2) : ''}
              onChange={(e) => {
                try {
                  const json = e.target.value ? JSON.parse(e.target.value) : null;
                  setFormData({...formData, compatibilidades: json});
                } catch {
                  // Ignore invalid JSON
                }
              }}
              placeholder='{"inversores": ["INV001", "INV002"], "estruturas": ["EST001"]}'
              rows={3}
            />
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