import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useTelhasShingleCompleto } from '@/hooks/useTelhasShingleCompleto';
import type { ParametrosCalculoShingle, ResumoOrcamentoShingleCompleto } from '@/hooks/useTelhasShingleCompleto';
import { 
  Calculator, 
  Home,
  Ruler,
  Package,
  FileText,
  CheckCircle
} from 'lucide-react';

export const CalculadoraTelhas = () => {
  const { toast } = useToast();
  const {
    telhas,
    loading: hookLoading,
    calcularOrcamentoShingleCompleto,
    validarParametros
  } = useTelhasShingleCompleto();

  // Estados do formulário
  const [dimensoes, setDimensoes] = useState({
    area: 100,
    comprimentoCumeeira: 12,
    perimetro: 50,
    comprimentoCalha: 20
  });

  const [configuracoes, setConfiguracoes] = useState({
    telhaId: '',
    corAcessorios: 'CINZA',
    incluirCalha: true,
    incluirManta: true
  });

  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ResumoOrcamentoShingleCompleto | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Carregar telhas disponíveis
  useEffect(() => {
    if (telhas.length > 0 && !configuracoes.telhaId) {
      setConfiguracoes(prev => ({
        ...prev,
        telhaId: telhas[0].codigo
      }));
    }
  }, [telhas.length, configuracoes.telhaId]);

  // Validar formulário em tempo real
  useEffect(() => {
    if (!configuracoes.telhaId) return;
    
    const parametros: ParametrosCalculoShingle = {
      area_telhado: dimensoes.area,
      comprimento_cumeeira: dimensoes.comprimentoCumeeira,
      perimetro_telhado: dimensoes.perimetro,
      comprimento_calha: configuracoes.incluirCalha ? dimensoes.comprimentoCalha : 0,
      telha_codigo: configuracoes.telhaId,
      cor_acessorios: configuracoes.corAcessorios,
      incluir_manta: configuracoes.incluirManta,
      incluir_calha: configuracoes.incluirCalha
    };

    const erros = validarParametros(parametros);
    setValidationErrors(erros);
  }, [dimensoes, configuracoes, validarParametros]);

  const calcular = async () => {
    if (validationErrors.length > 0) {
      toast({
        title: "Erro de Validação",
        description: validationErrors.join(', '),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const parametros: ParametrosCalculoShingle = {
        area_telhado: dimensoes.area,
        comprimento_cumeeira: dimensoes.comprimentoCumeeira,
        perimetro_telhado: dimensoes.perimetro,
        comprimento_calha: configuracoes.incluirCalha ? dimensoes.comprimentoCalha : 0,
        telha_codigo: configuracoes.telhaId,
        cor_acessorios: configuracoes.corAcessorios,
        incluir_manta: configuracoes.incluirManta,
        incluir_calha: configuracoes.incluirCalha
      };

      const resultadoCalculo = await calcularOrcamentoShingleCompleto(parametros);
      
      if (resultadoCalculo) {
        setResultado(resultadoCalculo);
        toast({
          title: "Cálculo Concluído",
          description: `Orçamento calculado: ${formatCurrency(resultadoCalculo.valor_total_geral)}`,
        });
      }
    } catch (error) {
      console.error('Erro ao calcular:', error);
      toast({
        title: "Erro no cálculo",
        description: "Não foi possível calcular o orçamento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const gerarProposta = () => {
    toast({
      title: "Proposta em desenvolvimento",
      description: "Funcionalidade de geração de proposta será implementada em breve."
    });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const telhaAtual = telhas.find(t => t.codigo === configuracoes.telhaId);

  if (hookLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">Carregando calculadora...</div>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Home className="w-6 h-6" />
              Calculadora Telhas Shingle
            </h2>
            <p className="text-muted-foreground">
              Sistema completo incluindo base estrutural, impermeabilização e acessórios
            </p>
          </div>
          {validationErrors.length === 0 && (
            <CheckCircle className="w-6 h-6 text-green-500" />
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coluna Esquerda: Formulário */}
        <div className="space-y-6">
          {/* Dimensões */}
          <Card className="p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              Dimensões do Telhado
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label>Área Total (m²) *</Label>
                <Input
                  type="number"
                  value={dimensoes.area}
                  onChange={(e) => setDimensoes({...dimensoes, area: parseFloat(e.target.value) || 0})}
                  step="0.01"
                  min="1"
                />
              </div>
              
              <div>
                <Label>Comprimento da Cumeeira (m)</Label>
                <Input
                  type="number"
                  value={dimensoes.comprimentoCumeeira}
                  onChange={(e) => setDimensoes({...dimensoes, comprimentoCumeeira: parseFloat(e.target.value) || 0})}
                  step="0.01"
                  min="0"
                />
              </div>
              
              <div>
                <Label>Perímetro do Telhado (m)</Label>
                <Input
                  type="number"
                  value={dimensoes.perimetro}
                  onChange={(e) => setDimensoes({...dimensoes, perimetro: parseFloat(e.target.value) || 0})}
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <Switch
                    checked={configuracoes.incluirCalha}
                    onCheckedChange={(checked) => setConfiguracoes({...configuracoes, incluirCalha: checked})}
                  />
                  <span className="text-sm">Incluir Sistema de Calhas</span>
                </label>
                
                {configuracoes.incluirCalha && (
                  <div>
                    <Label>Comprimento de Calhas (m)</Label>
                    <Input
                      type="number"
                      value={dimensoes.comprimentoCalha}
                      onChange={(e) => setDimensoes({...dimensoes, comprimentoCalha: parseFloat(e.target.value) || 0})}
                      step="0.01"
                      min="0"
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Configurações */}
          <Card className="p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Configurações de Produto
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label>Tipo de Telha *</Label>
                <Select
                  value={configuracoes.telhaId}
                  onValueChange={(value) => setConfiguracoes({...configuracoes, telhaId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a telha..." />
                  </SelectTrigger>
                  <SelectContent>
                   {telhas.map(telha => (
                      <SelectItem key={telha.id} value={telha.codigo}>
                        {telha.nome} - {formatCurrency(telha.valor_total_m2)}/m²
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {telhaAtual && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">{telhaAtual.nome}</p>
                  <div className="text-xs text-muted-foreground mt-1 space-y-1">
                    <p>Valor: {formatCurrency(telhaAtual.valor_total_m2)}/m²</p>
                    <p>Código: {telhaAtual.codigo}</p>
                  </div>
                </div>
              )}
              
              <div>
                <Label>Cor dos Acessórios</Label>
                <Select
                  value={configuracoes.corAcessorios}
                  onValueChange={(value) => setConfiguracoes({...configuracoes, corAcessorios: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CINZA">Cinza</SelectItem>
                    <SelectItem value="MARROM">Marrom</SelectItem>
                    <SelectItem value="PRETO">Preto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <Switch
                    checked={configuracoes.incluirManta}
                    onCheckedChange={(checked) => setConfiguracoes({...configuracoes, incluirManta: checked})}
                  />
                  <span className="text-sm">Incluir Manta Starter</span>
                </label>
              </div>
              
              <Button 
                onClick={calcular} 
                disabled={loading || !configuracoes.telhaId || validationErrors.length > 0}
                className="w-full"
              >
                <Calculator className="w-4 h-4 mr-2" />
                {loading ? 'Calculando...' : 'Calcular Sistema'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Coluna Direita: Resultados */}
        <div>
          <Card className="p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Resultado do Orçamento
            </h3>
            
            {resultado ? (
              <div className="space-y-4">
                {/* Resumo por Categoria */}
                <div className="space-y-2">
                  {Object.entries(resultado.resumo_por_categoria).map(([categoria, resumo]) => (
                    <div key={categoria} className="flex justify-between text-sm">
                      <span>{categoria}:</span>
                      <span>{formatCurrency(resumo.valor_total)}</span>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <span className="font-medium">Valor por m²:</span>
                    <span className="font-bold">
                      {formatCurrency(resultado.valor_por_m2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total Geral:</span>
                    <span className="font-bold text-primary">
                      {formatCurrency(resultado.valor_total_geral)}
                    </span>
                  </div>
                </div>

                {/* Benefícios */}
                {resultado.economia_peso_vs_ceramica && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Economia de Peso
                      </span>
                    </div>
                    <p className="text-xs text-green-700">
                      {resultado.economia_peso_vs_ceramica.toFixed(0)}kg mais leve que telha cerâmica
                    </p>
                  </div>
                )}

                {/* Botão Gerar Proposta */}
                <Button onClick={gerarProposta} className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Gerar Proposta
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Preencha os dados e clique em calcular</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};