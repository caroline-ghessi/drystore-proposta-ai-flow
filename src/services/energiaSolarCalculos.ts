import { supabase } from '@/integrations/supabase/client';

/**
 * Serviço para cálculos específicos de energia solar
 * Implementa lógica de negócio e validações para sistemas fotovoltaicos
 */

export interface ValidacaoEntrada {
  valido: boolean;
  erros: string[];
  avisos: string[];
}

export interface EstimativaRapida {
  potencia_estimada_kwp: number;
  custo_estimado: number;
  economia_anual_estimada: number;
  payback_estimado: number;
}

export class EnergiaSolarCalculos {
  /**
   * Validação de entrada para cálculos solares
   */
  static validarEntrada(dados: {
    consumo_mensal_kwh: number;
    cidade?: string;
    estado?: string;
    area_disponivel?: number;
  }): ValidacaoEntrada {
    const erros: string[] = [];
    const avisos: string[] = [];

    // Validações obrigatórias
    if (!dados.consumo_mensal_kwh || dados.consumo_mensal_kwh <= 0) {
      erros.push('Consumo mensal deve ser maior que zero');
    }

    if (dados.consumo_mensal_kwh < 100) {
      avisos.push('Consumo muito baixo. Verifique se está correto (mínimo típico: 100 kWh/mês)');
    }

    if (dados.consumo_mensal_kwh > 10000) {
      avisos.push('Consumo muito alto para instalação residencial/comercial típica');
    }

    // Validações de localização
    if (!dados.cidade || !dados.estado) {
      avisos.push('Localização não informada. Será usado valor médio de irradiação do Brasil');
    }

    // Validações de área
    if (dados.area_disponivel && dados.area_disponivel < 10) {
      avisos.push('Área disponível muito pequena. Pode não ser suficiente para instalação');
    }

    return {
      valido: erros.length === 0,
      erros,
      avisos
    };
  }

  /**
   * Estimativa rápida sem consulta ao banco
   */
  static calcularEstimativaRapida(consumo_mensal_kwh: number, estado?: string): EstimativaRapida {
    // Irradiação média por região (kWh/m²/dia)
    const irradiacaoMedia = this.getIrradiacaoMediaPorEstado(estado);
    
    // Fator de perdas típico (inversor + cabeamento + sombreamento)
    const fatorPerdas = 0.85;
    
    // Fator de segurança
    const fatorSeguranca = 1.1;

    // Cálculo de potência necessária
    const potenciaEstimada = (consumo_mensal_kwh * 12) / (irradiacaoMedia * 365 * fatorPerdas) * fatorSeguranca;

    // Estimativas de custo (R$/kWp instalado)
    const custoMedioKwp = 4500; // R$ 4.500 por kWp instalado em 2025
    const custoEstimado = potenciaEstimada * custoMedioKwp;

    // Economia anual (95% do consumo com tarifa média)
    const tarifaMedia = 0.75; // R$ 0,75/kWh
    const economiaAnual = consumo_mensal_kwh * 12 * 0.95 * tarifaMedia;

    // Payback simples
    const paybackEstimado = custoEstimado / economiaAnual;

    return {
      potencia_estimada_kwp: Math.round(potenciaEstimada * 100) / 100,
      custo_estimado: Math.round(custoEstimado),
      economia_anual_estimada: Math.round(economiaAnual),
      payback_estimado: Math.round(paybackEstimado * 10) / 10
    };
  }

  /**
   * Buscar equipamentos compatíveis
   */
  static async buscarEquipamentosCompativeis(
    tipo: 'painel-solar' | 'inversor',
    filtros?: {
      potencia_min?: number;
      potencia_max?: number;
      fabricante?: string;
      preco_max?: number;
    }
  ) {
    let query = supabase
      .from('produtos')
      .select('*')
      .eq('categoria', tipo)
      .eq('ativo', true);

    if (filtros?.potencia_min) {
      query = query.gte('potencia_wp', filtros.potencia_min);
    }

    if (filtros?.potencia_max) {
      query = query.lte('potencia_wp', filtros.potencia_max);
    }

    if (filtros?.fabricante) {
      query = query.ilike('fabricante', `%${filtros.fabricante}%`);
    }

    if (filtros?.preco_max) {
      query = query.lte('preco_unitario', filtros.preco_max);
    }

    query = query.order('potencia_wp', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar equipamentos: ${error.message}`);
    }

    return data;
  }

  /**
   * Calcular compatibilidade inversor-painel
   */
  static calcularCompatibilidadeInversor(
    potenciaPaineis: number,
    potenciaInversor: number
  ): {
    compativel: boolean;
    percentualUtilizacao: number;
    recomendacao: string;
  } {
    const percentual = (potenciaPaineis / potenciaInversor) * 100;
    
    let compativel = false;
    let recomendacao = '';

    if (percentual < 80) {
      recomendacao = 'Inversor superdimensionado. Considere um inversor menor para melhor eficiência.';
    } else if (percentual >= 80 && percentual <= 120) {
      compativel = true;
      recomendacao = 'Compatibilidade ideal entre painéis e inversor.';
    } else if (percentual > 120 && percentual <= 130) {
      compativel = true;
      recomendacao = 'Oversizing aceitável. O inversor limitará a potência em picos de geração.';
    } else {
      recomendacao = 'Painéis muito superiores ao inversor. Perda significativa de energia.';
    }

    return {
      compativel,
      percentualUtilizacao: Math.round(percentual),
      recomendacao
    };
  }

  /**
   * Simular diferentes cenários
   */
  static async simularCenarios(
    consumoBase: number,
    cidade: string,
    estado: string
  ) {
    const cenarios = [
      { nome: 'Econômico', offset: 0.9 }, // 90% do consumo
      { nome: 'Ideal', offset: 1.0 },     // 100% do consumo
      { nome: 'Premium', offset: 1.2 }    // 120% do consumo
    ];

    const resultados = [];

    for (const cenario of cenarios) {
      const consumoAjustado = consumoBase * cenario.offset;
      
      try {
        const { data } = await supabase.rpc('dimensionar_sistema', {
          p_consumo_kwh: consumoAjustado,
          p_cidade: cidade,
          p_estado: estado,
          p_tipo_instalacao: 'residencial'
        });

        resultados.push({
          nome: cenario.nome,
          consumo_kwh: consumoAjustado,
          resultado: data
        });
      } catch (error) {
        console.error(`Erro no cenário ${cenario.nome}:`, error);
      }
    }

    return resultados;
  }

  /**
   * Obter irradiação média por estado
   */
  private static getIrradiacaoMediaPorEstado(estado?: string): number {
    const irradiacaoPorEstado: Record<string, number> = {
      'AC': 4.8, 'AL': 5.6, 'AP': 4.9, 'AM': 4.4, 'BA': 5.7,
      'CE': 6.1, 'DF': 5.2, 'ES': 5.1, 'GO': 5.3, 'MA': 5.5,
      'MT': 5.5, 'MS': 5.4, 'MG': 5.4, 'PA': 4.8, 'PB': 5.9,
      'PR': 4.8, 'PE': 5.9, 'PI': 5.8, 'RJ': 5.2, 'RN': 6.0,
      'RS': 4.7, 'RO': 4.6, 'RR': 4.8, 'SC': 4.8, 'SP': 4.6,
      'SE': 5.8, 'TO': 5.4
    };

    return irradiacaoPorEstado[estado?.toUpperCase() || ''] || 4.5; // Média Brasil
  }

  /**
   * Calcular dimensões estimadas do sistema
   */
  static calcularDimensoesSistema(quantidadePaineis: number) {
    // Dimensões típicas de painel: 2,1m x 1,1m
    const areaPorPainel = 2.31; // m²
    const areaTotal = quantidadePaineis * areaPorPainel;
    
    // Arranjos possíveis (considerando espaçamento)
    const fatorEspacamento = 1.3; // 30% a mais para espaçamento
    const areaComEspacamento = areaTotal * fatorEspacamento;

    return {
      area_paineis_m2: Math.round(areaTotal * 100) / 100,
      area_total_necessaria_m2: Math.round(areaComEspacamento * 100) / 100,
      peso_estimado_kg: quantidadePaineis * 25, // 25kg por painel típico
      dimensao_sugerida: this.sugerirArranjo(quantidadePaineis)
    };
  }

  /**
   * Sugerir arranjo de painéis
   */
  private static sugerirArranjo(quantidade: number): string {
    // Buscar arranjos que resultem em retângulos próximos ao quadrado
    const arranjos = [];
    
    for (let i = 1; i <= quantidade; i++) {
      if (quantidade % i === 0) {
        const j = quantidade / i;
        const ratio = Math.max(i, j) / Math.min(i, j);
        arranjos.push({ fileiras: i, paineisPorFileira: j, ratio });
      }
    }

    // Escolher o arranjo com melhor proporção (mais próximo ao quadrado)
    arranjos.sort((a, b) => a.ratio - b.ratio);
    const melhorArranjo = arranjos[0];

    return `${melhorArranjo.fileiras} fileira(s) × ${melhorArranjo.paineisPorFileira} painéis`;
  }

  /**
   * Calcular economia detalhada por período
   */
  static calcularEconomiaDetalhada(
    geracao_anual_kwh: number,
    tarifa_kwh: number = 0.75,
    inflacao_energia: number = 0.05 // 5% ao ano
  ) {
    const periodos = [1, 5, 10, 15, 20, 25];
    const resultados = [];

    let economiaAcumulada = 0;
    
    for (const anos of periodos) {
      // Degradação dos painéis (0.5% ao ano)
      const degradacao = Math.pow(0.995, anos);
      const geracaoAjustada = geracao_anual_kwh * degradacao;
      
      // Tarifa com inflação
      const tarifaFutura = tarifa_kwh * Math.pow(1 + inflacao_energia, anos);
      
      // Economia no ano específico
      const economiaAno = geracaoAjustada * tarifaFutura;
      
      // Economia acumulada (aproximada)
      if (anos === 1) {
        economiaAcumulada = economiaAno;
      } else {
        const anosAnteriores = periodos[periodos.indexOf(anos) - 1];
        const economiaAnterior = resultados[resultados.length - 1]?.economia_acumulada || 0;
        const economiaIncremental = (economiaAno + economiaAnterior) * (anos - anosAnteriores) / 2;
        economiaAcumulada = economiaAnterior + economiaIncremental;
      }

      resultados.push({
        anos,
        geracao_kwh: Math.round(geracaoAjustada),
        tarifa_kwh: Math.round(tarifaFutura * 100) / 100,
        economia_anual: Math.round(economiaAno),
        economia_acumulada: Math.round(economiaAcumulada),
        degradacao_percentual: Math.round((1 - degradacao) * 100)
      });
    }

    return resultados;
  }
}