import { Calendar, FileText, Plus, Search, Users, Upload, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DryStoreSidebar } from "@/components/DryStoreSidebar";
import NotificacaoRealTime from "@/components/NotificacaoRealTime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { usePropostas, type TipoProposta, type StatusProposta } from "@/hooks/usePropostas";
import { uploadService } from "@/services/uploadService";
import { difyService } from "@/services/difyService";
import { toast } from "sonner";

const Propostas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  
  const { propostas, loading, criarProposta, fetchPropostas } = usePropostas();

  const [formData, setFormData] = useState({
    clienteNome: "",
    clienteEmail: "",
    clienteWhatsapp: "",
    clienteEndereco: "",
    tipo: "" as TipoProposta | "",
    observacoes: "",
    arquivo: null as File | null,
  });

  useEffect(() => {
    fetchPropostas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.arquivo) {
      toast.error("Por favor, selecione um arquivo");
      return;
    }

    if (!formData.tipo) {
      toast.error("Por favor, selecione o tipo de proposta");
      return;
    }

    if (!formData.clienteNome || !formData.clienteEmail) {
      toast.error("Nome e email do cliente são obrigatórios");
      return;
    }

    try {
      setUploading(true);
      
      // 1. Validar arquivo
      const validation = uploadService.validateFile(formData.arquivo);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      // 2. Upload do arquivo
      const uploadResult = await uploadService.uploadDocumento(formData.arquivo);
      toast.success("Arquivo enviado com sucesso!");
      
      setProcessing(true);
      
      // 3. Processar documento com IA
      const processResult = await difyService.processarDocumento(
        uploadResult.url,
        formData.tipo,
        formData.clienteNome,
        formData.clienteEmail
      );
      
      // 4. Criar proposta
      const novaProposta = await criarProposta({
        cliente_nome: formData.clienteNome,
        cliente_email: formData.clienteEmail,
        cliente_whatsapp: formData.clienteWhatsapp,
        cliente_endereco: formData.clienteEndereco,
        tipo_proposta: formData.tipo,
        dados_extraidos: processResult.dados_extraidos,
        valor_total: processResult.valor_total,
        observacoes: formData.observacoes,
        arquivo_original: uploadResult.url
      });

      if (novaProposta) {
        toast.success("Proposta criada com sucesso!");
        
        // Fechar modal e limpar form
        setMostrarModal(false);
        setFormData({
          clienteNome: "",
          clienteEmail: "",
          clienteWhatsapp: "",
          clienteEndereco: "",
          tipo: "" as TipoProposta | "",
          observacoes: "",
          arquivo: null,
        });
        
        // Navegar para visualização da proposta
        navigate(`/proposta/${novaProposta.url_unica}`);
      }
      
    } catch (error: any) {
      console.error('Erro ao criar proposta:', error);
      toast.error(`Erro ao criar proposta: ${error.message}`);
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const getStatusColor = (status: StatusProposta) => {
    switch (status) {
      case "enviada": return "default";
      case "visualizada": return "secondary";
      case "aceita": return "default";
      case "processando": return "outline";
      case "expirada": return "destructive";
      default: return "outline";
    }
  };

  const getStatusText = (status: StatusProposta) => {
    switch (status) {
      case "processando": return "Processando";
      case "enviada": return "Enviada";
      case "visualizada": return "Visualizada";
      case "aceita": return "Aceita";
      case "expirada": return "Expirada";
      default: return status;
    }
  };

  const formatTipoProposta = (tipo: TipoProposta) => {
    switch (tipo) {
      case "energia-solar": return "Energia Solar";
      case "telhas": return "Telhas";
      case "divisorias": return "Divisórias";
      case "pisos": return "Pisos";
      case "forros": return "Forros";
      default: return tipo;
    }
  };

  const filteredPropostas = propostas.filter(proposta =>
    proposta.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formatTipoProposta(proposta.tipo_proposta).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DryStoreSidebar />
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center">
              <SidebarTrigger className="ml-4" />
              <div className="flex-1" />
            </div>
          </header>
          
          <main className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Propostas</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar propostas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <NotificacaoRealTime />
              <Dialog open={mostrarModal} onOpenChange={setMostrarModal}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Proposta
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Nova Proposta</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clienteNome">Nome do Cliente *</Label>
                        <Input
                          id="clienteNome"
                          value={formData.clienteNome}
                          onChange={(e) => setFormData(prev => ({ ...prev, clienteNome: e.target.value }))}
                          placeholder="Nome completo"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="clienteEmail">Email *</Label>
                        <Input
                          id="clienteEmail"
                          type="email"
                          value={formData.clienteEmail}
                          onChange={(e) => setFormData(prev => ({ ...prev, clienteEmail: e.target.value }))}
                          placeholder="email@exemplo.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clienteWhatsapp">WhatsApp</Label>
                        <Input
                          id="clienteWhatsapp"
                          value={formData.clienteWhatsapp}
                          onChange={(e) => setFormData(prev => ({ ...prev, clienteWhatsapp: e.target.value }))}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tipo">Tipo de Proposta *</Label>
                        <Select value={formData.tipo} onValueChange={(value: TipoProposta) => setFormData(prev => ({ ...prev, tipo: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="energia-solar">
                              <div className="flex items-center space-x-2">
                                <Zap className="w-4 h-4" />
                                <span>Energia Solar</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="telhas">
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4" />
                                <span>Telhas</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="divisorias">
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4" />
                                <span>Divisórias</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="pisos">
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4" />
                                <span>Pisos</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="forros">
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4" />
                                <span>Forros</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="clienteEndereco">Endereço</Label>
                      <Input
                        id="clienteEndereco"
                        value={formData.clienteEndereco}
                        onChange={(e) => setFormData(prev => ({ ...prev, clienteEndereco: e.target.value }))}
                        placeholder="Endereço completo"
                      />
                    </div>

                    <div>
                      <Label htmlFor="observacoes">Observações</Label>
                      <Textarea
                        id="observacoes"
                        value={formData.observacoes}
                        onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                        placeholder="Observações adicionais..."
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label>Documento *</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {formData.tipo === "energia-solar" 
                            ? "Envie a foto/PDF da conta de luz" 
                            : "Envie o PDF do projeto ou documentação"
                          }
                        </p>
                        {formData.arquivo && (
                          <p className="text-sm font-medium mt-2 text-primary">
                            {formData.arquivo.name}
                          </p>
                        )}
                        <input 
                          type="file" 
                          className="hidden" 
                          id="arquivo"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setFormData(prev => ({ ...prev, arquivo: file }));
                            }
                          }}
                        />
                        <Button 
                          type="button"
                          variant="outline" 
                          className="mt-2"
                          onClick={() => document.getElementById('arquivo')?.click()}
                        >
                          {formData.arquivo ? 'Trocar Arquivo' : 'Selecionar Arquivo'}
                        </Button>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        type="button"
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setMostrarModal(false)}
                        disabled={uploading || processing}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit"
                        className="flex-1"
                        disabled={!formData.tipo || !formData.arquivo || !formData.clienteNome || !formData.clienteEmail || uploading || processing}
                      >
                        {uploading ? "Enviando..." : processing ? "Processando..." : "Criar Proposta"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {loading ? (
                <div className="text-center py-8">
                  <p>Carregando propostas...</p>
                </div>
              ) : filteredPropostas.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchTerm ? "Nenhuma proposta encontrada." : "Nenhuma proposta criada ainda."}
                  </p>
                </div>
              ) : (
                filteredPropostas.map((proposta) => (
                  <Card key={proposta.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-medium">
                        {proposta.cliente_nome}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        {proposta.data_visualizacao && (
                          <Badge variant="outline" className="text-xs">
                            Visualizada
                          </Badge>
                        )}
                        <Badge variant={getStatusColor(proposta.status)}>
                          {getStatusText(proposta.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{formatTipoProposta(proposta.tipo_proposta)}</p>
                          <p className="text-xs text-muted-foreground">
                            Criada em {new Date(proposta.created_at).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {proposta.cliente_email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            {proposta.valor_total ? `R$ ${proposta.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Calculando...'}
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => navigate(`/proposta/${proposta.url_unica}`)}
                          >
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Propostas;