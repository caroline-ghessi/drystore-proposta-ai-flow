import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GlobalConfig {
  [categoria: string]: {
    [chave: string]: any;
  };
}

export const useGlobalConfig = () => {
  const [config, setConfig] = useState<GlobalConfig>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_globais')
        .select('categoria, chave, valor')
        .eq('ativo', true);

      if (error) throw error;

      const configMap: GlobalConfig = {};
      data?.forEach(item => {
        if (!configMap[item.categoria]) {
          configMap[item.categoria] = {};
        }
        configMap[item.categoria][item.chave] = item.valor;
      });

      setConfig(configMap);
    } catch (error) {
      console.error('Erro ao carregar configurações globais:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfig = (categoria: string, chave: string, valorPadrao: any = null) => {
    return config[categoria]?.[chave] || valorPadrao;
  };

  const getFooterConfig = () => {
    return getConfig('textos_padrao', 'rodape', {
      empresa: 'DryStore',
      descricao: 'Sua escolha segura em materiais de construção e energia renovável.',
      endereco: 'Rua Principal, 123',
      telefone: '(11) 3456-7890',
      whatsapp: '(11) 99999-9999',
      email: 'contato@drystore.com.br',
      certificacoes: ['ABNT NBR 14715', 'ISO 9001', 'PBQP-H'],
      selos_qualidade: ['ANCC', 'INMETRO'],
      copyright: '© 2025 DryStore. Todos os direitos reservados.',
      redes_sociais: {
        facebook: '',
        instagram: '',
        linkedin: '',
        youtube: ''
      }
    });
  };

  const getCTAs = () => {
    return getConfig('textos_padrao', 'ctas_principais', {
      aceitar: 'Aceitar Proposta',
      contato: 'Falar no WhatsApp',
      alteracao: 'Solicitar Alteração'
    });
  };

  return {
    config,
    loading,
    getConfig,
    getFooterConfig,
    getCTAs,
    recarregar: carregarConfiguracoes
  };
};