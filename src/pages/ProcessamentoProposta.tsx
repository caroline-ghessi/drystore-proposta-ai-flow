import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, FileText, Zap, Calculator } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const ProcessamentoProposta = () => {
  const [etapa, setEtapa] = useState(1);
  const [progress, setProgress] = useState(0);
  const [dadosExtraidos, setDadosExtraidos] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { tipoProduto, arquivo } = location.state || {};

  useEffect(() => {
    // Simular processamento automático
    const timer = setTimeout(() => {
      if (etapa === 1) {
        setProgress(25);
        setEtapa(2);
        // Simular extração de dados
        setDadosExtraidos(tipoProduto === "energia-solar" ? {
          consumoMedio: "450 kWh/mês",
          valorConta: "R$ 680,00",
          tipoLigacao: "Trifásica",
          endereco: "Rua das Flores, 123 - São Paulo/SP"
        } : {
          tipoObra: "Construção Residencial",
          metragem: "120 m²",
          prazo: "6 meses",
          orcamento: "R$ 250.000,00"
        });
      } else if (etapa === 2) {
        setProgress(50);
        setEtapa(3);
      } else if (etapa === 3) {
        setProgress(75);
        setEtapa(4);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [etapa, tipoProduto]);

  const handleSalvarProposta = () => {
    setProgress(100);
    setTimeout(() => {
      navigate("/propostas");
    }, 1000);
  };

  const etapas = [
    { id: 1, titulo: "Processamento", icone: FileText },
    { id: 2, titulo: "Extração", icone: Zap },
    { id: 3, titulo: "Cálculos", icone: Calculator },
    { id: 4, titulo: "Revisão", icone: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header com progresso */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Processando Proposta</CardTitle>
            <div className="flex justify-center items-center space-x-4 mt-4">
              {etapas.map((item) => {
                const Icon = item.icone;
                return (
                  <div key={item.id} className="flex flex-col items-center space-y-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      etapa >= item.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium">{item.titulo}</span>
                  </div>
                );
              })}
            </div>
            <Progress value={progress} className="mt-4" />
          </CardHeader>
        </Card>

        {/* Conteúdo baseado na etapa */}
        {etapa < 4 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {etapa === 1 && "Analisando documento..."}
                {etapa === 2 && "Extraindo dados automaticamente..."}
                {etapa === 3 && "Calculando equipamentos e custos..."}
              </h3>
              <p className="text-muted-foreground">
                {etapa === 1 && "Processando arquivo enviado com inteligência artificial"}
                {etapa === 2 && "Identificando informações relevantes para a proposta"}
                {etapa === 3 && "Gerando cálculos precisos baseados nos dados extraídos"}
              </p>
            </CardContent>
          </Card>
        ) : (
          // Formulário de revisão
          <Card>
            <CardHeader>
              <CardTitle>Revisar e Completar Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cliente">Nome do Cliente</Label>
                  <Input id="cliente" placeholder="Digite o nome do cliente" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="cliente@email.com" />
                </div>
              </div>

              {tipoProduto === "energia-solar" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="consumo">Consumo Médio</Label>
                    <Input id="consumo" value={dadosExtraidos?.consumoMedio} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="valor">Valor da Conta</Label>
                    <Input id="valor" value={dadosExtraidos?.valorConta} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="ligacao">Tipo de Ligação</Label>
                    <Select defaultValue={dadosExtraidos?.tipoLigacao}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monofásica">Monofásica</SelectItem>
                        <SelectItem value="Bifásica">Bifásica</SelectItem>
                        <SelectItem value="Trifásica">Trifásica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input id="endereco" value={dadosExtraidos?.endereco} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo-obra">Tipo de Obra</Label>
                    <Input id="tipo-obra" value={dadosExtraidos?.tipoObra} />
                  </div>
                  <div>
                    <Label htmlFor="metragem">Metragem</Label>
                    <Input id="metragem" value={dadosExtraidos?.metragem} />
                  </div>
                  <div>
                    <Label htmlFor="prazo">Prazo</Label>
                    <Input id="prazo" value={dadosExtraidos?.prazo} />
                  </div>
                  <div>
                    <Label htmlFor="orcamento">Orçamento Estimado</Label>
                    <Input id="orcamento" value={dadosExtraidos?.orcamento} />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="observacoes">Observações Adicionais</Label>
                <Textarea id="observacoes" placeholder="Informações extras sobre o projeto..." />
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => navigate("/propostas")}>
                  Cancelar
                </Button>
                <Button onClick={handleSalvarProposta}>
                  Salvar e Criar Página Personalizada
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProcessamentoProposta;