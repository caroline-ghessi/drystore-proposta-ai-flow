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
import { Edit, Plus, Search, Droplets } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProdutoImpermeabilizacao {
  id: string;
  categoria: string;
  codigo: string;
  nome: string;
  tipo: string;
  consumo_m2: number;
  preco_unitario: number;
  quantidade_unidade_venda: number;
  unidade_medida: string;
  unidade_venda: string;
  quebra_padrao: number | null;
  fator_multiplicador: number | null;
  aplicacoes: string[] | null;
  normas: string[] | null;
  ativo: boolean | null;
}

const CATEGORIAS = [
  { value: 'IMPERMEABILIZANTE', label: 'Impermeabilizantes' },
  { value: 'PRIMER', label: 'Primers' },
  { value: 'ADITIVO', label: 'Aditivos' },
  { value: 'REVESTIMENTO', label: 'Revestimentos' }
];

const TIPOS = [
  { value: 'CIMENTICIO', label: 'Cimentício' },
  { value: 'ASFALTICO', label: 'Asfáltico' },
  { value: 'ACRILICO', label: 'Acrílico' },
  { value: 'POLIURETANO', label: 'Poliuretano' },
  { value: 'TELA', label: 'Tela' },
  { value: 'PRIMER', label: 'Primer' }
];

export const ImpermeabilizacaoManager = () => {
  const [produtos, setProdutos] = useState<ProdutoImpermeabilizacao[]>([]);
  const [filteredProdutos, setFilteredProdutos] = useState<ProdutoImpermeabilizacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("all");
  const [tipoFilter, setTipoFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingProduto, setEditingProduto] = useState<ProdutoImpermeabilizacao | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProdutos();
  }, []);

  useEffect(() => {
    filterProdutos();
  }, [produtos, searchTerm, categoriaFilter, tipoFilter, statusFilter]);

  const fetchProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos_impermeabilizacao')
        .select('*')
        .order('categoria', { ascending: true })
        .order('codigo', { ascending: true });
      
      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos de impermeabilização",
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
        produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoriaFilter !== "all") {
      filtered = filtered.filter(produto => produto.categoria === categoriaFilter);
    }
    
    if (tipoFilter !== "all") {
      filtered = filtered.filter(produto => produto.tipo === tipoFilter);
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(produto => 
        statusFilter === "ativo" ? produto.ativo : !produto.ativo
      );
    }
    
    setFilteredProdutos(filtered);
  };

  const handleSave = async (produtoData: Partial<ProdutoImpermeabilizacao>) => {
    try {
      if (editingProduto) {
        const { error } = await supabase
          .from('produtos_impermeabilizacao')
          .update(produtoData)
          .eq('id', editingProduto.id);
        
        if (error) throw error;
        toast({ title: "Sucesso", description: "Produto atualizado com sucesso" });
      } else {
        const { error } = await supabase
          .from('produtos_impermeabilizacao')
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

  const toggleStatus = async (produto: ProdutoImpermeabilizacao) => {
    try {
      const { error } = await supabase
        .from('produtos_impermeabilizacao')
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

  const openEditDialog = (produto?: ProdutoImpermeabilizacao) => {
    setEditingProduto(produto || null);
    setIsDialogOpen(true);
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'IMPERMEABILIZANTE': return 'default';
      case 'PRIMER': return 'secondary';
      case 'ADITIVO': return 'outline';
      case 'REVESTIMENTO': return 'destructive';
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
            <Droplets className="h-5 w-5" />
            Produtos Impermeabilização
          </CardTitle>
          <CardDescription>
            Gerencie impermeabilizantes, primers, aditivos e revestimentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código ou nome..."
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
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos tipos</SelectItem>
                {TIPOS.map(tipo => (
                  <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
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
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Consumo/m²</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProdutos.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell className="font-medium">{produto.codigo}</TableCell>
                    <TableCell>{produto.nome}</TableCell>
                    <TableCell>
                      <Badge variant={getCategoriaColor(produto.categoria)}>
                        {produto.categoria}
                      </Badge>
                    </TableCell>
                    <TableCell>{produto.tipo}</TableCell>
                    <TableCell>{produto.consumo_m2} {produto.unidade_medida}/m²</TableCell>
                    <TableCell>R$ {produto.preco_unitario.toFixed(2)}</TableCell>
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
  produto: ProdutoImpermeabilizacao | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<ProdutoImpermeabilizacao>) => void;
}

const ProdutoEditDialog = ({ produto, open, onOpenChange, onSave }: ProdutoEditDialogProps) => {
  const [formData, setFormData] = useState<Partial<ProdutoImpermeabilizacao>>({});
  const [aplicacoesText, setAplicacoesText] = useState("");
  const [normasText, setNormasText] = useState("");

  useEffect(() => {
    if (produto) {
      setFormData(produto);
      setAplicacoesText(produto.aplicacoes?.join(', ') || '');
      setNormasText(produto.normas?.join(', ') || '');
    } else {
      setFormData({
        categoria: 'IMPERMEABILIZANTE',
        codigo: '',
        nome: '',
        tipo: 'CIMENTICIO',
        consumo_m2: 1,
        preco_unitario: 0,
        quantidade_unidade_venda: 1,
        unidade_medida: 'kg',
        unidade_venda: 'bd',
        quebra_padrao: 5,
        fator_multiplicador: 1,
        aplicacoes: [],
        normas: [],
        ativo: true
      });
      setAplicacoesText('');
      setNormasText('');
    }
  }, [produto]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const aplicacoes = aplicacoesText.split(',').map(s => s.trim()).filter(s => s);
    const normas = normasText.split(',').map(s => s.trim()).filter(s => s);
    
    onSave({
      ...formData,
      aplicacoes: aplicacoes.length > 0 ? aplicacoes : null,
      normas: normas.length > 0 ? normas : null
    });
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
                value={formData.categoria || 'IMPERMEABILIZANTE'} 
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
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome || ''}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo *</Label>
              <Select 
                value={formData.tipo || 'CIMENTICIO'} 
                onValueChange={(value) => setFormData({...formData, tipo: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map(tipo => (
                    <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="consumo_m2">Consumo por m² *</Label>
              <Input
                id="consumo_m2"
                type="number"
                step="0.01"
                value={formData.consumo_m2 || ''}
                onChange={(e) => setFormData({...formData, consumo_m2: parseFloat(e.target.value)})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="preco_unitario">Preço *</Label>
              <Input
                id="preco_unitario"
                type="number"
                step="0.01"
                value={formData.preco_unitario || ''}
                onChange={(e) => setFormData({...formData, preco_unitario: parseFloat(e.target.value)})}
                required
              />
            </div>
            <div>
              <Label htmlFor="quantidade_unidade_venda">Qtd/Unidade *</Label>
              <Input
                id="quantidade_unidade_venda"
                type="number"
                step="0.01"
                value={formData.quantidade_unidade_venda || ''}
                onChange={(e) => setFormData({...formData, quantidade_unidade_venda: parseFloat(e.target.value)})}
                required
              />
            </div>
            <div>
              <Label htmlFor="unidade_medida">Un. Medida *</Label>
              <Select 
                value={formData.unidade_medida || 'kg'} 
                onValueChange={(value) => setFormData({...formData, unidade_medida: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="l">l</SelectItem>
                  <SelectItem value="m²">m²</SelectItem>
                  <SelectItem value="m">m</SelectItem>
                  <SelectItem value="un">un</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="unidade_venda">Un. Venda *</Label>
              <Select 
                value={formData.unidade_venda || 'bd'} 
                onValueChange={(value) => setFormData({...formData, unidade_venda: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bd">bd</SelectItem>
                  <SelectItem value="gl">gl</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="l">l</SelectItem>
                  <SelectItem value="m²">m²</SelectItem>
                  <SelectItem value="un">un</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quebra_padrao">Quebra Padrão (%)</Label>
              <Input
                id="quebra_padrao"
                type="number"
                step="0.1"
                value={formData.quebra_padrao || ''}
                onChange={(e) => setFormData({...formData, quebra_padrao: e.target.value ? parseFloat(e.target.value) : null})}
              />
            </div>
            <div>
              <Label htmlFor="fator_multiplicador">Fator Multiplicador</Label>
              <Input
                id="fator_multiplicador"
                type="number"
                step="0.01"
                value={formData.fator_multiplicador || ''}
                onChange={(e) => setFormData({...formData, fator_multiplicador: e.target.value ? parseFloat(e.target.value) : null})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="aplicacoes">Aplicações (separadas por vírgula)</Label>
            <Textarea
              id="aplicacoes"
              value={aplicacoesText}
              onChange={(e) => setAplicacoesText(e.target.value)}
              placeholder="Ex: Lajes, Fundações, Piscinas"
            />
          </div>

          <div>
            <Label htmlFor="normas">Normas (separadas por vírgula)</Label>
            <Textarea
              id="normas"
              value={normasText}
              onChange={(e) => setNormasText(e.target.value)}
              placeholder="Ex: NBR 9575, NBR 9574"
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