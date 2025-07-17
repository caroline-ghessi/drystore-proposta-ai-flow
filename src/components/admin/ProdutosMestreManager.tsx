import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Upload, Download, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TipoPropostaMapeamentos } from "./TipoPropostaMapeamentos";

interface ProdutoMestre {
  id: string;
  codigo: string;
  descricao: string;
  categoria: string;
  unidade_medida: string;
  preco_unitario: number;
  quantidade_embalagem: number;
  quebra_padrao: number;
  icms_percentual: number;
  aplicacao: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface ComposicaoMestre {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  valor_total_m2: number;
  descricao: string;
  aplicacao: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface ItemComposicao {
  id: string;
  composicao_id: string;
  produto_id: string;
  consumo_por_m2: number;
  quebra_aplicada: number;
  fator_correcao: number;
  ordem: number;
  valor_unitario: number;
  valor_por_m2: number;
  produtos_mestre?: ProdutoMestre;
}

const CATEGORIAS_PRODUTOS = [
  'OSB', 'CIMENTICIAS', 'DRYWALL', 'PERFIS', 'EIFS', 'IMPERMEABILIZACAO',
  'TELHAS_SHINGLE', 'ACESSORIOS_SHINGLE', 'TELHAS_METALICAS', 'ISOLAMENTO',
  'FIXACAO', 'JUNTAS', 'ACABAMENTOS', 'ESPECIAIS'
];

const CATEGORIAS_COMPOSICOES = [
  'VEDACAO_EXTERNA', 'VEDACAO_INTERNA', 'FORROS', 'COBERTURA', 
  'IMPERMEABILIZACAO', 'ACABAMENTOS'
];

export function ProdutosMestreManager() {
  const [produtos, setProdutos] = useState<ProdutoMestre[]>([]);
  const [composicoes, setComposicoes] = useState<ComposicaoMestre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [editingProduct, setEditingProduct] = useState<ProdutoMestre | null>(null);
  const [editingComposition, setEditingComposition] = useState<ComposicaoMestre | null>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showCompositionDialog, setShowCompositionDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [auditData, setAuditData] = useState<any[]>([]);
  const [showAudit, setShowAudit] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProdutos();
    fetchComposicoes();
  }, []);

  const fetchProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos_mestre')
        .select('*')
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

  const fetchComposicoes = async () => {
    try {
      const { data, error } = await supabase
        .from('composicoes_mestre')
        .select('*')
        .order('codigo');
      
      if (error) throw error;
      setComposicoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar composições:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar composições",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Funções de auditoria e validação
  const runPriceAudit = async () => {
    try {
      const { data, error } = await supabase.rpc('auditar_precos_suspeitos');
      if (error) throw error;
      setAuditData(data || []);
      setShowAudit(true);
      toast({
        title: "Auditoria Completa",
        description: `${data?.length || 0} problemas encontrados`,
      });
    } catch (error) {
      console.error('Erro na auditoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao executar auditoria",
        variant: "destructive"
      });
    }
  };

  const getCompositionsWithoutItems = async () => {
    try {
      const { data, error } = await supabase.rpc('composicoes_sem_itens');
      if (error) throw error;
      toast({
        title: "Composições sem Itens",
        description: `${data?.length || 0} composições sem itens detalhados`,
      });
      console.log('Composições sem itens:', data);
    } catch (error) {
      console.error('Erro ao buscar composições sem itens:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar composições sem itens",
        variant: "destructive"
      });
    }
  };

  const validateCompositions = async () => {
    try {
      const { data, error } = await supabase.rpc('validar_composicoes');
      if (error) throw error;
      
      const inconsistent = data?.filter((item: any) => 
        item.status_validacao !== 'OK' && item.status_validacao !== 'SEM_ITENS'
      ) || [];
      
      toast({
        title: "Validação Concluída",
        description: `${inconsistent.length} composições com diferenças de preço`,
      });
      console.log('Composições com inconsistências:', inconsistent);
    } catch (error) {
      console.error('Erro na validação:', error);
      toast({
        title: "Erro", 
        description: "Erro ao validar composições",
        variant: "destructive"
      });
    }
  };

  const handleSaveProduct = async (formData: any) => {
    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('produtos_mestre')
          .update(formData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        toast({ title: "Sucesso", description: "Produto atualizado com sucesso" });
      } else {
        const { error } = await supabase
          .from('produtos_mestre')
          .insert([formData]);
        
        if (error) throw error;
        toast({ title: "Sucesso", description: "Produto criado com sucesso" });
      }
      
      await fetchProdutos();
      setShowProductDialog(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar produto",
        variant: "destructive"
      });
    }
  };

  const handleSaveComposition = async (formData: any) => {
    try {
      if (editingComposition) {
        const { error } = await supabase
          .from('composicoes_mestre')
          .update(formData)
          .eq('id', editingComposition.id);
        
        if (error) throw error;
        toast({ title: "Sucesso", description: "Composição atualizada com sucesso" });
      } else {
        const { error } = await supabase
          .from('composicoes_mestre')
          .insert([formData]);
        
        if (error) throw error;
        toast({ title: "Sucesso", description: "Composição criada com sucesso" });
      }
      
      await fetchComposicoes();
      setShowCompositionDialog(false);
      setEditingComposition(null);
    } catch (error) {
      console.error('Erro ao salvar composição:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar composição",
        variant: "destructive"
      });
    }
  };

  const handleImportCSV = async () => {
    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const records = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const record: any = {};
        
        headers.forEach((header, index) => {
          record[header] = values[index];
        });
        
        records.push(record);
      }

      const { error } = await supabase
        .from('produtos_mestre')
        .insert(records);
      
      if (error) throw error;
      
      toast({ title: "Sucesso", description: `${records.length} produtos importados com sucesso` });
      await fetchProdutos();
      setShowImportDialog(false);
      setCsvData("");
    } catch (error) {
      console.error('Erro ao importar CSV:', error);
      toast({
        title: "Erro",
        description: "Erro ao importar dados do CSV",
        variant: "destructive"
      });
    }
  };

  const exportToCSV = () => {
    const headers = ['codigo', 'descricao', 'categoria', 'unidade_medida', 'preco_unitario', 'quantidade_embalagem', 'quebra_padrao', 'icms_percentual', 'aplicacao'];
    const csvContent = [
      headers.join(','),
      ...produtos.map(produto => 
        headers.map(header => produto[header as keyof ProdutoMestre]).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'produtos_mestre.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredProducts = produtos.filter(produto => {
    const matchesSearch = produto.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "todas" || produto.categoria === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredCompositions = composicoes.filter(comp => {
    const matchesSearch = comp.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comp.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "todas" || comp.categoria === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="flex items-center justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestão Unificada de Produtos e Composições</h2>
          <p className="text-muted-foreground">
            Gerencie todos os insumos e composições do sistema de forma centralizada
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runPriceAudit} variant="outline" size="sm">
            🔍 Auditoria de Preços
          </Button>
          <Button onClick={getCompositionsWithoutItems} variant="outline" size="sm">
            📋 Composições sem Itens
          </Button>
          <Button onClick={validateCompositions} variant="outline" size="sm">
            ✅ Validar Composições
          </Button>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Importar CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Importar Produtos via CSV</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="csvData">Dados CSV</Label>
                  <Textarea
                    id="csvData"
                    placeholder="codigo,descricao,categoria,unidade_medida,preco_unitario..."
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    rows={10}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleImportCSV}>
                    Importar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Resumo do Catálogo</CardTitle>
              <CardDescription>Visão geral dos produtos e composições cadastrados</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{produtos.length}</div>
              <div className="text-sm text-muted-foreground">Total de Produtos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{produtos.filter(p => p.ativo).length}</div>
              <div className="text-sm text-muted-foreground">Produtos Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{composicoes.length}</div>
              <div className="text-sm text-muted-foreground">Composições</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{CATEGORIAS_PRODUTOS.length}</div>
              <div className="text-sm text-muted-foreground">Categorias</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por código ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            {CATEGORIAS_PRODUTOS.map(categoria => (
              <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="produtos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="produtos">Produtos ({produtos.length})</TabsTrigger>
          <TabsTrigger value="composicoes">Composições ({composicoes.length})</TabsTrigger>
          <TabsTrigger value="mapeamentos">Mapeamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="produtos">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Produtos Mestre</CardTitle>
                <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingProduct(null)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Produto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <ProductForm
                      product={editingProduct}
                      onSave={handleSaveProduct}
                      onCancel={() => {
                        setShowProductDialog(false);
                        setEditingProduct(null);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Quebra %</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((produto) => (
                    <TableRow key={produto.id}>
                      <TableCell className="font-mono">{produto.codigo}</TableCell>
                      <TableCell className="max-w-xs truncate">{produto.descricao}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{produto.categoria}</Badge>
                      </TableCell>
                      <TableCell>{produto.unidade_medida}</TableCell>
                      <TableCell>R$ {produto.preco_unitario.toFixed(2)}</TableCell>
                      <TableCell>{produto.quebra_padrao}%</TableCell>
                      <TableCell>
                        <Badge variant={produto.ativo ? "default" : "secondary"}>
                          {produto.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingProduct(produto);
                              setShowProductDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="composicoes">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Composições Mestre</CardTitle>
                <Dialog open={showCompositionDialog} onOpenChange={setShowCompositionDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingComposition(null)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Nova Composição
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <CompositionForm
                      composition={editingComposition}
                      onSave={handleSaveComposition}
                      onCancel={() => {
                        setShowCompositionDialog(false);
                        setEditingComposition(null);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Valor/m²</TableHead>
                    <TableHead>Aplicação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompositions.map((composicao) => (
                    <TableRow key={composicao.id}>
                      <TableCell className="font-mono">{composicao.codigo}</TableCell>
                      <TableCell>{composicao.nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{composicao.categoria}</Badge>
                      </TableCell>
                      <TableCell>R$ {composicao.valor_total_m2.toFixed(2)}</TableCell>
                      <TableCell className="max-w-xs truncate">{composicao.aplicacao}</TableCell>
                      <TableCell>
                        <Badge variant={composicao.ativo ? "default" : "secondary"}>
                          {composicao.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingComposition(composicao);
                              setShowCompositionDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          </TabsContent>

          <TabsContent value="mapeamentos">
            <TipoPropostaMapeamentos />
          </TabsContent>
        </Tabs>
    </div>
  );
}

function ProductForm({ 
  product, 
  onSave, 
  onCancel 
}: { 
  product: ProdutoMestre | null; 
  onSave: (data: any) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    codigo: product?.codigo || '',
    descricao: product?.descricao || '',
    categoria: product?.categoria || '',
    unidade_medida: product?.unidade_medida || '',
    preco_unitario: product?.preco_unitario || 0,
    quantidade_embalagem: product?.quantidade_embalagem || 1,
    quebra_padrao: product?.quebra_padrao || 5,
    icms_percentual: product?.icms_percentual || 0,
    aplicacao: product?.aplicacao || '',
    ativo: product?.ativo ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{product ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
      </DialogHeader>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="codigo">Código</Label>
          <Input
            id="codigo"
            value={formData.codigo}
            onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="categoria">Categoria</Label>
          <Select 
            value={formData.categoria} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIAS_PRODUTOS.map(categoria => (
                <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Input
          id="descricao"
          value={formData.descricao}
          onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="unidade_medida">Unidade de Medida</Label>
          <Input
            id="unidade_medida"
            value={formData.unidade_medida}
            onChange={(e) => setFormData(prev => ({ ...prev, unidade_medida: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="preco_unitario">Preço Unitário</Label>
          <Input
            id="preco_unitario"
            type="number"
            step="0.01"
            value={formData.preco_unitario}
            onChange={(e) => setFormData(prev => ({ ...prev, preco_unitario: parseFloat(e.target.value) }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="quantidade_embalagem">Qtd. Embalagem</Label>
          <Input
            id="quantidade_embalagem"
            type="number"
            step="0.001"
            value={formData.quantidade_embalagem}
            onChange={(e) => setFormData(prev => ({ ...prev, quantidade_embalagem: parseFloat(e.target.value) }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="quebra_padrao">Quebra %</Label>
          <Input
            id="quebra_padrao"
            type="number"
            step="0.1"
            value={formData.quebra_padrao}
            onChange={(e) => setFormData(prev => ({ ...prev, quebra_padrao: parseFloat(e.target.value) }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="icms_percentual">ICMS %</Label>
          <Input
            id="icms_percentual"
            type="number"
            step="0.1"
            value={formData.icms_percentual}
            onChange={(e) => setFormData(prev => ({ ...prev, icms_percentual: parseFloat(e.target.value) }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="aplicacao">Aplicação</Label>
        <Textarea
          id="aplicacao"
          value={formData.aplicacao}
          onChange={(e) => setFormData(prev => ({ ...prev, aplicacao: e.target.value }))}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {product ? 'Atualizar' : 'Criar'} Produto
        </Button>
      </div>
    </form>
  );
}

function CompositionForm({ 
  composition, 
  onSave, 
  onCancel 
}: { 
  composition: ComposicaoMestre | null; 
  onSave: (data: any) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    codigo: composition?.codigo || '',
    nome: composition?.nome || '',
    categoria: composition?.categoria || '',
    valor_total_m2: composition?.valor_total_m2 || 0,
    descricao: composition?.descricao || '',
    aplicacao: composition?.aplicacao || '',
    ativo: composition?.ativo ?? true
  });
  const [activeTab, setActiveTab] = useState("dados-gerais");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>{composition ? 'Editar Composição' : 'Nova Composição'}</DialogTitle>
      </DialogHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dados-gerais">Dados Gerais</TabsTrigger>
          <TabsTrigger value="itens-composicao" disabled={!composition}>
            Itens da Composição
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dados-gerais">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select 
                  value={formData.categoria} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS_COMPOSICOES.map(categoria => (
                      <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="valor_total_m2">Valor Total/m² (calculado automaticamente)</Label>
              <Input
                id="valor_total_m2"
                type="number"
                step="0.01"
                value={formData.valor_total_m2}
                onChange={(e) => setFormData(prev => ({ ...prev, valor_total_m2: parseFloat(e.target.value) }))}
                disabled={composition && composition.id ? true : false}
                placeholder={composition ? "Calculado pelos itens da composição" : "Valor manual"}
              />
              {composition && (
                <p className="text-sm text-muted-foreground mt-1">
                  Este valor é calculado automaticamente baseado nos itens da composição
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="aplicacao">Aplicação</Label>
              <Textarea
                id="aplicacao"
                value={formData.aplicacao}
                onChange={(e) => setFormData(prev => ({ ...prev, aplicacao: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit">
                {composition ? 'Atualizar' : 'Criar'} Composição
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="itens-composicao">
          {composition && (
            <CompositionItemsManager 
              compositionId={composition.id}
              onValueUpdate={(newValue) => setFormData(prev => ({ ...prev, valor_total_m2: newValue }))}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CompositionItemsManager({ 
  compositionId, 
  onValueUpdate 
}: { 
  compositionId: string;
  onValueUpdate: (value: number) => void;
}) {
  const [items, setItems] = useState<ItemComposicao[]>([]);
  const [products, setProducts] = useState<ProdutoMestre[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemComposicao | null>(null);
  const { toast } = useToast();

  const [newItem, setNewItem] = useState({
    produto_id: '',
    consumo_por_m2: 1.0,
    quebra_aplicada: 5.0,
    fator_correcao: 1.0,
    ordem: 1
  });

  useEffect(() => {
    fetchItems();
    fetchProducts();
  }, [compositionId]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('itens_composicao')
        .select(`
          *,
          produtos_mestre (*)
        `)
        .eq('composicao_id', compositionId)
        .order('ordem');
      
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar itens da composição",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos_mestre')
        .select('*')
        .eq('ativo', true)
        .order('codigo');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const calculateItemValue = (consumo: number, quebra: number, fator: number, precoUnitario: number) => {
    return consumo * (1 + quebra / 100) * fator * precoUnitario;
  };

  const recalculateCompositionValue = async () => {
    try {
      const { data, error } = await supabase.rpc('recalcular_composicao', {
        p_composicao_id: compositionId
      });
      
      if (error) throw error;
      onValueUpdate(data);
      toast({
        title: "Sucesso",
        description: "Valor da composição recalculado automaticamente",
      });
    } catch (error) {
      console.error('Erro ao recalcular:', error);
    }
  };

  const handleAddItem = async () => {
    try {
      const selectedProduct = products.find(p => p.id === newItem.produto_id);
      if (!selectedProduct) return;

      const valorPorM2 = calculateItemValue(
        newItem.consumo_por_m2,
        newItem.quebra_aplicada,
        newItem.fator_correcao,
        selectedProduct.preco_unitario
      );

      const { error } = await supabase
        .from('itens_composicao')
        .insert([{
          composicao_id: compositionId,
          produto_id: newItem.produto_id,
          consumo_por_m2: newItem.consumo_por_m2,
          quebra_aplicada: newItem.quebra_aplicada,
          fator_correcao: newItem.fator_correcao,
          ordem: newItem.ordem,
          valor_unitario: selectedProduct.preco_unitario,
          valor_por_m2: valorPorM2
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Item adicionado com sucesso",
      });
      
      await fetchItems();
      await recalculateCompositionValue();
      setShowAddItem(false);
      setNewItem({
        produto_id: '',
        consumo_por_m2: 1.0,
        quebra_aplicada: 5.0,
        fator_correcao: 1.0,
        ordem: Math.max(...items.map(i => i.ordem), 0) + 1
      });
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar item",
        variant: "destructive"
      });
    }
  };

  const handleUpdateItem = async (item: ItemComposicao, updates: Partial<ItemComposicao>) => {
    try {
      const updatedItem = { ...item, ...updates };
      const valorPorM2 = calculateItemValue(
        updatedItem.consumo_por_m2,
        updatedItem.quebra_aplicada,
        updatedItem.fator_correcao,
        updatedItem.valor_unitario
      );

      const { error } = await supabase
        .from('itens_composicao')
        .update({
          ...updates,
          valor_por_m2: valorPorM2
        })
        .eq('id', item.id);

      if (error) throw error;

      await fetchItems();
      await recalculateCompositionValue();
      setEditingItem(null);
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar item",
        variant: "destructive"
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('itens_composicao')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Item removido com sucesso",
      });
      
      await fetchItems();
      await recalculateCompositionValue();
    } catch (error) {
      console.error('Erro ao remover item:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover item",
        variant: "destructive"
      });
    }
  };

  const moveItem = async (itemId: string, direction: 'up' | 'down') => {
    const currentItem = items.find(i => i.id === itemId);
    if (!currentItem) return;

    const sortedItems = [...items].sort((a, b) => a.ordem - b.ordem);
    const currentIndex = sortedItems.findIndex(i => i.id === itemId);
    
    if (direction === 'up' && currentIndex > 0) {
      const targetItem = sortedItems[currentIndex - 1];
      await handleUpdateItem(currentItem, { ordem: targetItem.ordem });
      await handleUpdateItem(targetItem, { ordem: currentItem.ordem });
    } else if (direction === 'down' && currentIndex < sortedItems.length - 1) {
      const targetItem = sortedItems[currentIndex + 1];
      await handleUpdateItem(currentItem, { ordem: targetItem.ordem });
      await handleUpdateItem(targetItem, { ordem: currentItem.ordem });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Carregando itens...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Itens da Composição</h3>
        <Button onClick={() => setShowAddItem(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Produto
        </Button>
      </div>

      {showAddItem && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Novo Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Produto</Label>
                <Select value={newItem.produto_id} onValueChange={(value) => setNewItem(prev => ({ ...prev, produto_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products
                      .filter(p => !items.some(i => i.produto_id === p.id))
                      .map(produto => (
                        <SelectItem key={produto.id} value={produto.id}>
                          {produto.codigo} - {produto.descricao}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ordem</Label>
                <Input
                  type="number"
                  value={newItem.ordem}
                  onChange={(e) => setNewItem(prev => ({ ...prev, ordem: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Consumo/m²</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={newItem.consumo_por_m2}
                  onChange={(e) => setNewItem(prev => ({ ...prev, consumo_por_m2: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Quebra %</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newItem.quebra_aplicada}
                  onChange={(e) => setNewItem(prev => ({ ...prev, quebra_aplicada: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Fator Correção</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newItem.fator_correcao}
                  onChange={(e) => setNewItem(prev => ({ ...prev, fator_correcao: parseFloat(e.target.value) }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddItem(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddItem} disabled={!newItem.produto_id}>
                Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ordem</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Consumo/m²</TableHead>
                <TableHead>Quebra %</TableHead>
                <TableHead>Fator</TableHead>
                <TableHead>Valor Unit.</TableHead>
                <TableHead>Valor/m²</TableHead>
                <TableHead className="w-32">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.ordem}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.produtos_mestre?.codigo}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {item.produtos_mestre?.descricao}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingItem?.id === item.id ? (
                      <Input
                        type="number"
                        step="0.001"
                        value={editingItem.consumo_por_m2}
                        onChange={(e) => setEditingItem(prev => prev ? { ...prev, consumo_por_m2: parseFloat(e.target.value) } : null)}
                        className="w-20"
                      />
                    ) : (
                      item.consumo_por_m2.toFixed(3)
                    )}
                  </TableCell>
                  <TableCell>
                    {editingItem?.id === item.id ? (
                      <Input
                        type="number"
                        step="0.1"
                        value={editingItem.quebra_aplicada}
                        onChange={(e) => setEditingItem(prev => prev ? { ...prev, quebra_aplicada: parseFloat(e.target.value) } : null)}
                        className="w-20"
                      />
                    ) : (
                      `${item.quebra_aplicada}%`
                    )}
                  </TableCell>
                  <TableCell>
                    {editingItem?.id === item.id ? (
                      <Input
                        type="number"
                        step="0.1"
                        value={editingItem.fator_correcao}
                        onChange={(e) => setEditingItem(prev => prev ? { ...prev, fator_correcao: parseFloat(e.target.value) } : null)}
                        className="w-20"
                      />
                    ) : (
                      item.fator_correcao.toFixed(1)
                    )}
                  </TableCell>
                  <TableCell>R$ {item.valor_unitario.toFixed(2)}</TableCell>
                  <TableCell>R$ {item.valor_por_m2.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {editingItem?.id === item.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateItem(item, {
                              consumo_por_m2: editingItem.consumo_por_m2,
                              quebra_aplicada: editingItem.quebra_aplicada,
                              fator_correcao: editingItem.fator_correcao
                            })}
                          >
                            ✓
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingItem(null)}
                          >
                            ✕
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingItem(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveItem(item.id, 'up')}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveItem(item.id, 'down')}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {items.length === 0 && (
        <div className="text-center p-8 text-muted-foreground">
          Nenhum item adicionado ainda. Clique em "Adicionar Produto" para começar.
        </div>
      )}

      <div className="flex justify-end">
        <div className="text-lg font-semibold">
          Total da Composição: R$ {items.reduce((sum, item) => sum + item.valor_por_m2, 0).toFixed(2)}/m²
        </div>
      </div>
    </div>
  );
}