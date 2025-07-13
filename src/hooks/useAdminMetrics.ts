import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface AdminMetrics {
  faturamentoTotal: number;
  ticketMedio: number;
  maiorVenda: number;
  totalPropostas: number;
  propostasVisualizadas: number;
  propostasAceitas: number;
  taxaVisualizacao: number;
  taxaConversao: number;
  vendedoresAtivos: number;
  vendedoresTotais: number;
  vendedoresInativos: number;
  
  // Sistema de Metas
  metaMensal: number;
  faturamentoDoMes: number;
  propostasDoMes: number;
  progressoMeta: number;
  diasRestantes: number;
  valorNecessario: number;
  projecaoMes: number;
  
  // Pipeline de Oportunidades
  valorPipeline: number;
  propostasAbertas: number;
  maioresOportunidades: Array<{
    id: string;
    cliente: string;
    valor: number;
    tipo: string;
    diasEmAberto: number;
    prioridade: 'alta' | 'media' | 'baixa';
    vendedor: string;
    status: string;
    dataVencimento?: string;
  }>;
  
  performancePorCategoria: Array<{
    categoria: string;
    valor: number;
    quantidade: number;
  }>;
  evolucaoMensal: Array<{
    mes: string;
    propostas: number;
    valor: number;
    aceitas: number;
  }>;
  rankingVendedores: Array<{
    id: string;
    nome: string;
    email: string;
    propostas: number;
    valor: number;
    aceitas: number;
    ultimaAtividade?: string;
  }>;
  statusDistribution: Array<{
    status: string;
    quantidade: number;
    valor: number;
  }>;
}

export function useAdminMetrics() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar propostas com vendedores
      const { data: propostas, error: propostasError } = await supabase
        .from('propostas')
        .select(`
          *,
          vendedores (id, nome, email, updated_at)
        `);

      if (propostasError) throw propostasError;

      // Buscar vendedores
      const { data: vendedores, error: vendedoresError } = await supabase
        .from('vendedores')
        .select('*');

      if (vendedoresError) throw vendedoresError;

      if (!propostas || !vendedores) {
        throw new Error('Dados não encontrados');
      }

      // Calcular métricas básicas
      const faturamentoTotal = propostas.reduce((sum, p) => sum + (p.valor_total || 0), 0);
      const ticketMedio = propostas.length > 0 ? faturamentoTotal / propostas.length : 0;
      const maiorVenda = Math.max(...propostas.map(p => p.valor_total || 0));
      
      const propostasVisualizadas = propostas.filter(p => p.data_visualizacao).length;
      const propostasAceitas = propostas.filter(p => p.status === 'aceita').length;
      
      const taxaVisualizacao = propostas.length > 0 ? (propostasVisualizadas / propostas.length) * 100 : 0;
      const taxaConversao = propostas.length > 0 ? (propostasAceitas / propostas.length) * 100 : 0;

      const vendedoresAtivos = vendedores.filter(v => v.ativo).length;
      const vendedoresInativos = vendedores.length - vendedoresAtivos;

      // Performance por categoria
      const categoriaMap = new Map();
      propostas.forEach(p => {
        const cat = p.tipo_proposta;
        const existing = categoriaMap.get(cat) || { categoria: cat, valor: 0, quantidade: 0 };
        existing.valor += p.valor_total || 0;
        existing.quantidade += 1;
        categoriaMap.set(cat, existing);
      });
      const performancePorCategoria = Array.from(categoriaMap.values())
        .sort((a, b) => b.valor - a.valor);

      // Evolução mensal (últimos 6 meses)
      const evolucaoMensal = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const mesAno = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const mesNome = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        
        const propostasDoMes = propostas.filter(p => 
          p.created_at.startsWith(mesAno)
        );
        
        evolucaoMensal.push({
          mes: mesNome,
          propostas: propostasDoMes.length,
          valor: propostasDoMes.reduce((sum, p) => sum + (p.valor_total || 0), 0),
          aceitas: propostasDoMes.filter(p => p.status === 'aceita').length
        });
      }

      // Ranking vendedores
      const vendedorMap = new Map();
      vendedores.forEach(v => {
        vendedorMap.set(v.id, {
          id: v.id,
          nome: v.nome,
          email: v.email,
          propostas: 0,
          valor: 0,
          aceitas: 0,
          ultimaAtividade: v.updated_at
        });
      });

      propostas.forEach(p => {
        if (p.vendedor_id && vendedorMap.has(p.vendedor_id)) {
          const vendedor = vendedorMap.get(p.vendedor_id);
          vendedor.propostas += 1;
          vendedor.valor += p.valor_total || 0;
          if (p.status === 'aceita') vendedor.aceitas += 1;
        }
      });

      const rankingVendedores = Array.from(vendedorMap.values())
        .sort((a, b) => b.valor - a.valor);

      // Distribuição por status
      const statusMap = new Map();
      propostas.forEach(p => {
        const status = p.status;
        const existing = statusMap.get(status) || { status, quantidade: 0, valor: 0 };
        existing.quantidade += 1;
        existing.valor += p.valor_total || 0;
        statusMap.set(status, existing);
      });
      const statusDistribution = Array.from(statusMap.values());

      // SISTEMA DE METAS
      const agora = new Date();
      const mesAtual = agora.getMonth() + 1;
      const anoAtual = agora.getFullYear();
      const diaAtual = agora.getDate();
      const diasNoMes = new Date(anoAtual, mesAtual, 0).getDate();
      const diasRestantes = diasNoMes - diaAtual;
      
      // Meta mensal (configurável - por ora fixada em R$ 200.000)
      const metaMensal = 200000;
      
      // Propostas do mês atual
      const propostasDoMes = propostas.filter(p => {
        const data = new Date(p.created_at);
        return data.getMonth() + 1 === mesAtual && data.getFullYear() === anoAtual;
      });
      
      const faturamentoDoMes = propostasDoMes.reduce((sum, p) => sum + (p.valor_total || 0), 0);
      const progressoMeta = metaMensal > 0 ? (faturamentoDoMes / metaMensal) * 100 : 0;
      const valorNecessario = Math.max(0, metaMensal - faturamentoDoMes);
      
      // Projeção baseada no ritmo atual
      const diasPassados = diaAtual;
      const projecaoMes = diasPassados > 0 ? (faturamentoDoMes / diasPassados) * diasNoMes : 0;

      // PIPELINE DE OPORTUNIDADES
      const propostasAbertas = propostas.filter(p => 
        ['enviada', 'visualizada'].includes(p.status)
      );
      
      const valorPipeline = propostasAbertas.reduce((sum, p) => sum + (p.valor_total || 0), 0);
      
      // Calcular prioridade das oportunidades
      const maioresOportunidades = propostasAbertas
        .map(p => {
          const diasEmAberto = Math.floor((Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24));
          const valor = p.valor_total || 0;
          
          // Algoritmo de prioridade: valor alto + urgência temporal
          let prioridade: 'alta' | 'media' | 'baixa' = 'baixa';
          
          if (valor > 30000 && diasEmAberto > 7) prioridade = 'alta';
          else if (valor > 15000 || diasEmAberto > 14) prioridade = 'media';
          
          return {
            id: p.id,
            cliente: p.cliente_nome,
            valor,
            tipo: p.tipo_proposta,
            diasEmAberto,
            prioridade,
            vendedor: p.vendedores?.nome || 'Não atribuído',
            status: p.status,
            dataVencimento: p.data_vencimento
          };
        })
        .sort((a, b) => {
          // Ordenar por prioridade e depois por valor
          const prioridadeValues = { alta: 3, media: 2, baixa: 1 };
          const diff = prioridadeValues[b.prioridade] - prioridadeValues[a.prioridade];
          return diff !== 0 ? diff : b.valor - a.valor;
        })
        .slice(0, 10);

      setMetrics({
        faturamentoTotal,
        ticketMedio,
        maiorVenda,
        totalPropostas: propostas.length,
        propostasVisualizadas,
        propostasAceitas,
        taxaVisualizacao,
        taxaConversao,
        vendedoresAtivos,
        vendedoresTotais: vendedores.length,
        vendedoresInativos,
        
        // Sistema de Metas
        metaMensal,
        faturamentoDoMes,
        propostasDoMes: propostasDoMes.length,
        progressoMeta,
        diasRestantes,
        valorNecessario,
        projecaoMes,
        
        // Pipeline
        valorPipeline,
        propostasAbertas: propostasAbertas.length,
        maioresOportunidades,
        
        performancePorCategoria,
        evolucaoMensal,
        rankingVendedores,
        statusDistribution
      });

    } catch (err: any) {
      console.error('Erro ao buscar métricas admin:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    
    // Refresh automático a cada 30 segundos
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  };
}