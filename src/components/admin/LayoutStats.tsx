import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  CheckCircle, 
  Clock,
  Users,
  Calendar,
  Target
} from 'lucide-react';

interface LayoutStatsProps {
  layoutId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface Estatistica {
  data_evento: string;
  visualizacoes: number;
  conversoes: number;
  taxa_conversao: number;
  tempo_medio_visualizacao?: unknown;
}

interface MetricaResumo {
  totalVisualizacoes: number;
  totalConversoes: number;
  taxaConversaoMedia: number;
  tempoMedioVisualizacao: number;
  tendenciaVisualizacoes: 'up' | 'down' | 'stable';
  tendenciaConversoes: 'up' | 'down' | 'stable';
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export function LayoutStats({ layoutId, isOpen, onClose }: LayoutStatsProps) {
  const [layout, setLayout] = useState<any>(null);
  const [estatisticas, setEstatisticas] = useState<Estatistica[]>([]);
  const [metricas, setMetricas] = useState<MetricaResumo | null>(null);
  const [loading, setLoading] = useState(false);
  const [periodo, setPeriodo] = useState<'7d' | '30d' | '90d'>('30d');
  const { toast } = useToast();

  useEffect(() => {
    if (layoutId && isOpen) {
      carregarDados();
    }
  }, [layoutId, isOpen, periodo]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Buscar informações do layout
      const { data: layoutData, error: layoutError } = await supabase
        .from('layout_configuracoes')
        .select('*')
        .eq('id', layoutId)
        .single();

      if (layoutError) throw layoutError;
      setLayout(layoutData);

      // Calcular data de início baseado no período
      const dataInicio = new Date();
      const diasAtras = periodo === '7d' ? 7 : periodo === '30d' ? 30 : 90;
      dataInicio.setDate(dataInicio.getDate() - diasAtras);

      // Buscar estatísticas do período
      const { data: statsData, error: statsError } = await supabase
        .from('layout_estatisticas')
        .select('*')
        .eq('layout_id', layoutId)
        .gte('data_evento', dataInicio.toISOString().split('T')[0])
        .order('data_evento', { ascending: true });

      if (statsError) throw statsError;

      setEstatisticas(statsData || []);
      calcularMetricas(statsData || []);

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularMetricas = (stats: Estatistica[]) => {
    if (stats.length === 0) {
      setMetricas({
        totalVisualizacoes: 0,
        totalConversoes: 0,
        taxaConversaoMedia: 0,
        tempoMedioVisualizacao: 0,
        tendenciaVisualizacoes: 'stable',
        tendenciaConversoes: 'stable'
      });
      return;
    }

    const totalVisualizacoes = stats.reduce((sum, stat) => sum + stat.visualizacoes, 0);
    const totalConversoes = stats.reduce((sum, stat) => sum + stat.conversoes, 0);
    const taxaConversaoMedia = totalVisualizacoes > 0 ? (totalConversoes / totalVisualizacoes) * 100 : 0;

    // Calcular tendências (comparar primeira metade com segunda metade)
    const meio = Math.floor(stats.length / 2);
    const primeiraMetade = stats.slice(0, meio);
    const segundaMetade = stats.slice(meio);

    const visualizacoesPrimeiraMetade = primeiraMetade.reduce((sum, stat) => sum + stat.visualizacoes, 0);
    const visualizacoesSegundaMetade = segundaMetade.reduce((sum, stat) => sum + stat.visualizacoes, 0);
    const conversoesPrimeiraMetade = primeiraMetade.reduce((sum, stat) => sum + stat.conversoes, 0);
    const conversoesSegundaMetade = segundaMetade.reduce((sum, stat) => sum + stat.conversoes, 0);

    const tendenciaVisualizacoes = 
      visualizacoesSegundaMetade > visualizacoesPrimeiraMetade * 1.1 ? 'up' :
      visualizacoesSegundaMetade < visualizacoesPrimeiraMetade * 0.9 ? 'down' : 'stable';

    const tendenciaConversoes = 
      conversoesSegundaMetade > conversoesPrimeiraMetade * 1.1 ? 'up' :
      conversoesSegundaMetade < conversoesPrimeiraMetade * 0.9 ? 'down' : 'stable';

    setMetricas({
      totalVisualizacoes,
      totalConversoes,
      taxaConversaoMedia,
      tempoMedioVisualizacao: 0, // Implementar depois
      tendenciaVisualizacoes,
      tendenciaConversoes
    });
  };

  const dadosGraficoTempo = estatisticas.map(stat => ({
    data: new Date(stat.data_evento).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    visualizacoes: stat.visualizacoes,
    conversoes: stat.conversoes,
    taxa: (stat.taxa_conversao * 100).toFixed(1)
  }));

  const dadosGraficoPizza = [
    { name: 'Conversões', value: metricas?.totalConversoes || 0 },
    { name: 'Visualizações sem conversão', value: (metricas?.totalVisualizacoes || 0) - (metricas?.totalConversoes || 0) }
  ].filter(item => item.value > 0);

  if (!layout) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Estatísticas - {layout.nome}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Seletor de Período */}
            <div className="flex justify-between items-center">
              <Badge variant={layout.ativo ? "default" : "secondary"}>
                {layout.ativo ? "Layout Ativo" : "Layout Inativo"}
              </Badge>
              <div className="flex gap-2">
                {(['7d', '30d', '90d'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriodo(p)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      periodo === p
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metricas?.totalVisualizacoes.toLocaleString() || 0}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {metricas?.tendenciaVisualizacoes === 'up' && <TrendingUp className="h-3 w-3 text-green-500 mr-1" />}
                    {metricas?.tendenciaVisualizacoes === 'down' && <TrendingDown className="h-3 w-3 text-red-500 mr-1" />}
                    Últimos {periodo === '7d' ? '7' : periodo === '30d' ? '30' : '90'} dias
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Conversões</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metricas?.totalConversoes.toLocaleString() || 0}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {metricas?.tendenciaConversoes === 'up' && <TrendingUp className="h-3 w-3 text-green-500 mr-1" />}
                    {metricas?.tendenciaConversoes === 'down' && <TrendingDown className="h-3 w-3 text-red-500 mr-1" />}
                    Propostas aceitas
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metricas?.taxaConversaoMedia.toFixed(1) || 0}%</div>
                  <div className="text-xs text-muted-foreground">
                    Média do período
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Uso do Layout</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estatisticas.length}</div>
                  <div className="text-xs text-muted-foreground">
                    Dias com atividade
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="conversao">Taxa de Conversão</TabsTrigger>
                <TabsTrigger value="distribuicao">Distribuição</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Visualizações e Conversões ao Longo do Tempo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dadosGraficoTempo}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="data" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="visualizacoes" fill="hsl(var(--primary))" name="Visualizações" />
                        <Bar dataKey="conversoes" fill="hsl(var(--secondary))" name="Conversões" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="conversao" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Taxa de Conversão Diária</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dadosGraficoTempo}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="data" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}%`, 'Taxa de Conversão']} />
                        <Line 
                          type="monotone" 
                          dataKey="taxa" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          name="Taxa (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="distribuicao" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição de Conversões</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={dadosGraficoPizza}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {dadosGraficoPizza.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Insights */}
            {metricas && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Insights e Recomendações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {metricas.taxaConversaoMedia > 15 && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Excelente taxa de conversão! Este layout está performando muito bem.</span>
                    </div>
                  )}
                  {metricas.taxaConversaoMedia < 5 && (
                    <div className="flex items-center gap-2 text-amber-600">
                      <TrendingDown className="h-4 w-4" />
                      <span className="text-sm">Taxa de conversão baixa. Considere otimizar o layout ou testar variações.</span>
                    </div>
                  )}
                  {metricas.tendenciaVisualizacoes === 'up' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">Tendência positiva em visualizações!</span>
                    </div>
                  )}
                  {metricas.tendenciaConversoes === 'down' && (
                    <div className="flex items-center gap-2 text-red-600">
                      <TrendingDown className="h-4 w-4" />
                      <span className="text-sm">Queda nas conversões. Analise possíveis melhorias no layout.</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}