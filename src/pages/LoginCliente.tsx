import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, MessageCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const LoginCliente = () => {
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [codigo, setCodigo] = useState("");
  const [etapa, setEtapa] = useState("login");
  const [metodoEscolhido, setMetodoEscolhido] = useState<"email" | "whatsapp">("email");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEnviarCodigo = (metodo: "email" | "whatsapp") => {
    setMetodoEscolhido(metodo);
    setEtapa("verificacao");
    
    toast({
      title: "Código enviado!",
      description: metodo === "email" 
        ? `Código de verificação enviado para ${email}`
        : `Código de verificação enviado para ${whatsapp}`,
    });
  };

  const handleVerificarCodigo = () => {
    if (codigo === "123456") { // Simulação
      setEtapa("sucesso");
      setTimeout(() => {
        navigate("/cliente-portal");
      }, 2000);
    } else {
      toast({
        title: "Código inválido",
        description: "Verifique o código e tente novamente",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Acesso do Cliente</CardTitle>
          <p className="text-muted-foreground">
            {etapa === "login" && "Escolha como deseja acessar suas propostas"}
            {etapa === "verificacao" && "Digite o código de verificação"}
            {etapa === "sucesso" && "Acesso autorizado!"}
          </p>
        </CardHeader>
        <CardContent>
          {etapa === "login" && (
            <Tabs defaultValue="email" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </TabsTrigger>
                <TabsTrigger value="whatsapp" className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="email" className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleEnviarCodigo("email")}
                  disabled={!email}
                >
                  Enviar Código por Email
                </Button>
              </TabsContent>
              
              <TabsContent value="whatsapp" className="space-y-4">
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleEnviarCodigo("whatsapp")}
                  disabled={!whatsapp}
                >
                  Enviar Código por WhatsApp
                </Button>
              </TabsContent>
            </Tabs>
          )}

          {etapa === "verificacao" && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  {metodoEscolhido === "email" ? (
                    <Mail className="w-8 h-8 text-primary" />
                  ) : (
                    <MessageCircle className="w-8 h-8 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Código enviado para {metodoEscolhido === "email" ? email : whatsapp}
                </p>
              </div>
              
              <div>
                <Label htmlFor="codigo">Código de Verificação</Label>
                <Input
                  id="codigo"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="123456"
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleVerificarCodigo}
                disabled={codigo.length !== 6}
              >
                Verificar Código
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => setEtapa("login")}
              >
                Voltar
              </Button>
            </div>
          )}

          {etapa === "sucesso" && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Acesso Autorizado!</h3>
                <p className="text-muted-foreground">Redirecionando para suas propostas...</p>
              </div>
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginCliente;