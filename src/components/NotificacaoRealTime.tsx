import { useState, useEffect } from "react";
import { Bell, Eye, CheckCircle, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notificacao {
  id: string;
  tipo: "visualizacao" | "aceitacao" | "contato";
  cliente: string;
  proposta: string;
  timestamp: Date;
  lida: boolean;
}

const NotificacaoRealTime = () => {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [abertas, setAbertas] = useState(false);

  useEffect(() => {
    // Simular notificações em tempo real
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% de chance a cada 5 segundos
        const novaNotificacao: Notificacao = {
          id: Date.now().toString(),
          tipo: ["visualizacao", "aceitacao", "contato"][Math.floor(Math.random() * 3)] as any,
          cliente: ["João Silva", "Maria Santos", "Pedro Costa"][Math.floor(Math.random() * 3)],
          proposta: `#${Math.floor(Math.random() * 1000) + 1}`,
          timestamp: new Date(),
          lida: false
        };
        
        setNotificacoes(prev => [novaNotificacao, ...prev.slice(0, 9)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const marcarComoLida = (id: string) => {
    setNotificacoes(prev => 
      prev.map(n => n.id === id ? { ...n, lida: true } : n)
    );
  };

  const marcarTodasComoLidas = () => {
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
  };

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  const getIconeNotificacao = (tipo: string) => {
    switch (tipo) {
      case "visualizacao":
        return <Eye className="w-4 h-4 text-blue-500" />;
      case "aceitacao":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "contato":
        return <User className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getMensagemNotificacao = (notificacao: Notificacao) => {
    switch (notificacao.tipo) {
      case "visualizacao":
        return `${notificacao.cliente} visualizou a proposta ${notificacao.proposta}`;
      case "aceitacao":
        return `${notificacao.cliente} aceitou a proposta ${notificacao.proposta}`;
      case "contato":
        return `${notificacao.cliente} solicitou contato sobre a proposta ${notificacao.proposta}`;
      default:
        return "Nova notificação";
    }
  };

  const formatarTempo = (timestamp: Date) => {
    const agora = new Date();
    const diff = agora.getTime() - timestamp.getTime();
    const minutos = Math.floor(diff / 60000);
    
    if (minutos < 1) return "Agora";
    if (minutos < 60) return `${minutos}m`;
    if (minutos < 1440) return `${Math.floor(minutos / 60)}h`;
    return `${Math.floor(minutos / 1440)}d`;
  };

  return (
    <Popover open={abertas} onOpenChange={setAbertas}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          {naoLidas > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {naoLidas > 9 ? "9+" : naoLidas}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificações</h3>
          {naoLidas > 0 && (
            <Button variant="ghost" size="sm" onClick={marcarTodasComoLidas}>
              Marcar todas como lidas
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-96">
          {notificacoes.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notificacoes.map((notificacao) => (
                <Card 
                  key={notificacao.id} 
                  className={`m-2 cursor-pointer transition-colors ${
                    !notificacao.lida ? 'bg-primary/5 border-primary/20' : 'bg-background'
                  }`}
                  onClick={() => marcarComoLida(notificacao.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIconeNotificacao(notificacao.tipo)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {getMensagemNotificacao(notificacao)}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatarTempo(notificacao.timestamp)}
                          </span>
                        </div>
                      </div>
                      {!notificacao.lida && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificacaoRealTime;