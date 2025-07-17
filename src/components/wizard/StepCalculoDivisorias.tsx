import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calculator, Home, Ruler, Layers, FileText, DoorOpen, Zap, Settings } from 'lucide-react';
import { useCalculoMapeamento } from '@/hooks/useCalculoMapeamento';
import { useToast } from '@/hooks/use-toast';
import { useMapeamentosStatus } from '@/hooks/useMapeamentosStatus';

interface ItemCalculado {
  categoria: string;
  descricao: string;
  consumo_base: number;
  quebra_percentual: number;
  consumo_com_quebra: number;
  unidade: string;
  quantidade_final: number;
  preco_unitario: number;
  valor_total: number;
  ordem: number;
}

interface ResumoCalculado {
  valorPlacas: number;
  valorPerfis: number;
  valorIsolamento: number;
  valorAcessorios: number;
  valorAcabamento: number;
  valorTotal: number;
  valorPorM2: number;
  pesoTotal: number;
  areaLiquida: number;
}

interface StepCalculoDivisoriasProps {
  onDataChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const TIPOS_PAREDE = [
  { 
    value: 'Parede Simples ST 73mm', 
    label: 'Simples ST 73mm - Áreas Secas',
    descricao: 'Parede básica para ambientes internos secos'
  },
  { 
    value: 'Parede Simples RU 73mm', 
    label: 'Simples RU 73mm - Áreas Úmidas',
    descricao: 'Parede resistente à umidade'
  },
  { 
    value: 'Parede Performa Acústica 95mm', 
    label: 'Performa 95mm - Alta Performance Acústica',
    descricao: 'Parede com placa Performa para excelente desempenho acústico'
  },
  { 
    value: 'Parede Dupla ST 98mm', 
    label: 'Dupla ST 98mm - Maior Resistência',
    descricao: 'Parede reforçada com maior resistência mecânica'
  },
  { 
    value: 'Parede Acústica 120mm', 
    label: 'Acústica 120mm - Isolamento Sonoro',
    descricao: 'Parede com alta performance acústica'
  },
  { 
    value: 'Parede Corta-Fogo RF 98mm', 
    label: 'Corta-Fogo RF 98mm - Proteção',
    descricao: 'Parede com proteção contra fogo'
  }
];

export function StepCalculoDivisorias({ onDataChange, onNext, onBack }: StepCalculoDivisoriasProps) {
  const { toast } = useToast();
  const { calcularPorMapeamento, obterResumoOrcamento, isLoading, error } = useCalculoMapeamento();
  const { status, isLoading: statusLoading, podeCalcular, obterMensagemStatus } = useMapeamentosStatus();
  const [loading, setLoading] = useState(false);
  
  // Inputs principais
  const [areaParede, setAreaParede] = useState<number>(50);
  const [tipoParedeSelecionado, setTipoParedeSelecionado] = useState<string>('Parede Simples ST 73mm');
  const [peDireito, setPeDireito] = useState<number>(2.80);
  const [comprimentoLinear, setComprimentoLinear] = useState<number>(0);
  
  // Opções
  const [incluirPorta, setIncluirPorta] = useState(false);
  const [quantidadePortas, setQuantidadePortas] = useState(1);
  const [incluirTomadas, setIncluirTomadas] = useState(true);
  const [quantidadeTomadas, setQuantidadeTomadas] = useState(4);
  
  // Resultados
  const [itensCalculados, setItensCalculados] = useState<ItemCalculado[]>([]);
  const [resumo, setResumo] = useState<ResumoCalculado | null>(null);

  // Calcular comprimento linear baseado na área e pé direito
  useEffect(() => {
    if (areaParede > 0 && peDireito > 0) {
      setComprimentoLinear(Number((areaParede / peDireito).toFixed(2)));
    }
  }, [areaParede, peDireito]);

  // Calcular automaticamente quando dados mudarem
  useEffect(() => {
    if (areaParede > 0 && tipoParedeSelecionado) {
      calcular();
    }
  }, [areaParede, tipoParedeSelecionado, peDireito, incluirPorta, quantidadePortas]);

  async function calcular() {
    setLoading(true);
    
    try {
      // Usar sistema de mapeamento
      const itens = await calcularPorMapeamento('divisorias', areaParede, {
        pe_direito: peDireito,
        incluir_porta: incluirPorta,
        quantidade_portas: quantidadePortas,
        tipo_parede: tipoParedeSelecionado
      });
      
      const resumo = await obterResumoOrcamento('divisorias', areaParede, {
        pe_direito: peDireito,
        incluir_porta: incluirPorta,
        quantidade_portas: quantidadePortas
      });
      
      if (itens) {
        // Converter dados do mapeamento para formato esperado
        const itensConvertidos = itens.map((item, index) => ({
          categoria: item.composicao_nome.toUpperCase(),
          descricao: item.item_descricao,
          consumo_base: item.quantidade_liquida,
          quebra_percentual: ((item.quantidade_com_quebra / item.quantidade_liquida) - 1) * 100,
          consumo_com_quebra: item.quantidade_com_quebra,
          unidade: 'un',
          quantidade_final: Math.ceil(item.quantidade_com_quebra),
          preco_unitario: item.preco_unitario,
          valor_total: item.valor_total,
          ordem: item.ordem_calculo
        }));
        
        setItensCalculados(itensConvertidos);
        const resumoCalculado = calcularResumo(itensConvertidos);
        setResumo(resumoCalculado);
        
        // Atualizar dados do wizard
        onDataChange({
          tipoProposta: 'divisorias',
          dadosCalculados: {
            area_parede: areaParede,
            tipo_parede: tipoParedeSelecionado,
            pe_direito: peDireito,
            incluir_porta: incluirPorta,
            quantidade_portas: quantidadePortas,
            itens: itensConvertidos,
            resumo: resumoCalculado
          },
          valor_total: resumo?.valor_total || resumoCalculado.valorTotal
        });
      }
    } catch (error) {
      console.error('Erro ao calcular:', error);
      toast({
        title: "Erro no cálculo",
        description: error || "Não foi possível calcular o orçamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  function calcularResumo(itens: ItemCalculado[]): ResumoCalculado {
    const resumo = {
      valorPlacas: 0,
      valorPerfis: 0,
      valorIsolamento: 0,
      valorAcessorios: 0,
      valorAcabamento: 0,
      valorTotal: 0,
      valorPorM2: 0,
      pesoTotal: 0,
      areaLiquida: areaParede - (incluirPorta ? quantidadePortas * 2.1 : 0)
    };
    
    itens.forEach(item => {
      switch(item.categoria) {
        case 'PLACA':
          resumo.valorPlacas += item.valor_total;
          resumo.pesoTotal += item.quantidade_final * 9; // ~9kg/m² placa
          break;
        case 'PERFIL':
          resumo.valorPerfis += item.valor_total;
          break;
        case 'ISOLAMENTO':
          resumo.valorIsolamento += item.valor_total;
          break;
        case 'ACESSORIO':
          resumo.valorAcessorios += item.valor_total;
          break;
        case 'ACABAMENTO':
          resumo.valorAcabamento += item.valor_total;
          break;
      }
      resumo.valorTotal += item.valor_total;
    });
    
    resumo.valorPorM2 = resumo.valorTotal / resumo.areaLiquida;
    return resumo;
  }

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  const tipoParedeSelecionadoInfo = TIPOS_PAREDE.find(t => t.value === tipoParedeSelecionado);
  
  // Verificar se há produtos configurados
  const podeFazerCalculo = podeCalcular('divisorias');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Home className="w-6 h-6" />
          Calculadora de Drywall (Gesso Acartonado)
        </h2>
        <p className="text-muted-foreground">
          Sistema completo para orçamento de paredes em drywall com entrada manual de dados
        </p>
      </Card>

      {/* Aviso quando não há produtos configurados */}
      {!statusLoading && !podeFazerCalculo && (
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertTitle>Produtos de divisórias não configurados</AlertTitle>
          <AlertDescription>
            Os produtos e composições para divisórias em drywall ainda não foram totalmente configurados no sistema. 
            Você pode continuar o processo, mas os cálculos automáticos de custos podem não estar disponíveis.
            <br />
            <span className="text-sm text-muted-foreground mt-2 block">
              Status atual: {obterMensagemStatus('divisorias')}
            </span>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Dimensões */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Ruler className="w-4 h-4" />
            Dimensões da Parede
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="area">Área Total de Parede (m²)</Label>
              <Input
                id="area"
                type="number"
                value={areaParede}
                onChange={(e) => setAreaParede(parseFloat(e.target.value) || 0)}
                step="0.01"
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="pe-direito">Pé Direito (m)</Label>
              <Input
                id="pe-direito"
                type="number"
                value={peDireito}
                onChange={(e) => setPeDireito(parseFloat(e.target.value) || 0)}
                step="0.01"
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="comprimento">Comprimento Linear (m)</Label>
              <Input
                id="comprimento"
                type="number"
                value={comprimentoLinear}
                readOnly
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Calculado automaticamente: área ÷ pé direito
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="porta-switch" className="flex items-center gap-2">
                  <DoorOpen className="w-4 h-4" />
                  Descontar aberturas de portas
                </Label>
                <Switch
                  id="porta-switch"
                  checked={incluirPorta}
                  onCheckedChange={setIncluirPorta}
                />
              </div>
              
              {incluirPorta && (
                <div>
                  <Label htmlFor="qtd-portas">Quantidade de portas</Label>
                  <Input
                    id="qtd-portas"
                    type="number"
                    value={quantidadePortas}
                    onChange={(e) => setQuantidadePortas(parseInt(e.target.value) || 0)}
                    min="1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Desconto de 2,1m² por porta
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <Label htmlFor="tomada-switch" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Incluir caixas elétricas
                </Label>
                <Switch
                  id="tomada-switch"
                  checked={incluirTomadas}
                  onCheckedChange={setIncluirTomadas}
                />
              </div>
              
              {incluirTomadas && (
                <div>
                  <Label htmlFor="qtd-tomadas">Quantidade de pontos elétricos</Label>
                  <Input
                    id="qtd-tomadas"
                    type="number"
                    value={quantidadeTomadas}
                    onChange={(e) => setQuantidadeTomadas(parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Coluna 2: Tipo de Parede */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Tipo de Parede
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="tipo-parede">Composição da Parede</Label>
              <Select value={tipoParedeSelecionado} onValueChange={setTipoParedeSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de parede" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_PAREDE.map(tipo => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Detalhes da composição selecionada */}
            {tipoParedeSelecionadoInfo && (
              <Card className="p-4 bg-primary/5 border-primary/20">
                <h4 className="font-medium text-sm mb-2">Composição Selecionada:</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {tipoParedeSelecionadoInfo.descricao}
                </p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Placas de gesso (2 faces de 12,5mm)</li>
                  <li>• Estrutura metálica (montantes e guias)</li>
                  <li>• Isolamento acústico (lã de vidro)</li>
                  <li>• Parafusos e fixações</li>
                  <li>• Fita e massa para juntas</li>
                  <li>• Cantoneiras e acabamentos</li>
                </ul>
              </Card>
            )}
            
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                Calculando orçamento...
              </div>
            )}
          </div>
        </Card>

        {/* Coluna 3: Resultados */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Resumo do Orçamento
          </h3>
          
          {resumo && (
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Placas de Gesso:</span>
                  <span>{formatCurrency(resumo.valorPlacas)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estrutura Metálica:</span>
                  <span>{formatCurrency(resumo.valorPerfis)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Isolamento:</span>
                  <span>{formatCurrency(resumo.valorIsolamento)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Acessórios:</span>
                  <span>{formatCurrency(resumo.valorAcessorios)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Acabamento:</span>
                  <span>{formatCurrency(resumo.valorAcabamento)}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between font-medium">
                  <span>Valor por m²:</span>
                  <span>{formatCurrency(resumo.valorPorM2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Valor Total:</span>
                  <span className="text-primary">{formatCurrency(resumo.valorTotal)}</span>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1 pt-2">
                <p>Peso estimado: {resumo.pesoTotal.toFixed(0)} kg</p>
                <p>Área líquida: {resumo.areaLiquida.toFixed(2)} m²</p>
                {incluirPorta && (
                  <p>Desconto de {quantidadePortas} porta(s): -{(quantidadePortas * 2.1).toFixed(1)} m²</p>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Tabela Detalhada */}
      {itensCalculados.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Lista de Materiais Detalhada</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Categoria</th>
                  <th className="text-left">Descrição</th>
                  <th className="text-right">Consumo Base</th>
                  <th className="text-right">Quebra</th>
                  <th className="text-right">Com Quebra</th>
                  <th className="text-right">Qtd Final</th>
                  <th className="text-center">Un</th>
                  <th className="text-right">Preço Un.</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {itensCalculados.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="py-2 capitalize">{item.categoria.toLowerCase()}</td>
                    <td>{item.descricao}</td>
                    <td className="text-right">{item.consumo_base.toFixed(2)}</td>
                    <td className="text-right">{item.quebra_percentual}%</td>
                    <td className="text-right">{item.consumo_com_quebra.toFixed(2)}</td>
                    <td className="text-right font-medium">{item.quantidade_final}</td>
                    <td className="text-center">{item.unidade}</td>
                    <td className="text-right">{formatCurrency(item.preco_unitario)}</td>
                    <td className="text-right font-medium">{formatCurrency(item.valor_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Botões de navegação */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button 
          onClick={onNext}
          disabled={!resumo || loading}
          className="flex items-center gap-2"
        >
          <Calculator className="w-4 h-4" />
          Gerar Proposta
        </Button>
      </div>
    </div>
  );
}