import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Search, Package, Wrench, Shield, Home, DollarSign } from "lucide-react";

interface ProdutoShingle {
  id: string;
  tipo_componente: string;
  codigo: string;
  linha: string;
  descricao: string;
  cor?: string;
  unidade_medida: string;
  conteudo_unidade: number;
  quebra_padrao: number;
  preco_unitario: number;
  peso_unitario?: number;
  especificacoes_tecnicas?: any;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

const TIPOS_COMPONENTE = [
  { value: 'TELHA', label: 'Telhas', icon: Home, category: 'Cobertura' },
  { value: 'OSB', label: 'OSB (Base)', icon: Package, category: 'Base Estrutural' },
  { value: 'SUBCOBERTURA', label: 'Subcobertura', icon: Shield, category: 'Impermeabilização' },
  { value: 'MANTA_STARTER', label: 'Manta Starter', icon: Shield, category: 'Impermeabilização' },
  { value: 'CUMEEIRA', label: 'Cumeeiras', icon: Home, category: 'Acabamento' },
  { value: 'VENTILACAO', label: 'Ventilação', icon: Home, category: 'Acabamento' },
  { value: 'RUFO_LATERAL', label: 'Rufo Lateral', icon: Wrench, category: 'Acabamento' },
  { value: 'RUFO_CAPA', label: 'Rufo Capa', icon: Wrench, category: 'Acabamento' },
  { value: 'CALHA', label: 'Calhas', icon: Wrench, category: 'Sistema de Águas' },
  { value: 'PREGO', label: 'Pregos', icon: Wrench, category: 'Fixação' },
  { value: 'GRAMPO', label: 'Grampos', icon: Wrench, category: 'Fixação' },
  { value: 'SELANTE', label: 'Selantes', icon: Shield, category: 'Vedação' },
  { value: 'FLASH', label: 'Flash Tape', icon: Shield, category: 'Vedação' }
];

const CATEGORIAS = [
  'Todos',
  'Cobertura',
  'Base Estrutural', 
  'Impermeabilização',
  'Acabamento',
  'Sistema de Águas',
  'Fixação',
  'Vedação'
];

export function TelhasShingleManagerCompleto() {
  const [produtos, setProdutos] = useState<ProdutoShingle[]>([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState<ProdutoShingle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("Todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProdutoShingle | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchProdutos();
  }, []);

  useEffect(() => {
    filterProdutos();
  }, [produtos, searchTerm, categoriaFilter]);

  async function fetchProdutos() {
    try {
      const { data, error } = await supabase
        .from('produtos_shingle_novo')
        .select('*')
        .order('tipo_componente', { ascending: true });

      if (error) throw error;
      
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar produtos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  function filterProdutos() {
    let filtered = produtos;

    if (searchTerm) {
      filtered = filtered.filter(produto =>
        produto.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.codigo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoriaFilter !== "Todos") {
      const tiposCategoria = TIPOS_COMPONENTE
        .filter(tipo => tipo.category === categoriaFilter)
        .map(tipo => tipo.value);
      
      filtered = filtered.filter(produto => 
        tiposCategoria.includes(produto.tipo_componente)
      );
    }

    setProdutosFiltrados(filtered);
  }

  function getCategoryForType(type: string): string {
    const tipoInfo = TIPOS_COMPONENTE.find(t => t.value === type);
    return tipoInfo?.category || 'Outros';
  }

  function getIconForType(type: string) {
    const tipoInfo = TIPOS_COMPONENTE.find(t => t.value === type);
    return tipoInfo?.icon || Package;
  }

  function openEditDialog(produto?: ProdutoShingle) {
    setEditingProduct(produto || null);
    setDialogOpen(true);
  }

  async function handleSave(formData: Partial<ProdutoShingle>) {
    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('produtos_shingle_novo')
          .update(formData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Produto atualizado com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('produtos_shingle_novo')
          .insert(formData as any);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso", 
          description: "Produto criado com sucesso"
        });
      }
      
      setDialogOpen(false);
      fetchProdutos();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar produto",
        variant: "destructive"
      });
    }
  }

  async function toggleStatus(produto: ProdutoShingle) {
    try {
      const { error } = await supabase
        .from('produtos_shingle_novo')
        .update({ ativo: !produto.ativo })
        .eq('id', produto.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Produto ${produto.ativo ? 'desativado' : 'ativado'} com sucesso`
      });

      fetchProdutos();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Falha ao alterar status",
        variant: "destructive"
      });
    }
  }

  const produtosPorCategoria = CATEGORIAS.slice(1).reduce((acc, categoria) => {
    const tiposCategoria = TIPOS_COMPONENTE
      .filter(tipo => tipo.category === categoria)
      .map(tipo => tipo.value);
    
    acc[categoria] = produtosFiltrados.filter(produto => 
      tiposCategoria.includes(produto.tipo_componente)
    );
    
    return acc;
  }, {} as Record<string, ProdutoShingle[]>);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">Carregando produtos...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Sistema Completo Telhas Shingle</h2>
            <p className="text-muted-foreground">
              Gestão completa de todos os componentes do sistema
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openEditDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <ProdutoDialog
              produto={editingProduct}
              onSave={handleSave}
              onClose={() => setDialogOpen(false)}
            />
          </Dialog>
        </div>
      </Card>

      {/* Filtros */}
      <Card className="p-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por descrição ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIAS.map(categoria => (
                <SelectItem key={categoria} value={categoria}>
                  {categoria}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Produtos por Categoria */}
      <Tabs value={categoriaFilter === "Todos" ? "overview" : categoriaFilter} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="Cobertura">Cobertura</TabsTrigger>
          <TabsTrigger value="Base Estrutural">Base</TabsTrigger>
          <TabsTrigger value="Impermeabilização">Impermeab.</TabsTrigger>
          <TabsTrigger value="Acabamento">Acabamento</TabsTrigger>
          <TabsTrigger value="Sistema de Águas">Águas</TabsTrigger>
          <TabsTrigger value="Fixação">Fixação</TabsTrigger>
          <TabsTrigger value="Vedação">Vedação</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4">
            {Object.entries(produtosPorCategoria).map(([categoria, produtosCategoria]) => (
              <Card key={categoria} className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  {categoria}
                  <Badge variant="secondary">{produtosCategoria.length}</Badge>
                </h3>
                <div className="grid gap-2">
                  {produtosCategoria.slice(0, 3).map(produto => (
                    <ProdutoRow
                      key={produto.id}
                      produto={produto}
                      onEdit={() => openEditDialog(produto)}
                      onToggleStatus={() => toggleStatus(produto)}
                    />
                  ))}
                  {produtosCategoria.length > 3 && (
                    <div className="text-sm text-muted-foreground text-center py-2">
                      +{produtosCategoria.length - 3} produtos
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {Object.entries(produtosPorCategoria).map(([categoria, produtosCategoria]) => (
          <TabsContent key={categoria} value={categoria}>
            <Card className="p-6">
              <div className="space-y-4">
                {produtosCategoria.map(produto => (
                  <ProdutoRow
                    key={produto.id}
                    produto={produto}
                    onEdit={() => openEditDialog(produto)}
                    onToggleStatus={() => toggleStatus(produto)}
                    detailed
                  />
                ))}
                {produtosCategoria.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhum produto encontrado nesta categoria
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function ProdutoRow({ 
  produto, 
  onEdit, 
  onToggleStatus, 
  detailed = false 
}: {
  produto: ProdutoShingle;
  onEdit: () => void;
  onToggleStatus: () => void;
  detailed?: boolean;
}) {
  const Icon = getIconForType(produto.tipo_componente);
  
  return (
    <div className={`flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 ${!produto.ativo ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{produto.descricao}</span>
            <Badge variant="outline" className="text-xs">
              {produto.codigo}
            </Badge>
            {produto.cor && (
              <Badge variant="secondary" className="text-xs">
                {produto.cor}
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-4">
            <span>{produto.conteudo_unidade} {produto.unidade_medida}</span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {produto.preco_unitario.toFixed(2)}
            </span>
            {detailed && (
              <>
                <span>Quebra: {produto.quebra_padrao}%</span>
                {produto.peso_unitario && (
                  <span>Peso: {produto.peso_unitario}kg</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Badge variant={produto.ativo ? "default" : "secondary"}>
          {produto.ativo ? "Ativo" : "Inativo"}
        </Badge>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="w-3 h-3" />
        </Button>
        <Button 
          variant={produto.ativo ? "destructive" : "default"} 
          size="sm" 
          onClick={onToggleStatus}
        >
          {produto.ativo ? "Desativar" : "Ativar"}
        </Button>
      </div>
    </div>
  );
}

function getIconForType(type: string) {
  const tipoInfo = TIPOS_COMPONENTE.find(t => t.value === type);
  return tipoInfo?.icon || Package;
}

function ProdutoDialog({ 
  produto, 
  onSave, 
  onClose 
}: {
  produto: ProdutoShingle | null;
  onSave: (data: Partial<ProdutoShingle>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<Partial<ProdutoShingle>>({
    tipo_componente: 'TELHA',
    linha: 'UNIVERSAL',
    codigo: '',
    descricao: '',
    cor: '',
    unidade_medida: 'pct',
    conteudo_unidade: 1,
    quebra_padrao: 5,
    preco_unitario: 0,
    peso_unitario: 0,
    ativo: true,
    especificacoes_tecnicas: {}
  });

  useEffect(() => {
    if (produto) {
      setFormData(produto);
    }
  }, [produto]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(formData);
  }

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {produto ? 'Editar Produto' : 'Novo Produto'}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Tipo de Componente</Label>
            <Select
              value={formData.tipo_componente}
              onValueChange={(value) => setFormData({...formData, tipo_componente: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_COMPONENTE.map(tipo => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Linha</Label>
            <Select
              value={formData.linha}
              onValueChange={(value) => setFormData({...formData, linha: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SUPREME">Supreme</SelectItem>
                <SelectItem value="DURATION">Duration</SelectItem>
                <SelectItem value="UNIVERSAL">Universal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Código</Label>
            <Input
              value={formData.codigo}
              onChange={(e) => setFormData({...formData, codigo: e.target.value})}
              placeholder="Ex: 10420"
              required
            />
          </div>

          <div>
            <Label>Cor (opcional)</Label>
            <Input
              value={formData.cor}
              onChange={(e) => setFormData({...formData, cor: e.target.value})}
              placeholder="Ex: CINZA"
            />
          </div>
        </div>

        <div>
          <Label>Descrição</Label>
          <Textarea
            value={formData.descricao}
            onChange={(e) => setFormData({...formData, descricao: e.target.value})}
            placeholder="Descrição detalhada do produto"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Unidade de Medida</Label>
            <Select
              value={formData.unidade_medida}
              onValueChange={(value) => setFormData({...formData, unidade_medida: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pct">Pacote</SelectItem>
                <SelectItem value="m²">m²</SelectItem>
                <SelectItem value="pç">Peça</SelectItem>
                <SelectItem value="rl">Rolo</SelectItem>
                <SelectItem value="br">Barra</SelectItem>
                <SelectItem value="kg">Kg</SelectItem>
                <SelectItem value="bn">Bisnaga</SelectItem>
                <SelectItem value="und">Unidade</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Conteúdo/Unidade</Label>
            <Input
              type="number"
              step="0.001"
              value={formData.conteudo_unidade}
              onChange={(e) => setFormData({...formData, conteudo_unidade: parseFloat(e.target.value) || 0})}
              required
            />
          </div>

          <div>
            <Label>Quebra Padrão (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.quebra_padrao}
              onChange={(e) => setFormData({...formData, quebra_padrao: parseFloat(e.target.value) || 0})}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Preço Unitário (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.preco_unitario}
              onChange={(e) => setFormData({...formData, preco_unitario: parseFloat(e.target.value) || 0})}
              required
            />
          </div>

          <div>
            <Label>Peso Unitário (kg)</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.peso_unitario}
              onChange={(e) => setFormData({...formData, peso_unitario: parseFloat(e.target.value) || 0})}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.ativo}
            onCheckedChange={(checked) => setFormData({...formData, ativo: checked})}
          />
          <Label>Produto Ativo</Label>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {produto ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}