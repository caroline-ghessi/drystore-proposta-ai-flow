import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Wind, 
  Calculator, 
  ArrowUp, 
  ArrowDown, 
  Building, 
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DadosVentilacao {
  comprimento_sotao: number;
  largura_sotao: number;
  area_sotao: number;
  razao_ventilacao: number;
  percentual_intake: number;
  ajuste_regional: boolean;
  nfva_total: number;
  nfva_intake: number;
  nfva_exhaust: number;
  produto_intake_selecionado: string;
  produto_exhaust_selecionado: string;
  quantidade_intake: number;
  quantidade_exhaust: number;
  comprimento_linear_disponivel?: number;
}

interface ProdutoVentilacao {
  id: string;
  nome: string;
  nfva: number | null;
  unidade: string;
  tipo: 'intake' | 'exhaust';
  linear?: boolean;
  observacao?: string;
}

interface StepCalculoVentilacaoProps {
  onVentilacaoComplete: (dados: DadosVentilacao) => void;
  onBack: () => void;
  areaTelhado: number;
}

const PRODUTOS_VENTILACAO: ProdutoVentilacao[] = [
  {
    id: 'inflow',
    nome: 'Inflow Owens Corning (1,22m)',
    nfva: 0.0265,
    unidade: 'peça',
    tipo: 'intake'
  },
  {
    id: 'grelha_beiral',
    nome: 'Beiral Ventilado - Grelha',
    nfva: 0.0312,
    unidade: 'peça',
    tipo: 'intake'
  },
  {
    id: 'beiral_lp',
    nome: 'Beiral Ventilado - LP',
    nfva: null,
    unidade: '-',
    tipo: 'intake',
    observacao: 'NFVA não disponível - consultar fabricante'
  },
  {
    id: 'aerador',
    nome: 'Aerador Fabricação DryStore',
    nfva: 0.0072,
    unidade: 'peça',
    tipo: 'exhaust'
  },
  {
    id: 'cumeeira_ventilada',
    nome: 'Cumeeira Ventilada Fabricação DryStore',
    nfva: 0.0142,
    unidade: 'metro linear',
    tipo: 'exhaust',
    linear: true
  }
];

export function StepCalculoVentilacao({ onVentilacaoComplete, onBack, areaTelhado }: StepCalculoVentilacaoProps) {
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [dados, setDados] = useState<DadosVentilacao>(() => {
    // Carregar do localStorage se disponível
    const saved = localStorage.getItem('ventilacao-dados');
    return saved ? JSON.parse(saved) : {
      comprimento_sotao: 0,
      largura_sotao: 0,
      area_sotao: 0,
      razao_ventilacao: 300,
      percentual_intake: 50,
      ajuste_regional: false,
      nfva_total: 0,
      nfva_intake: 0,
      nfva_exhaust: 0,
      produto_intake_selecionado: 'inflow',
      produto_exhaust_selecionado: 'aerador',
      quantidade_intake: 0,
      quantidade_exhaust: 0
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Salvar no localStorage sempre que os dados mudarem
  useEffect(() => {
    localStorage.setItem('ventilacao-dados', JSON.stringify(dados));
  }, [dados]);

  // Calcular área do sótão automaticamente
  useEffect(() => {
    const novaArea = dados.comprimento_sotao * dados.largura_sotao;
    setDados(prev => ({ ...prev, area_sotao: novaArea }));
  }, [dados.comprimento_sotao, dados.largura_sotao]);

  const validarEtapa1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (dados.comprimento_sotao <= 0) {
      newErrors.comprimento = 'Comprimento deve ser maior que 0';
    }
    if (dados.largura_sotao <= 0) {
      newErrors.largura = 'Largura deve ser maior que 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calcularVentilacao = () => {
    const razao = dados.ajuste_regional ? 150 : dados.razao_ventilacao;
    const nfva_total = dados.area_sotao / razao;
    const nfva_intake = nfva_total * (dados.percentual_intake / 100);
    const nfva_exhaust = nfva_total - nfva_intake;

    setDados(prev => ({
      ...prev,
      nfva_total,
      nfva_intake,
      nfva_exhaust
    }));

    setEtapaAtual(3);
  };

  const calcularQuantidades = () => {
    const produtoIntake = PRODUTOS_VENTILACAO.find(p => p.id === dados.produto_intake_selecionado);
    const produtoExhaust = PRODUTOS_VENTILACAO.find(p => p.id === dados.produto_exhaust_selecionado);

    let quantidade_intake = 0;
    let quantidade_exhaust = 0;

    if (produtoIntake?.nfva) {
      quantidade_intake = Math.ceil(dados.nfva_intake / produtoIntake.nfva);
    }

    if (produtoExhaust?.nfva) {
      if (produtoExhaust.linear && dados.comprimento_linear_disponivel) {
        // Para produtos lineares, verificar se o comprimento disponível é suficiente
        const comprimento_necessario = dados.nfva_exhaust / produtoExhaust.nfva;
        if (comprimento_necessario > dados.comprimento_linear_disponivel) {
          toast({
            title: "Atenção",
            description: `Comprimento necessário (${comprimento_necessario.toFixed(2)}m) excede o disponível (${dados.comprimento_linear_disponivel}m). Considere mais camadas ou produtos adicionais.`,
            variant: "destructive"
          });
        }
        quantidade_exhaust = Math.ceil(comprimento_necessario);
      } else {
        quantidade_exhaust = Math.ceil(dados.nfva_exhaust / produtoExhaust.nfva);
      }
    }

    setDados(prev => ({
      ...prev,
      quantidade_intake,
      quantidade_exhaust
    }));

    setEtapaAtual(4);
  };

  const finalizarCalculos = () => {
    onVentilacaoComplete(dados);
  };

  const renderEtapa1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          Etapa 1: Dimensões do Sótão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="comprimento">Comprimento do Sótão (m)</Label>
            <Input
              id="comprimento"
              type="number"
              step="0.01"
              value={dados.comprimento_sotao || ''}
              onChange={(e) => setDados(prev => ({ ...prev, comprimento_sotao: parseFloat(e.target.value) || 0 }))}
              className={errors.comprimento ? 'border-destructive' : ''}
            />
            {errors.comprimento && (
              <p className="text-sm text-destructive mt-1">{errors.comprimento}</p>
            )}
          </div>
          <div>
            <Label htmlFor="largura">Largura do Sótão (m)</Label>
            <Input
              id="largura"
              type="number"
              step="0.01"
              value={dados.largura_sotao || ''}
              onChange={(e) => setDados(prev => ({ ...prev, largura_sotao: parseFloat(e.target.value) || 0 }))}
              className={errors.largura ? 'border-destructive' : ''}
            />
            {errors.largura && (
              <p className="text-sm text-destructive mt-1">{errors.largura}</p>
            )}
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4" />
            <span className="font-medium">Área do Sótão Calculada:</span>
          </div>
          <div className="text-2xl font-bold text-primary">
            {dados.area_sotao.toFixed(2)} m²
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Voltar
          </Button>
          <Button onClick={() => {
            if (validarEtapa1()) {
              setEtapaAtual(2);
            }
          }}>
            Próxima Etapa
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderEtapa2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wind className="w-5 h-5" />
          Etapa 2: Configurações de Ventilação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Razão de Ventilação</Label>
          <Select
            value={dados.razao_ventilacao.toString()}
            onValueChange={(value) => setDados(prev => ({ ...prev, razao_ventilacao: parseInt(value) }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="300">1/300 (Padrão, com barreira de vapor)</SelectItem>
              <SelectItem value="150">1/150 (Sem barreira ou distribuição inadequada)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Balanço de Ventilação - Intake: {dados.percentual_intake}%</Label>
          <div className="mt-2">
            <Slider
              value={[dados.percentual_intake]}
              onValueChange={(value) => setDados(prev => ({ ...prev, percentual_intake: value[0] }))}
              min={50}
              max={60}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>50% (Mínimo)</span>
              <span>60% (Máximo)</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Exhaust: {100 - dados.percentual_intake}%
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="ajuste-regional"
            checked={dados.ajuste_regional}
            onCheckedChange={(checked) => setDados(prev => ({ ...prev, ajuste_regional: checked }))}
          />
          <Label htmlFor="ajuste-regional">
            Incluir ajustes regionais para climas úmidos (usar 1/150 automaticamente)
          </Label>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEtapaAtual(1)}>
            Voltar
          </Button>
          <Button onClick={calcularVentilacao}>
            Calcular Ventilação
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderEtapa3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Etapa 3: Cálculos Principais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">Área do Sótão</div>
            <div className="text-xl font-bold">{dados.area_sotao.toFixed(2)} m²</div>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">NFVA Total Necessária</div>
            <div className="text-xl font-bold text-primary">{dados.nfva_total.toFixed(4)} m²</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDown className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">NFVA Intake (Entrada)</span>
            </div>
            <div className="text-xl font-bold text-blue-600">{dados.nfva_intake.toFixed(4)} m²</div>
            <div className="text-sm text-blue-600">{dados.percentual_intake}% do total</div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUp className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">NFVA Exhaust (Saída)</span>
            </div>
            <div className="text-xl font-bold text-red-600">{dados.nfva_exhaust.toFixed(4)} m²</div>
            <div className="text-sm text-red-600">{100 - dados.percentual_intake}% do total</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEtapaAtual(2)}>
            Voltar
          </Button>
          <Button onClick={() => setEtapaAtual(4)}>
            Selecionar Acessórios
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderEtapa4 = () => {
    const produtoIntake = PRODUTOS_VENTILACAO.find(p => p.id === dados.produto_intake_selecionado);
    const produtoExhaust = PRODUTOS_VENTILACAO.find(p => p.id === dados.produto_exhaust_selecionado);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Etapa 4: Recomendações de Acessórios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-blue-600 font-medium">Produtos para Intake (Entrada)</Label>
              <Select
                value={dados.produto_intake_selecionado}
                onValueChange={(value) => setDados(prev => ({ ...prev, produto_intake_selecionado: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUTOS_VENTILACAO.filter(p => p.tipo === 'intake').map(produto => (
                    <SelectItem key={produto.id} value={produto.id}>
                      {produto.nome} ({produto.unidade})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {produtoIntake?.observacao && (
                <Alert className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{produtoIntake.observacao}</AlertDescription>
                </Alert>
              )}
            </div>

            <div>
              <Label className="text-red-600 font-medium">Produtos para Exhaust (Saída)</Label>
              <Select
                value={dados.produto_exhaust_selecionado}
                onValueChange={(value) => setDados(prev => ({ ...prev, produto_exhaust_selecionado: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUTOS_VENTILACAO.filter(p => p.tipo === 'exhaust').map(produto => (
                    <SelectItem key={produto.id} value={produto.id}>
                      {produto.nome} ({produto.unidade})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {produtoExhaust?.linear && (
                <div className="mt-2">
                  <Label>Comprimento Total Disponível (m)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={dados.comprimento_linear_disponivel || ''}
                    onChange={(e) => setDados(prev => ({ ...prev, comprimento_linear_disponivel: parseFloat(e.target.value) || 0 }))}
                    placeholder="Digite o comprimento disponível"
                  />
                </div>
              )}
            </div>
          </div>

          <Button onClick={calcularQuantidades} className="w-full">
            Calcular Quantidades
          </Button>

          {dados.quantidade_intake > 0 && dados.quantidade_exhaust > 0 && (
            <div className="space-y-4">
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600 mb-1">Recomendação Intake</div>
                  <div className="text-lg font-bold text-blue-600">
                    {dados.quantidade_intake} {produtoIntake?.unidade}
                  </div>
                  <div className="text-sm text-blue-600">
                    {produtoIntake?.nome}
                  </div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-sm text-red-600 mb-1">Recomendação Exhaust</div>
                  <div className="text-lg font-bold text-red-600">
                    {dados.quantidade_exhaust} {produtoExhaust?.unidade}
                  </div>
                  <div className="text-sm text-red-600">
                    {produtoExhaust?.nome}
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Sugestões Adicionais:</strong>
                  <ul className="mt-2 space-y-1">
                    <li>• Garanta telas contra insetos e proteção contra chuva</li>
                    <li>• Recomendado 40-50% exhaust no topo</li>
                    <li>• Ventilação inadequada pode causar condensação</li>
                    <li>• Seguir normas técnicas de instalação</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEtapaAtual(3)}>
              Voltar
            </Button>
            <Button onClick={finalizarCalculos} disabled={!dados.quantidade_intake || !dados.quantidade_exhaust}>
              Finalizar Cálculos
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Calculadora de Ventilação de Telhado</h2>
        <Badge variant="outline">Etapa {etapaAtual} de 4</Badge>
      </div>

      <div className="flex items-center space-x-2">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step <= etapaAtual ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {step}
            </div>
            {step < 4 && (
              <div className={`w-8 h-px ${
                step < etapaAtual ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {etapaAtual === 1 && renderEtapa1()}
      {etapaAtual === 2 && renderEtapa2()}
      {etapaAtual === 3 && renderEtapa3()}
      {etapaAtual === 4 && renderEtapa4()}
    </div>
  );
}