import { supabase } from "@/integrations/supabase/client";

// Interface unificada baseada nos dados reais do Dify
export interface DadosExtraidos {
  // Dados do cliente (extraídos do PDF)
  nome_do_cliente?: string;
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
  nome_do_cliente: string;
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

export interface DadosContaLuz {
  cliente_nome: string;
  cliente_cpf_cnpj?: string;
  endereco_instalacao: string;
  consumo_kwh_mes: number;
  valor_conta: number;
  classe_consumo: 'residencial' | 'comercial' | 'industrial';
  tarifa_kwh?: number;
  demanda_contratada?: number;
  distribuidora: string;
  mes_referencia: string;
  bandeira_tarifaria?: string;
}

export interface ProcessamentoResult {
  dados_extraidos: DadosExtraidos | DadosMateriaisConstrucao;
  valor_total: number;
  status: string;
  timestamp: string;
  tipo_dados?: 'energia-solar' | 'materiais-construcao';
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

  validarDadosExtraidos(dados: DadosExtraidos | DadosMateriaisConstrucao, tipoProposta: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Para materiais de construção, usar interface específica
    if (tipoProposta === 'materiais-construcao') {
      const dadosMateriais = dados as DadosMateriaisConstrucao;
      if (!dadosMateriais.nome_do_cliente) {
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
    if (!dadosUnificados.nome_do_cliente) {
      errors.push('Nome do cliente é obrigatório');
    }
    
    if (!dadosUnificados.produtos || dadosUnificados.produtos.length === 0) {
      errors.push('Lista de produtos não pode estar vazia');
    }

    return { valid: errors.length === 0, errors };
  }

  formatarDadosParaExibicao(dados: DadosExtraidos | DadosMateriaisConstrucao, tipoProposta: string): Record<string, any> {
    const formatado: Record<string, any> = {};

    // Para materiais de construção, usar interface específica
    if (tipoProposta === 'materiais-construcao') {
      const dadosMateriais = dados as DadosMateriaisConstrucao;
      formatado['Número da Proposta'] = dadosMateriais.numero_proposta;
      formatado['Cliente'] = dadosMateriais.nome_do_cliente;
      formatado['Telefone'] = dadosMateriais.telefone_do_cliente;
      formatado['Valor do Frete'] = `R$ ${dadosMateriais.valor_frete?.toFixed(2) || '0,00'}`;
      formatado['Valor Total'] = `R$ ${dadosMateriais.valor_total_proposta?.toFixed(2) || '0,00'}`;
      // Produtos não são incluídos aqui pois há tabela específica para isso
      return formatado;
    }

    // Para outros tipos, usar interface unificada baseada nos dados reais do Dify
    const dadosUnificados = dados as DadosExtraidos;
    
    formatado['Cliente'] = dadosUnificados.nome_do_cliente || 'Não encontrado';
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
    
    // Não incluir produtos nos dados formatados pois há tabela específica para isso
    // if (dadosUnificados.produtos && dadosUnificados.produtos.length > 0) {
    //   formatado['Produtos'] = dadosUnificados.produtos;
    // }
    
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

  async processarContaLuz(
    imagemUrl: string,
    clienteNome: string,
    clienteEmail: string
  ): Promise<{ sucesso: boolean; dados?: DadosContaLuz; erro?: string }> {
    try {
      console.log('Processando conta de luz:', { imagemUrl, clienteNome, clienteEmail });

      // Chamar Edge Function específica para conta de luz
      const { data, error } = await supabase.functions.invoke('processar-conta-luz', {
        body: {
          imagemUrl,
          clienteNome,
          clienteEmail
        }
      });

      if (error) {
        throw new Error(`Erro no processamento da conta de luz: ${error.message}`);
      }

      console.log('Processamento da conta de luz concluído:', data);
      return data;

    } catch (error) {
      console.error('Erro no serviço de conta de luz:', error);
      return {
        sucesso: false,
        erro: error.message || 'Erro desconhecido no processamento da conta de luz'
      };
    }
  }
}

export const difyService = DifyService.getInstance();