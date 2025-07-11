import { supabase } from "@/integrations/supabase/client";

export interface DadosExtraidos {
  consumo_mensal?: number;
  valor_conta?: number;
  endereco_completo?: string;
  tipo_instalacao?: string;
  area_disponivel?: number;
  area_cobertura?: number;
  area_total?: number;
  orientacao?: string;
  tipo_telhado?: string;
  inclinacao?: string;
  altura_pe_direito?: number;
  tipo_acabamento?: string;
  itens_necessarios?: Array<{
    item: string;
    quantidade: number;
  }>;
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
  valor_frete: number;
  valor_total_proposta: number;
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

    if (tipoProposta === 'materiais-construcao') {
      const dadosMateriais = dados as DadosMateriaisConstrucao;
      if (!dadosMateriais.nome_do_cliente) {
        errors.push('Nome do cliente é obrigatório');
      }
      if (!dadosMateriais.telefone_do_cliente) {
        errors.push('Telefone do cliente é obrigatório');
      }
      if (!dadosMateriais.produtos || dadosMateriais.produtos.length === 0) {
        errors.push('Lista de produtos não pode estar vazia');
      }
      if (dadosMateriais.valor_total_proposta <= 0) {
        errors.push('Valor total da proposta deve ser maior que zero');
      }
      return { valid: errors.length === 0, errors };
    }

    const dadosLegacy = dados as DadosExtraidos;
    
    switch (tipoProposta) {
      case 'energia-solar':
        if (!dadosLegacy.consumo_mensal || dadosLegacy.consumo_mensal <= 0) {
          errors.push('Consumo mensal é obrigatório e deve ser maior que zero');
        }
        if (!dadosLegacy.valor_conta || dadosLegacy.valor_conta <= 0) {
          errors.push('Valor da conta é obrigatório e deve ser maior que zero');
        }
        if (!dadosLegacy.endereco_completo) {
          errors.push('Endereço completo é obrigatório');
        }
        break;

      case 'telhas':
        if (!dadosLegacy.area_cobertura || dadosLegacy.area_cobertura <= 0) {
          errors.push('Área de cobertura é obrigatória e deve ser maior que zero');
        }
        break;

      case 'divisorias':
        if (!dadosLegacy.area_total || dadosLegacy.area_total <= 0) {
          errors.push('Área total é obrigatória e deve ser maior que zero');
        }
        break;
    }

    if (!dadosLegacy.itens_necessarios || dadosLegacy.itens_necessarios.length === 0) {
      errors.push('Lista de itens necessários não pode estar vazia');
    }

    return { valid: errors.length === 0, errors };
  }

  formatarDadosParaExibicao(dados: DadosExtraidos | DadosMateriaisConstrucao, tipoProposta: string): Record<string, any> {
    const formatado: Record<string, any> = {};

    if (tipoProposta === 'materiais-construcao') {
      const dadosMateriais = dados as DadosMateriaisConstrucao;
      formatado['Número da Proposta'] = dadosMateriais.numero_proposta;
      formatado['Cliente'] = dadosMateriais.nome_do_cliente;
      formatado['Telefone'] = dadosMateriais.telefone_do_cliente;
      formatado['Valor do Frete'] = `R$ ${dadosMateriais.valor_frete?.toFixed(2) || '0,00'}`;
      formatado['Valor Total'] = `R$ ${dadosMateriais.valor_total_proposta?.toFixed(2) || '0,00'}`;
      formatado['Produtos'] = dadosMateriais.produtos || [];
      return formatado;
    }

    const dadosLegacy = dados as DadosExtraidos;
    
    switch (tipoProposta) {
      case 'energia-solar':
        formatado['Consumo Mensal'] = `${dadosLegacy.consumo_mensal} kWh`;
        formatado['Valor da Conta'] = `R$ ${dadosLegacy.valor_conta?.toFixed(2)}`;
        formatado['Endereço'] = dadosLegacy.endereco_completo;
        formatado['Tipo de Instalação'] = dadosLegacy.tipo_instalacao;
        formatado['Área Disponível'] = `${dadosLegacy.area_disponivel} m²`;
        formatado['Orientação'] = dadosLegacy.orientacao;
        break;

      case 'telhas':
        formatado['Área de Cobertura'] = `${dadosLegacy.area_cobertura} m²`;
        formatado['Tipo de Telhado'] = dadosLegacy.tipo_telhado;
        formatado['Inclinação'] = dadosLegacy.inclinacao;
        break;

      case 'divisorias':
        formatado['Área Total'] = `${dadosLegacy.area_total} m²`;
        formatado['Altura Pé-Direito'] = `${dadosLegacy.altura_pe_direito}m`;
        formatado['Tipo de Acabamento'] = dadosLegacy.tipo_acabamento;
        break;
    }

    if (dadosLegacy.itens_necessarios) {
      formatado['Itens Necessários'] = dadosLegacy.itens_necessarios.map(item => 
        `${item.quantidade}x ${item.item}`
      ).join(', ');
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
}

export const difyService = DifyService.getInstance();