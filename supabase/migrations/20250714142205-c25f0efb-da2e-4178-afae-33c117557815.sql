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