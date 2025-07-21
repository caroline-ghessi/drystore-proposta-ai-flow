import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Calendar, Percent, Filter, Eye, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FollowUpInteligente } from "./FollowUpInteligente";
import { ModalQuantitativosPropostas } from "./propostas/ModalQuantitativosPropostas";

interface Proposta {
  id: string;
  cliente: string;
  valor: string;
  status: "aberta" | "aceita" | "expirada" | "processando" | "enviada" | "visualizada";
  tipo: string;
  data: string;
  url_unica?: string;
  whatsapp?: string;
}

interface PropostasTableProps {
  propostas: Proposta[];
}

const PropostasTable = ({ propostas }: PropostasTableProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [lembreteData, setLembreteData] = useState({ proposta: "", data: "", observacao: "" });
  const [descontoData, setDescontoData] = useState({ proposta: "", percentual: "", motivo: "" });
  const [followUpInteligenteOpen, setFollowUpInteligenteOpen] = useState(false);
  const [propostaSelecionada, setPropostaSelecionada] = useState<Proposta | null>(null);
  const [quantitativosModalOpen, setQuantitativosModalOpen] = useState(false);
  const [propostaQuantitativos, setPropostaQuantitativos] = useState<Proposta | null>(null);

  const filteredPropostas = propostas.filter(proposta => 
    statusFilter === "todos" || proposta.status === statusFilter
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "aceita": return "default";
      case "aberta": case "enviada": case "visualizada": return "secondary";
      case "processando": return "outline";
      case "expirada": return "destructive";
      default: return "secondary";
    }
  };

  const handleFollowUpInteligente = (proposta: Proposta) => {
    setPropostaSelecionada(proposta);
    setFollowUpInteligenteOpen(true);
  };

  const handleAgendar = () => {
    toast({
      title: "Lembrete Agendado",
      description: `Lembrete configurado para ${lembreteData.data}`,
    });
    setLembreteData({ proposta: "", data: "", observacao: "" });
  };

  const handleSolicitarDesconto = () => {
    toast({
      title: "Desconto Solicitado",
      description: `Solicitação de ${descontoData.percentual}% enviada para aprovação`,
    });
    setDescontoData({ proposta: "", percentual: "", motivo: "" });
  };

  const handleVerProposta = (proposta: Proposta) => {
    if (proposta.url_unica) {
      navigate(`/proposta/${proposta.url_unica}`);
    } else {
      toast({
        title: "Erro",
        description: "URL da proposta não encontrada",
        variant: "destructive",
      });
    }
  };

  const handleQuantitativos = (proposta: Proposta) => {
    setPropostaQuantitativos(proposta);
    setQuantitativosModalOpen(true);
  };

  const isPropostaShingle = (tipo: string) => {
    return tipo.toLowerCase().includes('telha') && tipo.toLowerCase().includes('shingle');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Minhas Propostas</CardTitle>
            <CardDescription>Gerencie suas propostas e acompanhe o status</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Status</SelectItem>
                <SelectItem value="aberta">Aberta</SelectItem>
                <SelectItem value="enviada">Enviada</SelectItem>
                <SelectItem value="visualizada">Visualizada</SelectItem>
                <SelectItem value="aceita">Aceita</SelectItem>
                <SelectItem value="expirada">Expirada</SelectItem>
                <SelectItem value="processando">Processando</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPropostas.map((proposta) => (
              <TableRow key={proposta.id}>
                <TableCell className="font-medium">{proposta.cliente}</TableCell>
                <TableCell>{proposta.valor}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(proposta.status)}>
                    {proposta.status}
                  </Badge>
                </TableCell>
                <TableCell>{proposta.tipo}</TableCell>
                <TableCell>{proposta.data}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {/* Ver Proposta Button */}
                    <Button size="sm" variant="outline" onClick={() => handleVerProposta(proposta)}>
                      <Eye className="h-4 w-4" />
                    </Button>

                    {/* Quantitativos Button - apenas para propostas shingle */}
                    {isPropostaShingle(proposta.tipo) && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleQuantitativos(proposta)}
                        className="gap-1"
                        title="Ver Quantitativos"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                      </Button>
                    )}

                    {/* Follow-up Unificado */}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleFollowUpInteligente(proposta)}
                      className="gap-1"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Follow-up
                    </Button>

                    {/* Lembrete Button */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setLembreteData({ ...lembreteData, proposta: proposta.id })}>
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Agendar Lembrete</DialogTitle>
                          <DialogDescription>
                            Configure um lembrete para acompanhar esta proposta
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="dataLembrete">Data e Hora</Label>
                            <Input
                              id="dataLembrete"
                              type="datetime-local"
                              value={lembreteData.data}
                              onChange={(e) => setLembreteData({ ...lembreteData, data: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="observacao">Observação</Label>
                            <Textarea
                              id="observacao"
                              value={lembreteData.observacao}
                              onChange={(e) => setLembreteData({ ...lembreteData, observacao: e.target.value })}
                              placeholder="Adicione uma observação..."
                            />
                          </div>
                          <Button onClick={handleAgendar} className="w-full">
                            Agendar Lembrete
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Desconto Button */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setDescontoData({ ...descontoData, proposta: proposta.id })}>
                          <Percent className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Solicitar Desconto</DialogTitle>
                          <DialogDescription>
                            Solicite aprovação para desconto na proposta de {proposta.cliente}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="percentual">Percentual de Desconto (%)</Label>
                            <Input
                              id="percentual"
                              type="number"
                              max="50"
                              value={descontoData.percentual}
                              onChange={(e) => setDescontoData({ ...descontoData, percentual: e.target.value })}
                              placeholder="Ex: 10"
                            />
                          </div>
                          <div>
                            <Label htmlFor="motivo">Motivo do Desconto</Label>
                            <Textarea
                              id="motivo"
                              value={descontoData.motivo}
                              onChange={(e) => setDescontoData({ ...descontoData, motivo: e.target.value })}
                              placeholder="Justifique a solicitação..."
                            />
                          </div>
                          <Button onClick={handleSolicitarDesconto} className="w-full">
                            Solicitar Aprovação
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      
      {/* Modal de Follow-up Inteligente */}
      {propostaSelecionada && (
        <FollowUpInteligente
          isOpen={followUpInteligenteOpen}
          onClose={() => {
            setFollowUpInteligenteOpen(false);
            setPropostaSelecionada(null);
          }}
          propostaId={propostaSelecionada.id}
          clienteNome={propostaSelecionada.cliente}
          clienteWhatsapp={propostaSelecionada.whatsapp}
        />
      )}

      {/* Modal de Quantitativos */}
      {propostaQuantitativos && (
        <ModalQuantitativosPropostas
          isOpen={quantitativosModalOpen}
          onClose={() => {
            setQuantitativosModalOpen(false);
            setPropostaQuantitativos(null);
          }}
          propostaId={propostaQuantitativos.id}
          clienteNome={propostaQuantitativos.cliente}
        />
      )}
    </Card>
  );
};

export default PropostasTable;
