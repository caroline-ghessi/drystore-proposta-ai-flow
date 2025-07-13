import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  X,
  Maximize2,
  Minimize2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: string;
  tipo: 'user' | 'bot';
  conteudo: string;
  timestamp: Date;
}

interface ChatbotVendasProps {
  metrics?: any;
}

export const ChatbotVendas = ({ metrics }: ChatbotVendasProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      tipo: 'bot',
      conteudo: '👋 Olá! Sou seu assistente de vendas inteligente. Posso ajudar com análises de pipeline, estratégias para bater metas e insights sobre oportunidades. Como posso ajudar?',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const enviarMensagem = async (mensagem?: string, tipo: 'consulta' | 'analise_automatica' = 'consulta') => {
    const msgToSend = mensagem || newMessage.trim();
    if (!msgToSend && tipo === 'consulta') return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      tipo: 'user',
      conteudo: msgToSend || 'Análise automática solicitada',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chatbot-vendas', {
        body: { 
          message: msgToSend || 'Faça uma análise completa da situação atual e forneça recomendações estratégicas.',
          tipo 
        }
      });

      if (error) throw error;

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        tipo: 'bot',
        conteudo: data.resposta,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Erro no chatbot:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        tipo: 'bot',
        conteudo: `❌ Erro: ${error.message}. Verifique se a API Key do OpenAI está configurada.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const sugestoes = [
    {
      icon: <TrendingUp className="h-4 w-4" />,
      titulo: "Análise Automática",
      descricao: "Análise completa da situação atual",
      action: () => enviarMensagem('', 'analise_automatica')
    },
    {
      icon: <AlertTriangle className="h-4 w-4" />,
      titulo: "Focar no Pipeline",
      descricao: "Quais propostas priorizar agora?",
      action: () => enviarMensagem('Quais propostas devo priorizar para acelerar o fechamento e bater a meta?')
    },
    {
      icon: <Lightbulb className="h-4 w-4" />,
      titulo: "Estratégias de Conversão",
      descricao: "Como melhorar nossa taxa de conversão?",
      action: () => enviarMensagem('Como posso melhorar nossa taxa de conversão atual? Que estratégias sugere?')
    }
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:scale-105 transition-transform"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        {metrics && metrics.valorNecessario > 0 && (
          <Badge variant="destructive" className="absolute -top-2 -left-2 animate-pulse">
            IA
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={`fixed z-50 transition-all duration-300 ${
      isExpanded 
        ? 'inset-4' 
        : 'bottom-6 right-6 w-96 h-[500px]'
    }`}>
      <Card className="h-full flex flex-col shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Assistente de Vendas</CardTitle>
              <Badge variant="secondary" className="text-xs">IA</Badge>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-4 gap-4">
          {/* Sugestões Rápidas */}
          {messages.length <= 1 && (
            <div className="grid gap-2">
              <p className="text-sm text-muted-foreground mb-2">Sugestões rápidas:</p>
              {sugestoes.map((sugestao, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="justify-start h-auto p-3 text-left"
                  onClick={sugestao.action}
                >
                  <div className="flex items-start gap-2">
                    {sugestao.icon}
                    <div>
                      <div className="font-medium text-sm">{sugestao.titulo}</div>
                      <div className="text-xs text-muted-foreground">{sugestao.descricao}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto space-y-3 max-h-80">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.tipo === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.tipo === 'bot' && (
                  <div className="flex-shrink-0">
                    <Bot className="h-6 w-6 text-primary mt-1" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
                    message.tipo === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.conteudo}
                </div>
                
                {message.tipo === 'user' && (
                  <div className="flex-shrink-0">
                    <User className="h-6 w-6 text-muted-foreground mt-1" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-2 justify-start">
                <Bot className="h-6 w-6 text-primary mt-1" />
                <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                  <div className="flex gap-1">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-3 rounded-full" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua pergunta..."
              onKeyPress={(e) => e.key === 'Enter' && enviarMensagem()}
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={() => enviarMensagem()}
              disabled={loading || !newMessage.trim()}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            IA especializada em análise de vendas • Dados em tempo real
          </p>
        </CardContent>
      </Card>
    </div>
  );
};