import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Sparkles, ThumbsUp, ThumbsDown, Send, RefreshCw, MessageSquare, Edit3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FollowUpInteligenteProps {
  isOpen: boolean;
  onClose: () => void;
  propostaId: string;
  clienteNome: string;
  clienteWhatsapp?: string;
}

export const FollowUpInteligente: React.FC<FollowUpInteligenteProps> = ({
  isOpen,
  onClose,
  propostaId,
  clienteNome,
  clienteWhatsapp
}) => {
  const [modo, setModo] = useState<'selecionar' | 'ia' | 'manual'>('selecionar');
  const [mensagemGerada, setMensagemGerada] = useState('');
  const [promptMelhoria, setPromptMelhoria] = useState('');
  const [mensagemFinal, setMensagemFinal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [followupId, setFollowupId] = useState<string | null>(null);
  const [tipoFollowup, setTipoFollowup] = useState<string>('');
  const { toast } = useToast();

  const resetModal = () => {
    setModo('selecionar');
    setMensagemGerada('');
    setPromptMelhoria('');
    setMensagemFinal('');
    setTipoFollowup('');
    setFollowupId(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const criarFollowupManual = async () => {
    try {
      const { data, error } = await supabase
        .from('followups_ia')
        .insert({
          proposta_id: propostaId,
          mensagem_gerada: mensagemFinal,
          mensagem_final: mensagemFinal,
          modo: 'manual'
        })
        .select()
        .single();

      if (error) throw error;

      setFollowupId(data.id);

      toast({
        title: "Mensagem criada!",
        description: "Follow-up manual preparado para envio",
      });

    } catch (error) {
      console.error('Erro ao criar follow-up manual:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o follow-up. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const gerarFollowup = async (melhorarExistente = false) => {
    setIsGenerating(true);
    try {
      console.log('Chamando função gerar-followup-ia...');
      
      const { data, error } = await supabase.functions.invoke('gerar-followup-ia', {
        body: {
          propostaId,
          promptMelhoria: melhorarExistente ? promptMelhoria : undefined,
          tipoFollowup: tipoFollowup || undefined,
          modo: 'ia'
        }
      });

      if (error) {
        console.error('Erro na função:', error);
        throw error;
      }

      console.log('Resposta da função:', data);

      setMensagemGerada(data.mensagem);
      setMensagemFinal(data.mensagem);
      setFollowupId(data.followupId);
      
      if (melhorarExistente) {
        setPromptMelhoria('');
      }

      toast({
        title: "Mensagem gerada!",
        description: melhorarExistente ? "Mensagem melhorada com sucesso" : "Nova mensagem de follow-up criada",
      });

    } catch (error) {
      console.error('Erro ao gerar follow-up:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const enviarFeedback = async (positivo: boolean) => {
    if (!followupId) return;

    try {
      await supabase
        .from('followups_ia')
        .update({ 
          feedback_vendedor: positivo ? 1 : -1,
          mensagem_final: mensagemFinal
        })
        .eq('id', followupId);

      toast({
        title: "Feedback enviado!",
        description: "Obrigado por ajudar a melhorar nosso sistema",
      });
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
    }
  };

  const enviarMensagem = async () => {
    if (!mensagemFinal.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma mensagem antes de enviar",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      // Aqui você integraria com seu sistema de WhatsApp
      // Por enquanto, apenas simulamos o envio
      
      // Marcar como enviado no histórico
      if (followupId) {
        await supabase
          .from('followups_ia')
          .update({ 
            enviado: true,
            mensagem_final: mensagemFinal
          })
          .eq('id', followupId);
      } else if (modo === 'manual') {
        // Para modo manual sem followupId, criar o registro
        await criarFollowupManual();
      }

      // Criar link do WhatsApp
      const mensagemEncoded = encodeURIComponent(mensagemFinal);
      const whatsappUrl = clienteWhatsapp 
        ? `https://wa.me/55${clienteWhatsapp.replace(/\D/g, '')}?text=${mensagemEncoded}`
        : `https://wa.me/?text=${mensagemEncoded}`;
      
      window.open(whatsappUrl, '_blank');

      toast({
        title: "Mensagem enviada!",
        description: "WhatsApp aberto com a mensagem pronta",
      });

      handleClose();
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar o envio",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const tiposFollowup = [
    { value: 'primeiro-contato', label: 'Primeiro Contato', color: 'bg-blue-100 text-blue-800' },
    { value: 'segundo-followup', label: 'Esclarecimento', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'terceiro-followup', label: 'Urgência', color: 'bg-red-100 text-red-800' },
    { value: 'objecoes', label: 'Objeções', color: 'bg-purple-100 text-purple-800' },
    { value: 'fechamento', label: 'Fechamento', color: 'bg-green-100 text-green-800' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Follow-up - {clienteNome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção do Modo */}
          {modo === 'selecionar' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Como deseja criar seu follow-up?</h3>
                <p className="text-sm text-muted-foreground">
                  Escolha entre gerar com IA ou escrever manualmente
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
                  onClick={() => setModo('ia')}
                >
                  <CardContent className="p-6 text-center">
                    <Sparkles className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h4 className="font-medium mb-2">Gerar com IA</h4>
                    <p className="text-sm text-muted-foreground">
                      IA cria mensagem personalizada com base no tipo de follow-up
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
                  onClick={() => setModo('manual')}
                >
                  <CardContent className="p-6 text-center">
                    <Edit3 className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h4 className="font-medium mb-2">Escrever Manual</h4>
                    <p className="text-sm text-muted-foreground">
                      Escreva sua própria mensagem personalizada
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Modo IA */}
          {modo === 'ia' && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Follow-up com IA
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setModo('selecionar')}
                >
                  Voltar
                </Button>
              </div>

              <Separator />

              {/* Seletor de tipo de follow-up */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tipo de Follow-up
                </label>
                <div className="flex flex-wrap gap-2">
                  {tiposFollowup.map((tipo) => (
                    <Badge
                      key={tipo.value}
                      className={`cursor-pointer transition-all ${
                        tipoFollowup === tipo.value 
                          ? 'bg-primary text-primary-foreground' 
                          : tipo.color
                      }`}
                      onClick={() => setTipoFollowup(tipo.value)}
                    >
                      {tipo.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Botão gerar */}
              <Button 
                onClick={() => gerarFollowup(false)}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando mensagem inteligente...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar Follow-up com IA
                  </>
                )}
              </Button>

              {/* Mensagem gerada */}
              {mensagemGerada && (
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Mensagem Gerada pela IA
                        </label>
                        <div className="p-3 bg-muted rounded-lg border-l-4 border-primary">
                          <p className="text-sm whitespace-pre-wrap">{mensagemGerada}</p>
                        </div>
                      </div>

                      {/* Feedback */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Como está a mensagem?
                        </span>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => enviarFeedback(true)}
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => enviarFeedback(false)}
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Campo de melhoria */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Quer melhorar? Digite como:
                        </label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Ex: torne mais assertivo, seja mais consultivo..."
                            value={promptMelhoria}
                            onChange={(e) => setPromptMelhoria(e.target.value)}
                          />
                          <Button 
                            size="sm"
                            onClick={() => gerarFollowup(true)}
                            disabled={!promptMelhoria.trim() || isGenerating}
                          >
                            {isGenerating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Edição final */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Mensagem Final (editável)
                        </label>
                        <Textarea
                          value={mensagemFinal}
                          onChange={(e) => setMensagemFinal(e.target.value)}
                          className="min-h-[100px]"
                          placeholder="Edite a mensagem como desejar..."
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          {mensagemFinal.length} caracteres
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Modo Manual */}
          {modo === 'manual' && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-primary" />
                  Follow-up Manual
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setModo('selecionar')}
                >
                  Voltar
                </Button>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Sua Mensagem
                </label>
                <Textarea
                  value={mensagemFinal}
                  onChange={(e) => setMensagemFinal(e.target.value)}
                  className="min-h-[150px]"
                  placeholder="Digite sua mensagem personalizada para o cliente..."
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-muted-foreground">
                    {mensagemFinal.length} caracteres
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {mensagemFinal.length > 1600 ? 'Acima do limite do WhatsApp' : 
                     mensagemFinal.length > 160 ? 'Mensagem longa' : 'Tamanho ideal'}
                  </div>
                </div>
              </div>

              {mensagemFinal.trim() && (
                <Card>
                  <CardContent className="pt-4">
                    <label className="text-sm font-medium mb-2 block">
                      Preview da Mensagem
                    </label>
                    <div className="p-3 bg-muted rounded-lg border-l-4 border-primary">
                      <p className="text-sm whitespace-pre-wrap">{mensagemFinal}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Botões de ação */}
          {modo !== 'selecionar' && (
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={enviarMensagem}
                disabled={!mensagemFinal.trim() || isSending}
                className="flex-1"
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar WhatsApp
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};