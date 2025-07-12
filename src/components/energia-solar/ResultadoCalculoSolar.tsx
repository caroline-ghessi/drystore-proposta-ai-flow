import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Calculator, 
  TrendingUp, 
  Clock, 
  Lightbulb, 
  DollarSign,
  Download,
  Share2,
  Info
} from 'lucide-react';
import { CalculoCompleto } from '@/hooks/useEnergiaSolar';
import { EnergiaSolarCalculos } from '@/services/energiaSolarCalculos';

interface ResultadoCalculoSolarProps {
  resultado: CalculoCompleto;
  onGerarProposta?: () => void;
  onCompartilhar?: () => void;
}

export const ResultadoCalculoSolar = ({ 
  resultado, 
  onGerarProposta, 
  onCompartilhar 
}: ResultadoCalculoSolarProps) => {
  const { dimensionamento, equipamentos, orcamento, analise_financeira, resumo_proposta } = resultado;

  // Calcular dimensões do sistema
  const dimensoesSistema = EnergiaSolarCalculos.calcularDimensoesSistema(
    equipamentos.painel.quantidade
  );

  // Calcular economia detalhada
  const economiaDetalhada = EnergiaSolarCalculos.calcularEconomiaDetalhada(
    dimensionamento.geracao_estimada_anual,
    0.75 // tarifa padrão
  );

  const formatarMoeda = (valor: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  const formatarNumero = (valor: number) => 
    new Intl.NumberFormat('pt-BR').format(Math.round(valor));

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Potência do Sistema</p>
                <p className="text-2xl font-bold">{dimensionamento.potencia_necessaria_kwp} kWp</p>
              </div>
              <Zap className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Economia/Mês</p>
                <p className="text-2xl font-bold">{formatarMoeda(dimensionamento.economia_mensal_estimada * 0.75)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Investimento</p>
                <p className="text-2xl font-bold">{formatarMoeda(orcamento.valor_total)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Payback</p>
                <p className="text-2xl font-bold">{analise_financeira.payback_simples_anos} anos</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Destaque de Economia */}
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Lightbulb className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-semibold">Sua Economia com Energia Solar</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {resumo_proposta.economia_percentual}% de economia na conta de luz
            </p>
            <p className="text-muted-foreground">
              Sistema paga a si mesmo em {resumo_proposta.retorno_investimento}
            </p>
            <div className="w-full max-w-md mx-auto">
              <Progress value={resumo_proposta.economia_percentual} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalhes em Tabs */}
      <Tabs defaultValue="equipamentos" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="tecnico">Técnico</TabsTrigger>
          <TabsTrigger value="projecao">Projeção</TabsTrigger>
        </TabsList>

        {/* Tab Equipamentos */}
        <TabsContent value="equipamentos" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Painéis Solares</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modelo:</span>
                  <span className="font-medium">{equipamentos.painel.modelo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fabricante:</span>
                  <span className="font-medium">{equipamentos.painel.fabricante}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantidade:</span>
                  <Badge variant="secondary">{equipamentos.painel.quantidade} unidades</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Potência Unitária:</span>
                  <span className="font-medium">{equipamentos.painel.potencia_unitaria} Wp</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Potência Total:</span>
                  <span className="font-medium">{formatarNumero(equipamentos.painel.potencia_total)} Wp</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Valor Total:</span>
                  <span>{formatarMoeda(equipamentos.painel.preco_total)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Inversor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modelo:</span>
                  <span className="font-medium">{equipamentos.inversor.modelo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fabricante:</span>
                  <span className="font-medium">{equipamentos.inversor.fabricante}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Potência:</span>
                  <span className="font-medium">{formatarNumero(equipamentos.inversor.potencia)} W</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantidade:</span>
                  <Badge variant="secondary">1 unidade</Badge>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Valor:</span>
                  <span>{formatarMoeda(equipamentos.inversor.preco)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Financeiro */}
        <TabsContent value="financeiro" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Composição do Investimento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Painéis Solares:</span>
                  <span className="font-medium">{formatarMoeda(orcamento.equipamentos.paineis)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inversor:</span>
                  <span className="font-medium">{formatarMoeda(orcamento.equipamentos.inversor)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Instalação:</span>
                  <span className="font-medium">{formatarMoeda(orcamento.instalacao)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formatarMoeda(orcamento.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Margem ({orcamento.margem_aplicada}%):</span>
                  <span className="font-medium">{formatarMoeda(orcamento.valor_total - orcamento.subtotal)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>{formatarMoeda(orcamento.valor_total)}</span>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  {formatarMoeda(orcamento.valor_kwp_instalado)}/kWp instalado
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Análise de Retorno</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Economia Anual:</span>
                  <span className="font-medium">{formatarMoeda(analise_financeira.economia_anual)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payback Simples:</span>
                  <span className="font-medium">{analise_financeira.payback_simples_anos} anos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payback Descontado:</span>
                  <span className="font-medium">{analise_financeira.payback_descontado_anos} anos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VPL (25 anos):</span>
                  <span className="font-medium text-green-600">{formatarMoeda(analise_financeira.vpl_25_anos)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TIR Estimada:</span>
                  <span className="font-medium">{analise_financeira.tir_estimada}% a.a.</span>
                </div>
                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="flex items-center gap-2 text-sm">
                    <Info className="h-4 w-4" />
                    <span>
                      Excelente investimento! VPL positivo indica alta rentabilidade.
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Técnico */}
        <TabsContent value="tecnico" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Especificações do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Irradiação Local:</span>
                  <span className="font-medium">{dimensionamento.irradiacao_local} kWh/m²/dia</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Geração Anual:</span>
                  <span className="font-medium">{formatarNumero(dimensionamento.geracao_estimada_anual)} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fator de Perdas:</span>
                  <span className="font-medium">{(dimensionamento.fatores_utilizados.fator_perdas * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fator de Segurança:</span>
                  <span className="font-medium">{((dimensionamento.fatores_utilizados.fator_seguranca - 1) * 100).toFixed(0)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dimensões e Peso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Área dos Painéis:</span>
                  <span className="font-medium">{dimensoesSistema.area_paineis_m2} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Área Total Necessária:</span>
                  <span className="font-medium">{dimensoesSistema.area_total_necessaria_m2} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peso Estimado:</span>
                  <span className="font-medium">{dimensoesSistema.peso_estimado_kg} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Arranjo Sugerido:</span>
                  <span className="font-medium">{dimensoesSistema.dimensao_sugerida}</span>
                </div>
                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="text-sm">
                    <strong>Nota:</strong> Área total inclui espaçamento para manutenção e sombreamento entre fileiras.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Projeção */}
        <TabsContent value="projecao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Projeção de Economia - 25 anos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Ano</th>
                      <th className="text-right p-2">Geração (kWh)</th>
                      <th className="text-right p-2">Tarifa (R$/kWh)</th>
                      <th className="text-right p-2">Economia Anual</th>
                      <th className="text-right p-2">Economia Acumulada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {economiaDetalhada.map((linha, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{linha.anos}</td>
                        <td className="text-right p-2">{formatarNumero(linha.geracao_kwh)}</td>
                        <td className="text-right p-2">R$ {linha.tarifa_kwh}</td>
                        <td className="text-right p-2">{formatarMoeda(linha.economia_anual)}</td>
                        <td className="text-right p-2 font-semibold">
                          {formatarMoeda(linha.economia_acumulada)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-md">
                <p className="text-sm text-green-800">
                  <strong>Economia total em 25 anos:</strong> {formatarMoeda(economiaDetalhada[economiaDetalhada.length - 1]?.economia_acumulada || 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={onGerarProposta} className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Gerar Proposta Comercial
        </Button>
        <Button variant="outline" onClick={onCompartilhar} className="flex-1">
          <Share2 className="w-4 h-4 mr-2" />
          Compartilhar Resultado
        </Button>
      </div>
    </div>
  );
};