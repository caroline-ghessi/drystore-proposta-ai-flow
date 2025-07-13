-- Criar tabelas para configurações de layout
CREATE TABLE public.layout_configuracoes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_proposta TEXT NOT NULL REFERENCES public.tipo_proposta_enum,
    nome TEXT NOT NULL,
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    configuracao JSONB NOT NULL DEFAULT '{}',
    configuracao_padrao BOOLEAN NOT NULL DEFAULT false,
    versao INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.vendedores(id)
);

-- Criar tabela para estatísticas de layout
CREATE TABLE public.layout_estatisticas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    layout_id UUID NOT NULL REFERENCES public.layout_configuracoes(id) ON DELETE CASCADE,
    data_evento DATE NOT NULL DEFAULT CURRENT_DATE,
    visualizacoes INTEGER NOT NULL DEFAULT 0,
    conversoes INTEGER NOT NULL DEFAULT 0,
    tempo_medio_visualizacao INTERVAL,
    taxa_conversao DECIMAL(5,4) GENERATED ALWAYS AS (
        CASE 
            WHEN visualizacoes > 0 THEN (conversoes::DECIMAL / visualizacoes::DECIMAL)
            ELSE 0
        END
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(layout_id, data_evento)
);

-- Criar tabela para elementos customizáveis
CREATE TABLE public.layout_elementos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    layout_id UUID NOT NULL REFERENCES public.layout_configuracoes(id) ON DELETE CASCADE,
    elemento_tipo TEXT NOT NULL, -- header, credibility, cta, footer, etc
    elemento_nome TEXT NOT NULL,
    configuracao JSONB NOT NULL DEFAULT '{}',
    ordem INTEGER NOT NULL DEFAULT 0,
    visivel BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_layout_configuracoes_tipo ON public.layout_configuracoes(tipo_proposta);
CREATE INDEX idx_layout_configuracoes_ativo ON public.layout_configuracoes(ativo);
CREATE INDEX idx_layout_estatisticas_layout_data ON public.layout_estatisticas(layout_id, data_evento);
CREATE INDEX idx_layout_elementos_layout ON public.layout_elementos(layout_id, ordem);

-- Ativar RLS
ALTER TABLE public.layout_configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.layout_estatisticas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.layout_elementos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (acesso público temporário para desenvolvimento)
CREATE POLICY "Configurações de layout públicas" ON public.layout_configuracoes FOR ALL USING (true);
CREATE POLICY "Estatísticas de layout públicas" ON public.layout_estatisticas FOR ALL USING (true);
CREATE POLICY "Elementos de layout públicos" ON public.layout_elementos FOR ALL USING (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_layout_configuracoes_updated_at
    BEFORE UPDATE ON public.layout_configuracoes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_layout_estatisticas_updated_at
    BEFORE UPDATE ON public.layout_estatisticas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_layout_elementos_updated_at
    BEFORE UPDATE ON public.layout_elementos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configurações padrão para cada tipo de proposta
INSERT INTO public.layout_configuracoes (tipo_proposta, nome, descricao, configuracao_padrao, configuracao) VALUES
('energia-solar', 'Layout Padrão - Energia Solar', 'Configuração padrão para propostas de energia solar', true, '{
  "header": {
    "titulo": "Proposta de Energia Solar",
    "subtitulo": "Solução completa para sua independência energética",
    "mostrar_logo": true,
    "cor_fundo": "primary"
  },
  "credibilidade": {
    "mostrar_experiencia": true,
    "mostrar_garantia": true,
    "mostrar_certificacoes": true,
    "mostrar_suporte": true
  },
  "cta": {
    "botao_primario": "Aceitar Proposta",
    "botao_whatsapp": "Falar no WhatsApp",
    "botao_alteracoes": "Solicitar Alterações",
    "mostrar_valor": true
  },
  "footer": {
    "mostrar_contato": true,
    "mostrar_certificacoes": true,
    "mostrar_selos": true
  }
}'),
('telhas', 'Layout Padrão - Telhas Shingle', 'Configuração padrão para propostas de telhas', true, '{
  "header": {
    "titulo": "Proposta de Telhas Shingle",
    "subtitulo": "Beleza e proteção para sua obra",
    "mostrar_logo": true,
    "cor_fundo": "secondary"
  },
  "credibilidade": {
    "mostrar_experiencia": true,
    "mostrar_garantia": true,
    "mostrar_certificacoes": true,
    "mostrar_suporte": true
  },
  "cta": {
    "botao_primario": "Aceitar Proposta",
    "botao_whatsapp": "Falar no WhatsApp",
    "botao_alteracoes": "Solicitar Alterações",
    "mostrar_valor": true
  },
  "footer": {
    "mostrar_contato": true,
    "mostrar_certificacoes": true,
    "mostrar_selos": true
  }
}'),
('divisorias', 'Layout Padrão - Divisórias', 'Configuração padrão para propostas de divisórias', true, '{
  "header": {
    "titulo": "Proposta de Divisórias Drywall",
    "subtitulo": "Ambientes funcionais e modernos",
    "mostrar_logo": true,
    "cor_fundo": "accent"
  },
  "credibilidade": {
    "mostrar_experiencia": true,
    "mostrar_garantia": true,
    "mostrar_certificacoes": true,
    "mostrar_suporte": true
  },
  "cta": {
    "botao_primario": "Aceitar Proposta",
    "botao_whatsapp": "Falar no WhatsApp",
    "botao_alteracoes": "Solicitar Alterações",
    "mostrar_valor": true
  },
  "footer": {
    "mostrar_contato": true,
    "mostrar_certificacoes": true,
    "mostrar_selos": true
  }
}'),
('impermeabilizacao', 'Layout Padrão - Impermeabilização', 'Configuração padrão para propostas de impermeabilização', true, '{
  "header": {
    "titulo": "Proposta de Impermeabilização",
    "subtitulo": "Proteção definitiva contra infiltrações",
    "mostrar_logo": true,
    "cor_fundo": "primary"
  },
  "credibilidade": {
    "mostrar_experiencia": true,
    "mostrar_garantia": true,
    "mostrar_certificacoes": true,
    "mostrar_suporte": true
  },
  "cta": {
    "botao_primario": "Aceitar Proposta",
    "botao_whatsapp": "Falar no WhatsApp",
    "botao_alteracoes": "Solicitar Alterações",
    "mostrar_valor": true
  },
  "footer": {
    "mostrar_contato": true,
    "mostrar_certificacoes": true,
    "mostrar_selos": true
  }
}');

-- Inserir elementos padrão para energia solar
INSERT INTO public.layout_elementos (layout_id, elemento_tipo, elemento_nome, configuracao, ordem) 
SELECT 
    lc.id,
    elementos.tipo,
    elementos.nome,
    elementos.config,
    elementos.ordem
FROM public.layout_configuracoes lc
CROSS JOIN (
    VALUES 
    ('header', 'Cabeçalho Principal', '{"background": "gradient-primary", "height": "auto"}', 1),
    ('hero', 'Seção Hero', '{"mostrar_beneficios": true, "estilo": "moderno"}', 2),
    ('credibilidade', 'Por que escolher a DryStore', '{"mostrar_todos": true}', 3),
    ('especificacoes', 'Especificações Técnicas', '{"detalhado": true}', 4),
    ('timeline', 'Cronograma de Instalação', '{"mostrar_etapas": true}', 5),
    ('financeiro', 'Informações Financeiras', '{"mostrar_payback": true, "mostrar_economia": true}', 6),
    ('cta', 'Chamadas para Ação', '{"posicao": "fixo-bottom"}', 7),
    ('footer', 'Rodapé', '{"completo": true}', 8)
) AS elementos(tipo, nome, config, ordem)
WHERE lc.tipo_proposta = 'energia-solar' AND lc.configuracao_padrao = true;