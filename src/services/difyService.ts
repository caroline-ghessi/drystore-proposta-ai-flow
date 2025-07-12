import { supabase } from "@/integrations/supabase/client";

// Interface unificada baseada nos dados reais do Dify
export interface DadosExtraidos {
  // Dados do cliente (extraídos do PDF)
  nome_cliente?: string;
  telefone_do_cliente?: string;
  
  // Produtos (estrutura comum para todos os tipos)
  produtos?: Array<{
    codigo?: string;
    descricao: string;
    quantidade: number;
    unidade?: string;
    preco_unitario?: number;
    total?: number;
  }>;
  
  // Valores
  valor_frete?: number;
  valor_total_proposta?: number;
  numero_proposta?: string | number;
  
  // Metadados
  tipo_dados?: string;
  fonte_dados?: string;
  observacoes?: string;
}

export interface DadosMateriaisConstrucao {
  numero_proposta: string | number;
  nome_cliente: string;
  telefone_do_cliente: string;
  produtos: Array<{
    codigo: string;
    descricao: string;
    quantidade: number;
    unidade: string;
    preco_unitario: number;
    total: number;
  }>;
  valor_frete?: number;
  valor_total_proposta: number;
  observacoes?: string;
}

export interface HistoricoConsumo {
  dados_ano_atual: {
    ano: number;
    meses: {
      janeiro: number | null;
      fevereiro: number | null;
      março: number | null;
      abril: number | null;
      maio: number | null;
      junho: number | null;
      julho: number | null;
      agosto: number | null;
      setembro: number | null;
      outubro: number | null;
      novembro: number | null;
      dezembro: number | null;
    };
  };
  dados_ano_anterior: {
    ano: number;
    meses: {
      janeiro: number | null;
      fevereiro: number | null;
      março: number | null;
      abril: number | null;
      maio: number | null;
      junho: number | null;
      julho: number | null;
      agosto: number | null;
      setembro: number | null;
      outubro: number | null;
      novembro: number | null;
      dezembro: number | null;
    };
  };
  observacao: string;
}

export interface DadosContaLuz {
  nome_cliente: string;
  endereco: string;
  numero_instalacao: string;
  data_emissao: string;
  mes_referencia: string;
  preco_kw: number | null;
  concessionaria: string;
  consumo_atual: number | null;
  valor_total: number | null;
  historico_consumo: HistoricoConsumo;
  tipo_sistema?: 'on-grid' | 'hibrido' | 'off-grid' | 'baterias_apenas';
  inclui_baterias?: boolean;
}

export interface DadosEnergiaSolarCompletos {
  dadosContaLuz: DadosContaLuz;
  consumoMedio: number;
  cidade: string;
  estado: string;
  tipoInstalacao: 'residencial' | 'comercial' | 'industrial';
  tarifaKwh: number;
}

export interface ProcessamentoResult {
  dados_extraidos?: DadosExtraidos | DadosMateriaisConstrucao | DadosEnergiaSolarCompletos;
  valor_total?: number;
  status?: string;
  timestamp?: string;
  tipo_dados?: 'energia-solar' | 'materiais-construcao' | 'telhas-shingle' | 'divisorias';
  sucesso?: boolean;
  dados?: any;
  tipo?: string;
  erro?: string;
}

export class DifyService {
  private static instance: DifyService;

  public static getInstance(): DifyService {
    if (!DifyService.instance) {
      DifyService.instance = new DifyService();
    }
    return DifyService.instance;
  }

  async processarDocumento(
    arquivoUrl: string,
    tipoProposta: string,
    clienteNome: string,
    clienteEmail: string
  ): Promise<ProcessamentoResult> {
    try {
      console.log('Iniciando processamento Dify:', { arquivoUrl, tipoProposta, clienteNome });

      // Chamar Edge Function de processamento
      const { data, error } = await supabase.functions.invoke('processar-documento', {
        body: {
          arquivo_url: arquivoUrl,
          tipo_proposta: tipoProposta,
          cliente_nome: clienteNome,
          cliente_email: clienteEmail
        }
      });

      if (error) {
        throw new Error(`Erro no processamento: ${error.message}`);
      }

      console.log('Processamento concluído:', data);
      return data as ProcessamentoResult;

    } catch (error) {
      console.error('Erro no serviço Dify:', error);
      throw error;
    }
  }

  async reprocessarDocumento(
    arquivoUrl: string,
    tipoProposta: string,
    parametrosExtras?: any
  ): Promise<ProcessamentoResult> {
    try {
      console.log('Reprocessando documento:', { arquivoUrl, tipoProposta, parametrosExtras });

      // Implementar lógica de reprocessamento com parâmetros específicos
      const resultado = await this.processarDocumento(
        arquivoUrl,
        tipoProposta,
        parametrosExtras?.cliente_nome || 'Cliente',
        parametrosExtras?.cliente_email || 'email@exemplo.com'
      );

      return resultado;

    } catch (error) {
      console.error('Erro no reprocessamento:', error);
      throw error;
    }
  }

  validarDadosExtraidos(dados: any, tipoProposta: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    console.log('Validando dados extraídos:', dados, 'Tipo:', tipoProposta);

    // Para energia solar, validação mais flexível
    if (tipoProposta === 'energia-solar') {
      // Verificar se os dados têm a estrutura correta
      if (!dados) {
        errors.push('Dados não encontrados');
        return { valid: false, errors };
      }

      // Aceitar tanto DadosContaLuz diretamente quanto DadosEnergiaSolarCompletos
      const contaLuz = dados.dadosContaLuz || dados;
      
      console.log('Validando conta luz:', contaLuz);
      
      // Verificar nome do cliente - aceitar tanto do contaLuz quanto dados globais
      const nomeCliente = contaLuz?.nome_cliente || dados?.nome_cliente;
      
      if (!nomeCliente || nomeCliente.trim() === '') {
        errors.push('Nome do cliente é obrigatório e deve ser extraído da conta de luz');
      }
      
      // Apenas retornar erro se os dados forem completamente inválidos
      return { valid: true, errors };
    }

    // Para materiais de construção, usar interface específica
    if (tipoProposta === 'materiais-construcao') {
      const dadosMateriais = dados as DadosMateriaisConstrucao;
      if (!dadosMateriais.nome_cliente) {
        errors.push('Nome do cliente é obrigatório');
      }
      if (!dadosMateriais.produtos || dadosMateriais.produtos.length === 0) {
        errors.push('Lista de produtos não pode estar vazia');
      }
      return { valid: errors.length === 0, errors };
    }

    // Para outros tipos, usar interface unificada baseada nos dados reais do Dify
    const dadosUnificados = dados as DadosExtraidos;
    
    // Validação mínima: cliente e produtos
    if (!dadosUnificados.nome_cliente) {
      errors.push('Nome do cliente é obrigatório');
    }
    
    if (!dadosUnificados.produtos || dadosUnificados.produtos.length === 0) {
      errors.push('Lista de produtos não pode estar vazia');
    }

    return { valid: errors.length === 0, errors };
  }

  formatarDadosParaExibicao(dados: DadosExtraidos | DadosMateriaisConstrucao | DadosEnergiaSolarCompletos, tipoProposta: string): Record<string, any> {
    const formatado: Record<string, any> = {};

    // Para energia solar, usar interface específica
    if (tipoProposta === 'energia-solar') {
      // Verificar se os dados são DadosContaLuz diretamente ou DadosEnergiaSolarCompletos
      const contaLuz = (dados as any).dadosContaLuz || dados as any;
      
      if (!contaLuz || typeof contaLuz !== 'object') {
        console.error('Dados inválidos para energia solar:', dados);
        return {};
      }
      
      formatado['Cliente'] = contaLuz.nome_cliente || 'Não informado';
      formatado['Endereço'] = contaLuz.endereco || 'Não informado';
      formatado['Concessionária'] = contaLuz.concessionaria || 'Não informado';
      formatado['Unidade Consumidora'] = contaLuz.numero_instalacao || 'Não informado';
      formatado['Consumo Atual'] = `${contaLuz.consumo_atual || 0} kWh`;
      formatado['Tarifa kWh'] = `R$ ${contaLuz.preco_kw?.toFixed(4) || '0,0000'}`;
      formatado['Valor Conta'] = `R$ ${contaLuz.valor_total?.toFixed(2) || '0,00'}`;
      formatado['Mês Referência'] = contaLuz.mes_referencia || 'Não informado';
      return formatado;
    }

    // Para materiais de construção, usar interface específica
    if (tipoProposta === 'materiais-construcao') {
      const dadosMateriais = dados as DadosMateriaisConstrucao;
      formatado['Número da Proposta'] = dadosMateriais.numero_proposta;
      formatado['Cliente'] = dadosMateriais.nome_cliente;
      formatado['Telefone'] = dadosMateriais.telefone_do_cliente;
      formatado['Valor do Frete'] = `R$ ${dadosMateriais.valor_frete?.toFixed(2) || '0,00'}`;
      formatado['Valor Total'] = `R$ ${dadosMateriais.valor_total_proposta?.toFixed(2) || '0,00'}`;
      return formatado;
    }

    // Para outros tipos, usar interface unificada baseada nos dados reais do Dify
    const dadosUnificados = dados as DadosExtraidos;
    
    formatado['Cliente'] = dadosUnificados.nome_cliente || 'Não encontrado';
    formatado['Telefone'] = dadosUnificados.telefone_do_cliente || 'Não encontrado';
    
    if (dadosUnificados.numero_proposta) {
      formatado['Número da Proposta'] = dadosUnificados.numero_proposta;
    }
    
    if (dadosUnificados.valor_frete !== undefined) {
      formatado['Valor do Frete'] = `R$ ${dadosUnificados.valor_frete?.toFixed(2) || '0,00'}`;
    }
    
    if (dadosUnificados.valor_total_proposta) {
      formatado['Valor Total'] = `R$ ${dadosUnificados.valor_total_proposta?.toFixed(2) || '0,00'}`;
    }
    
    if (dadosUnificados.observacoes) {
      formatado['Observações'] = dadosUnificados.observacoes;
    }

    return formatado;
  }

  async processarMateriais(
    arquivoUrl: string,
    clienteNome: string,
    clienteEmail: string
  ): Promise<ProcessamentoResult> {
    return this.processarDocumento(arquivoUrl, 'materiais-construcao', clienteNome, clienteEmail);
  }

  async processarTelhas(
    arquivoUrl: string,
    clienteNome: string,
    clienteEmail: string
  ): Promise<ProcessamentoResult> {
    try {
      console.log('Processando telhas shingle:', { arquivoUrl, clienteNome });

      const { data, error } = await supabase.functions.invoke('processar-telhas', {
        body: {
          arquivo_url: arquivoUrl,
          cliente_nome: clienteNome,
          cliente_email: clienteEmail
        }
      });

      if (error) {
        throw new Error(`Erro no processamento de telhas: ${error.message}`);
      }

      return {
        sucesso: true,
        dados: data,
        tipo: 'telhas-shingle'
      };
    } catch (error) {
      console.error('Erro no serviço de telhas:', error);
      return {
        sucesso: false,
        erro: error.message || 'Erro desconhecido no processamento de telhas'
      };
    }
  }

  async processarDivisorias(
    arquivoUrl: string,
    clienteNome: string,
    clienteEmail: string
  ): Promise<ProcessamentoResult> {
    try {
      console.log('Processando divisórias:', { arquivoUrl, clienteNome });

      const { data, error } = await supabase.functions.invoke('processar-divisorias', {
        body: {
          arquivo_url: arquivoUrl,
          cliente_nome: clienteNome,
          cliente_email: clienteEmail
        }
      });

      if (error) {
        throw new Error(`Erro no processamento de divisórias: ${error.message}`);
      }

      return {
        sucesso: true,
        dados: data,
        tipo: 'divisorias'
      };
    } catch (error) {
      console.error('Erro no serviço de divisórias:', error);
      return {
        sucesso: false,
        erro: error.message || 'Erro desconhecido no processamento de divisórias'
      };
    }
  }

  async processarContaLuz(
    imagemUrl: string,
    clienteNome: string,
    clienteEmail: string,
    tipoSistema?: string,
    incluiBaterias?: boolean
  ): Promise<{ sucesso: boolean; dados?: DadosContaLuz; erro?: string }> {
    try {
      console.log('Processando conta de luz:', { imagemUrl, clienteNome, clienteEmail });

      // Chamar Edge Function específica para conta de luz
      const { data, error } = await supabase.functions.invoke('processar-conta-luz', {
        body: {
          imagemUrl,
          clienteNome,
          clienteEmail,
          tipo_sistema: tipoSistema || 'on-grid',
          inclui_baterias: incluiBaterias || false
        }
      });

      if (error) {
        throw new Error(`Erro no processamento da conta de luz: ${error.message}`);
      }

      if (!data.sucesso || !data.dados) {
        throw new Error(data.erro || 'Dados da conta de luz não foram extraídos');
      }

      const dadosContaLuz = data.dados as DadosContaLuz;
      
      console.log('Dados da conta de luz recebidos da edge function:', dadosContaLuz);
      
      return {
        sucesso: true,
        dados: dadosContaLuz
      };

    } catch (error) {
      console.error('Erro no serviço de conta de luz:', error);
      return {
        sucesso: false,
        erro: error.message || 'Erro desconhecido no processamento da conta de luz'
      };
    }
  }

  private calcularConsumoMedio(historico: HistoricoConsumo): number {
    const consumos: number[] = [];
    
    // Adicionar consumos do ano atual
    Object.values(historico.dados_ano_atual.meses).forEach(consumo => {
      if (consumo && consumo > 0) {
        consumos.push(consumo);
      }
    });
    
    // Adicionar consumos do ano anterior
    Object.values(historico.dados_ano_anterior.meses).forEach(consumo => {
      if (consumo && consumo > 0) {
        consumos.push(consumo);
      }
    });
    
    if (consumos.length === 0) {
      return 0;
    }
    
    const soma = consumos.reduce((acc, curr) => acc + curr, 0);
    return Math.round(soma / consumos.length);
  }

  private extrairCidadeEstado(endereco: string): { cidade: string; estado: string } {
    // Extrair cidade e estado do endereço usando padrões comuns
    const enderecoLimpo = endereco.replace(/[^\w\s,-]/g, '').trim();
    const partes = enderecoLimpo.split(',').map(p => p.trim());
    
    // Padrão: últimas partes geralmente são cidade, estado
    if (partes.length >= 2) {
      const estado = partes[partes.length - 1];
      const cidade = partes[partes.length - 2];
      return { cidade, estado };
    }
    
    // Fallback: tentar extrair palavras que podem ser cidade/estado
    const palavras = enderecoLimpo.split(/\s+/);
    return {
      cidade: palavras[palavras.length - 2] || 'São Paulo',
      estado: palavras[palavras.length - 1] || 'SP'
    };
  }

  private determinarTipoInstalacao(consumoMedio: number): 'residencial' | 'comercial' | 'industrial' {
    if (consumoMedio <= 500) {
      return 'residencial';
    } else if (consumoMedio <= 2000) {
      return 'comercial';
    } else {
      return 'industrial';
    }
  }
}

export const difyService = DifyService.getInstance();