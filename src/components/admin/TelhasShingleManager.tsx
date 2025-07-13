import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Plus, Search, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TelhaShingle {
  id: string;
  codigo: string;
  linha: string;
  descricao: string;
  cor: string | null;
  fator_multiplicador: number | null;
  quebra_padrao: number | null;
  preco_unitario: number | null;
  peso_kg_m2: number | null;
  garantia_anos: number | null;
  resistencia_vento_kmh: number | null;
  ativo: boolean | null;
}

export const TelhasShingleManager = () => {
  const [telhas, setTelhas] = useState<TelhaShingle[]>([]);
  const [filteredTelhas, setFilteredTelhas] = useState<TelhaShingle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [linhaFilter, setLinhaFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingTelha, setEditingTelha] = useState<TelhaShingle | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTelhas();
  }, []);

  useEffect(() => {
    filterTelhas();
  }, [telhas, searchTerm, linhaFilter, statusFilter]);

  const fetchTelhas = async () => {
    try {
      const { data, error } = await supabase
        .from('telhas_shingle')
        .select('*')
        .order('codigo');
      
      if (error) throw error;
      setTelhas(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar telhas shingle",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTelhas = () => {
    let filtered = telhas;
    
    if (searchTerm) {
      filtered = filtered.filter(telha =>
        telha.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        telha.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (telha.cor && telha.cor.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (linhaFilter !== "all") {
      filtered = filtered.filter(telha => telha.linha === linhaFilter);
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(telha => 
        statusFilter === "ativo" ? telha.ativo : !telha.ativo
      );
    }
    
    setFilteredTelhas(filtered);
  };

  const handleSave = async (telhaData: Partial<TelhaShingle>) => {
    try {
      if (editingTelha) {
        const { error } = await supabase
          .from('telhas_shingle')
          .update(telhaData)
          .eq('id', editingTelha.id);
        
        if (error) throw error;
        toast({ title: "Sucesso", description: "Telha atualizada com sucesso" });
      } else {
        const { error } = await supabase
          .from('telhas_shingle')
          .insert([telhaData as any]);
        
        if (error) throw error;
        toast({ title: "Sucesso", description: "Telha criada com sucesso" });
      }
      
      setIsDialogOpen(false);
      setEditingTelha(null);
      fetchTelhas();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar telha",
        variant: "destructive"
      });
    }
  };

  const toggleStatus = async (telha: TelhaShingle) => {
    try {
      const { error } = await supabase
        .from('telhas_shingle')
        .update({ ativo: !telha.ativo })
        .eq('id', telha.id);
      
      if (error) throw error;
      toast({ 
        title: "Sucesso", 
        description: `Telha ${!telha.ativo ? 'ativada' : 'desativada'} com sucesso` 
      });
      fetchTelhas();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status da telha",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (telha?: TelhaShingle) => {
    setEditingTelha(telha || null);
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Telhas Shingle
          </CardTitle>
          <CardDescription>
            Gerencie o catálogo de telhas shingle e acessórios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, descrição ou cor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={linhaFilter} onValueChange={setLinhaFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por linha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as linhas</SelectItem>
                <SelectItem value="SUPREME">SUPREME</SelectItem>
                <SelectItem value="DURATION">DURATION</SelectItem>
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
              Nova Telha
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Linha</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTelhas.map((telha) => (
                  <TableRow key={telha.id}>
                    <TableCell className="font-medium">{telha.codigo}</TableCell>
                    <TableCell>
                      <Badge variant={telha.linha === 'SUPREME' ? 'default' : 'secondary'}>
                        {telha.linha}
                      </Badge>
                    </TableCell>
                    <TableCell>{telha.descricao}</TableCell>
                    <TableCell>{telha.cor || '-'}</TableCell>
                    <TableCell>
                      {telha.preco_unitario ? `R$ ${telha.preco_unitario.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={telha.ativo || false}
                          onCheckedChange={() => toggleStatus(telha)}
                        />
                        <span className="text-sm">
                          {telha.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditDialog(telha)}
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

      <TelhaEditDialog
        telha={editingTelha}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
      />
    </div>
  );
};

interface TelhaEditDialogProps {
  telha: TelhaShingle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<TelhaShingle>) => void;
}

const TelhaEditDialog = ({ telha, open, onOpenChange, onSave }: TelhaEditDialogProps) => {
  const [formData, setFormData] = useState<Partial<TelhaShingle>>({});

  useEffect(() => {
    if (telha) {
      setFormData(telha);
    } else {
      setFormData({
        codigo: '',
        linha: 'SUPREME',
        descricao: '',
        cor: '',
        fator_multiplicador: 1,
        quebra_padrao: 5,
        preco_unitario: 0,
        peso_kg_m2: 12,
        garantia_anos: 25,
        resistencia_vento_kmh: 200,
        ativo: true
      });
    }
  }, [telha]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {telha ? 'Editar Telha' : 'Nova Telha'}
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
              <Label htmlFor="linha">Linha *</Label>
              <Select 
                value={formData.linha || 'SUPREME'} 
                onValueChange={(value) => setFormData({...formData, linha: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPREME">SUPREME</SelectItem>
                  <SelectItem value="DURATION">DURATION</SelectItem>
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
              <Label htmlFor="cor">Cor</Label>
              <Input
                id="cor"
                value={formData.cor || ''}
                onChange={(e) => setFormData({...formData, cor: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="preco_unitario">Preço Unitário</Label>
              <Input
                id="preco_unitario"
                type="number"
                step="0.01"
                value={formData.preco_unitario || ''}
                onChange={(e) => setFormData({...formData, preco_unitario: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="fator_multiplicador">Fator Multiplicador</Label>
              <Input
                id="fator_multiplicador"
                type="number"
                step="0.01"
                value={formData.fator_multiplicador || ''}
                onChange={(e) => setFormData({...formData, fator_multiplicador: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="quebra_padrao">Quebra Padrão (%)</Label>
              <Input
                id="quebra_padrao"
                type="number"
                step="0.1"
                value={formData.quebra_padrao || ''}
                onChange={(e) => setFormData({...formData, quebra_padrao: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="peso_kg_m2">Peso (kg/m²)</Label>
              <Input
                id="peso_kg_m2"
                type="number"
                step="0.1"
                value={formData.peso_kg_m2 || ''}
                onChange={(e) => setFormData({...formData, peso_kg_m2: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="garantia_anos">Garantia (anos)</Label>
              <Input
                id="garantia_anos"
                type="number"
                value={formData.garantia_anos || ''}
                onChange={(e) => setFormData({...formData, garantia_anos: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="resistencia_vento_kmh">Resistência Vento (km/h)</Label>
              <Input
                id="resistencia_vento_kmh"
                type="number"
                value={formData.resistencia_vento_kmh || ''}
                onChange={(e) => setFormData({...formData, resistencia_vento_kmh: parseInt(e.target.value)})}
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
              {telha ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};