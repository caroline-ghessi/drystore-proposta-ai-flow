-- Expandir tabela layout_configuracoes com campos para edição completa
ALTER TABLE layout_configuracoes ADD COLUMN IF NOT EXISTS template_base TEXT DEFAULT 'padrao';
ALTER TABLE layout_configuracoes ADD COLUMN IF NOT EXISTS estilos_customizados JSONB DEFAULT '{}'::jsonb;
ALTER TABLE layout_configuracoes ADD COLUMN IF NOT EXISTS variaveis_utilizadas TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE layout_configuracoes ADD COLUMN IF NOT EXISTS preview_screenshot TEXT;
ALTER TABLE layout_configuracoes ADD COLUMN IF NOT EXISTS versao_editor INTEGER DEFAULT 1;

-- Criar tabela para histórico de versões
CREATE TABLE IF NOT EXISTS layout_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  layout_id UUID NOT NULL REFERENCES layout_configuracoes(id) ON DELETE CASCADE,
  versao INTEGER NOT NULL,
  configuracao JSONB NOT NULL DEFAULT '{}',
  estilos_customizados JSONB DEFAULT '{}',
  alterado_por UUID REFERENCES vendedores(id),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na nova tabela
ALTER TABLE layout_historico ENABLE ROW LEVEL SECURITY;

-- Política pública temporária para histórico
CREATE POLICY "Histórico de layout público temporário" ON layout_historico
FOR ALL USING (true);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_layout_historico_layout_id ON layout_historico(layout_id);
CREATE INDEX IF NOT EXISTS idx_layout_historico_versao ON layout_historico(layout_id, versao);

-- Inserir configurações padrão para cada tipo individualmente
INSERT INTO layout_configuracoes (tipo_proposta, nome, descricao, configuracao_padrao, configuracao)
VALUES 
  ('energia-solar', 'Layout Padrão Energia Solar', 'Configuração padrão para propostas de energia solar', true, 
   '{"header": {"titulo": "Proposta de Energia Solar", "subtitulo": "Solução personalizada para sua independência energética", "mostrar_logo": true, "cor_fundo": "primary"}, "credibilidade": {"mostrar_experiencia": true, "mostrar_garantia": true, "mostrar_certificacoes": true, "mostrar_suporte": true}, "cta": {"botao_primario": "Aceitar Proposta", "botao_whatsapp": "Falar no WhatsApp", "botao_alteracoes": "Solicitar Alterações", "mostrar_valor": true}, "footer": {"mostrar_contato": true, "mostrar_certificacoes": true, "mostrar_selos": true}}'::jsonb),
  ('telhas', 'Layout Padrão Telhas', 'Configuração padrão para propostas de telhas', true,
   '{"header": {"titulo": "Proposta de Telhas Shingle", "subtitulo": "Proteção e durabilidade para seu telhado", "mostrar_logo": true, "cor_fundo": "primary"}, "credibilidade": {"mostrar_experiencia": true, "mostrar_garantia": true, "mostrar_certificacoes": true, "mostrar_suporte": true}, "cta": {"botao_primario": "Aceitar Proposta", "botao_whatsapp": "Falar no WhatsApp", "botao_alteracoes": "Solicitar Alterações", "mostrar_valor": true}, "footer": {"mostrar_contato": true, "mostrar_certificacoes": true, "mostrar_selos": true}}'::jsonb),
  ('divisorias', 'Layout Padrão Divisórias', 'Configuração padrão para propostas de divisórias', true,
   '{"header": {"titulo": "Proposta de Divisórias", "subtitulo": "Soluções versáteis para seus ambientes", "mostrar_logo": true, "cor_fundo": "primary"}, "credibilidade": {"mostrar_experiencia": true, "mostrar_garantia": true, "mostrar_certificacoes": true, "mostrar_suporte": true}, "cta": {"botao_primario": "Aceitar Proposta", "botao_whatsapp": "Falar no WhatsApp", "botao_alteracoes": "Solicitar Alterações", "mostrar_valor": true}, "footer": {"mostrar_contato": true, "mostrar_certificacoes": true, "mostrar_selos": true}}'::jsonb)
ON CONFLICT (tipo_proposta) DO NOTHING;