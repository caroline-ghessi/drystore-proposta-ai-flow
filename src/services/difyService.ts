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

export interface ProcessamentoResult {
  dados_extraidos: DadosExtraidos;
  valor_total: number;
  status: string;
  timestamp: string;
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

  validarDadosExtraidos(dados: DadosExtraidos, tipoProposta: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (tipoProposta) {
      case 'energia-solar':
        if (!dados.consumo_mensal || dados.consumo_mensal <= 0) {
          errors.push('Consumo mensal é obrigatório e deve ser maior que zero');
        }
        if (!dados.valor_conta || dados.valor_conta <= 0) {
          errors.push('Valor da conta é obrigatório e deve ser maior que zero');
        }
        if (!dados.endereco_completo) {
          errors.push('Endereço completo é obrigatório');
        }
        break;

      case 'telhas':
        if (!dados.area_cobertura || dados.area_cobertura <= 0) {
          errors.push('Área de cobertura é obrigatória e deve ser maior que zero');
        }
        break;

      case 'divisorias':
        if (!dados.area_total || dados.area_total <= 0) {
          errors.push('Área total é obrigatória e deve ser maior que zero');
        }
        break;
    }

    if (!dados.itens_necessarios || dados.itens_necessarios.length === 0) {
      errors.push('Lista de itens necessários não pode estar vazia');
    }

    return { valid: errors.length === 0, errors };
  }

  formatarDadosParaExibicao(dados: DadosExtraidos, tipoProposta: string): Record<string, any> {
    const formatado: Record<string, any> = {};

    switch (tipoProposta) {
      case 'energia-solar':
        formatado['Consumo Mensal'] = `${dados.consumo_mensal} kWh`;
        formatado['Valor da Conta'] = `R$ ${dados.valor_conta?.toFixed(2)}`;
        formatado['Endereço'] = dados.endereco_completo;
        formatado['Tipo de Instalação'] = dados.tipo_instalacao;
        formatado['Área Disponível'] = `${dados.area_disponivel} m²`;
        formatado['Orientação'] = dados.orientacao;
        break;

      case 'telhas':
        formatado['Área de Cobertura'] = `${dados.area_cobertura} m²`;
        formatado['Tipo de Telhado'] = dados.tipo_telhado;
        formatado['Inclinação'] = dados.inclinacao;
        break;

      case 'divisorias':
        formatado['Área Total'] = `${dados.area_total} m²`;
        formatado['Altura Pé-Direito'] = `${dados.altura_pe_direito}m`;
        formatado['Tipo de Acabamento'] = dados.tipo_acabamento;
        break;
    }

    if (dados.itens_necessarios) {
      formatado['Itens Necessários'] = dados.itens_necessarios.map(item => 
        `${item.quantidade}x ${item.item}`
      ).join(', ');
    }

    return formatado;
  }
}

export const difyService = DifyService.getInstance();