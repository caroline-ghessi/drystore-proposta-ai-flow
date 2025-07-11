import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, Banknote, Calendar, CheckCircle, Clock, FileText } from "lucide-react";

interface FluxoPagamentoProps {
  proposta: {
    valor: number;
    produtos: string[];
    cliente: string;
  };
  onAceitar: (formaPagamento: string) => void;
}

const FluxoPagamento = ({ proposta, onAceitar }: FluxoPagamentoProps) => {
  const [formaPagamento, setFormaPagamento] = useState("");
  const [etapaConfirmacao, setEtapaConfirmacao] = useState(false);
  const [processando, setProcessando] = useState(false);

  const formasPagamento = [
    {
      id: "cartao",
      nome: "Cartão de Crédito",
      icone: CreditCard,
      descricao: "Parcelamento em até 12x",
      destaque: "Mais Popular"
    },
    {
      id: "pix",
      nome: "PIX",
      icone: Banknote,
      descricao: "5% de desconto à vista",
      destaque: "Melhor Desconto"
    },
    {
      id: "boleto",
      nome: "Boleto Bancário",
      icone: FileText,
      descricao: "Vencimento em 3 dias úteis",
      destaque: null
    },
    {
      id: "financiamento",
      nome: "Financiamento",
      icone: Calendar,
      descricao: "Parcelamento em até 60x",
      destaque: "Menor Parcela"
    }
  ];

  const handleConfirmarAceitacao = () => {
    setProcessando(true);
    
    setTimeout(() => {
      setProcessando(false);
      onAceitar(formaPagamento);
    }, 2000);
  };

  const valorComDesconto = formaPagamento === "pix" 
    ? proposta.valor * 0.95 
    : proposta.valor;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          Aceitar Proposta
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Confirmar Aceitação da Proposta</DialogTitle>
        </DialogHeader>
        
        {!etapaConfirmacao ? (
          <div className="space-y-6">
            {/* Resumo da Proposta */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo da Proposta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Cliente:</span>
                  <span className="font-medium">{proposta.cliente}</span>
                </div>
                <div className="flex justify-between">
                  <span>Produtos:</span>
                  <span className="font-medium">{proposta.produtos.join(", ")}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Valor Total:</span>
                  <span>R$ {proposta.valor.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Formas de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Escolha a Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={formaPagamento} onValueChange={setFormaPagamento}>
                  <div className="space-y-3">
                    {formasPagamento.map((forma) => {
                      const Icon = forma.icone;
                      return (
                        <Label
                          key={forma.id}
                          className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${
                            formaPagamento === forma.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value={forma.id} />
                          <Icon className="w-5 h-5" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{forma.nome}</span>
                              {forma.destaque && (
                                <Badge variant="secondary" className="text-xs">
                                  {forma.destaque}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{forma.descricao}</p>
                          </div>
                          {forma.id === formaPagamento && (
                            <CheckCircle className="w-5 h-5 text-primary" />
                          )}
                        </Label>
                      );
                    })}
                  </div>
                </RadioGroup>
                
                {formaPagamento === "pix" && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-green-800 font-medium">Valor com desconto:</span>
                      <span className="text-green-800 font-bold text-lg">
                        R$ {valorComDesconto.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      Economia de R$ {(proposta.valor - valorComDesconto).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setEtapaConfirmacao(false)}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1"
                onClick={() => setEtapaConfirmacao(true)}
                disabled={!formaPagamento}
              >
                Continuar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            {!processando ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">Confirmar Aceitação</h3>
                  <p className="text-muted-foreground">
                    Você está prestes a aceitar esta proposta com pagamento via{" "}
                    <span className="font-medium">
                      {formasPagamento.find(f => f.id === formaPagamento)?.nome}
                    </span>
                  </p>
                </div>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg">Valor Final:</span>
                      <span className="text-2xl font-bold text-primary">
                        R$ {valorComDesconto.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setEtapaConfirmacao(false)}
                  >
                    Voltar
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleConfirmarAceitacao}
                  >
                    Confirmar Aceitação
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-primary animate-spin" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">Processando Aceitação</h3>
                  <p className="text-muted-foreground">
                    Estamos registrando sua aceitação e notificando nossa equipe...
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FluxoPagamento;