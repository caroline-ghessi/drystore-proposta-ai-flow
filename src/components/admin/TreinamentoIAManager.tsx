import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload, FileText, Edit, Trash2, Bot, Plus, Loader2, Download } from "lucide-react";
import { uploadService } from "@/services/uploadService";

interface ConhecimentoVendas {
  id: string;
  categoria: string;
  titulo: string;
  conteudo: string;
  tags: string[];
  ativo: boolean;
  prioridade: number;
  created_at: string;
  updated_at: string;
}

const categorias = [
  { value: 'followup', label: 'Follow-up' },
  { value: 'objecoes', label: 'Objeções' },
  { value: 'fechamento', label: 'Fechamento' },
  { value: 'relacionamento', label: 'Relacionamento' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'comercial', label: 'Comercial' }
];

export function TreinamentoIAManager() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingItem, setEditingItem] = useState<ConhecimentoVendas | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    categoria: '',
    titulo: '',
    conteudo: '',
    tags: '',
    prioridade: 1,
    ativo: true
  });

  const queryClient = useQueryClient();

  // Buscar conhecimento existente
  const { data: conhecimentos, isLoading } = useQuery({
    queryKey: ['conhecimento-vendas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conhecimento_vendas')
        .select('*')
        .order('prioridade', { ascending: false });
      
      if (error) throw error;
      return data as ConhecimentoVendas[];
    }
  });

  // Processar PDF com Dify
  const processarPDF = useMutation({
    mutationFn: async (arquivo: File) => {
      const uploadResult = await uploadService.uploadDocumento(arquivo, 'treinamento-ia');
      
      const { data, error } = await supabase.functions.invoke('processar-treinamento-ia', {
        body: {
          arquivoUrl: uploadResult.path,
          nomeArquivo: arquivo.name
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.sucesso) {
        toast.success("PDF processado com sucesso!");
        setFormData({
          ...formData,
          titulo: data.titulo || 'Conhecimento extraído',
          conteudo: data.conteudo || '',
          categoria: data.categoria || 'tecnico',
          tags: data.tags ? data.tags.join(', ') : ''
        });
        setSelectedFile(null);
      } else {
        toast.error(data.erro || "Erro ao processar PDF");
      }
      setIsProcessing(false);
    },
    onError: (error) => {
      console.error('Erro ao processar PDF:', error);
      toast.error("Erro ao processar PDF");
      setIsProcessing(false);
    }
  });

  // Salvar conhecimento
  const salvarConhecimento = useMutation({
    mutationFn: async (dados: any) => {
      const tagsArray = dados.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
      
      if (editingItem) {
        const { error } = await supabase
          .from('conhecimento_vendas')
          .update({
            categoria: dados.categoria,
            titulo: dados.titulo,
            conteudo: dados.conteudo,
            tags: tagsArray,
            prioridade: dados.prioridade,
            ativo: dados.ativo,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('conhecimento_vendas')
          .insert({
            categoria: dados.categoria,
            titulo: dados.titulo,
            conteudo: dados.conteudo,
            tags: tagsArray,
            prioridade: dados.prioridade,
            ativo: dados.ativo
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingItem ? "Conhecimento atualizado!" : "Conhecimento salvo!");
      queryClient.invalidateQueries({ queryKey: ['conhecimento-vendas'] });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error('Erro ao salvar:', error);
      toast.error("Erro ao salvar conhecimento");
    }
  });

  // Excluir conhecimento
  const excluirConhecimento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('conhecimento_vendas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Conhecimento excluído!");
      queryClient.invalidateQueries({ queryKey: ['conhecimento-vendas'] });
    },
    onError: (error) => {
      console.error('Erro ao excluir:', error);
      toast.error("Erro ao excluir conhecimento");
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      toast.error("Por favor, selecione um arquivo PDF");
    }
  };

  const handleProcessPDF = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    processarPDF.mutate(selectedFile);
  };

  const resetForm = () => {
    setFormData({
      categoria: '',
      titulo: '',
      conteudo: '',
      tags: '',
      prioridade: 1,
      ativo: true
    });
    setEditingItem(null);
  };

  const handleEdit = (item: ConhecimentoVendas) => {
    setEditingItem(item);
    setFormData({
      categoria: item.categoria,
      titulo: item.titulo,
      conteudo: item.conteudo,
      tags: item.tags.join(', '),
      prioridade: item.prioridade,
      ativo: item.ativo
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoria || !formData.titulo || !formData.conteudo) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    salvarConhecimento.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload PDF</TabsTrigger>
          <TabsTrigger value="manual">Manual</TabsTrigger>
          <TabsTrigger value="conhecimentos">Conhecimentos</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Processar PDF com IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pdf-upload">Arquivo PDF</Label>
                <Input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="mt-1"
                />
              </div>

              {selectedFile && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{selectedFile.name}</span>
                </div>
              )}

              <Button 
                onClick={handleProcessPDF}
                disabled={!selectedFile || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    Processar com IA
                  </>
                )}
              </Button>

              {formData.conteudo && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Conteúdo Extraído:</h4>
                  <p className="text-sm text-muted-foreground">
                    {formData.conteudo.substring(0, 200)}...
                  </p>
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Editar e Salvar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Adicionar Conhecimento Manual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Conhecimento
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conhecimentos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Conhecimentos Existentes</h3>
            <Badge variant="secondary">
              {conhecimentos?.length || 0} itens
            </Badge>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-4">
              {conhecimentos?.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{item.categoria}</Badge>
                          <Badge variant={item.ativo ? "default" : "secondary"}>
                            {item.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                          <Badge variant="secondary">
                            Prioridade: {item.prioridade}
                          </Badge>
                        </div>
                        <h4 className="font-medium mb-1">{item.titulo}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.conteudo.substring(0, 150)}...
                        </p>
                        <div className="flex gap-1">
                          {item.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(item)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => excluirConhecimento.mutate(item.id)}
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog para edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Conhecimento' : 'Novo Conhecimento'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({...formData, categoria: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="prioridade">Prioridade</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.prioridade}
                  onChange={(e) => setFormData({...formData, prioridade: parseInt(e.target.value) || 1})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                placeholder="Título do conhecimento"
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="vendas, follow-up, objection"
              />
            </div>

            <div>
              <Label htmlFor="conteudo">Conteúdo *</Label>
              <Textarea
                value={formData.conteudo}
                onChange={(e) => setFormData({...formData, conteudo: e.target.value})}
                placeholder="Conteúdo do conhecimento..."
                rows={8}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
              />
              <Label htmlFor="ativo">Ativo</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={salvarConhecimento.isPending}>
                {salvarConhecimento.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}