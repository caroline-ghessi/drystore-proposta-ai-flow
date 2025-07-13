-- Criar tabela de configurações globais
CREATE TABLE public.configuracoes_globais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria TEXT NOT NULL,
  chave TEXT NOT NULL,
  valor JSONB NOT NULL DEFAULT '{}',
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(categoria, chave)
);

-- Enable RLS
ALTER TABLE public.configuracoes_globais ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Configurações globais são públicas" 
ON public.configuracoes_globais 
FOR ALL 
USING (true);

-- Add trigger for timestamps
CREATE TRIGGER update_configuracoes_globais_updated_at
BEFORE UPDATE ON public.configuracoes_globais
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configurações padrão
INSERT INTO public.configuracoes_globais (categoria, chave, valor, descricao) VALUES
('identidade_visual', 'logo_principal', '{"url": "", "alt": "DryStore Logo"}', 'Logo principal da empresa'),
('identidade_visual', 'cores_marca', '{"primaria": "#0066CC", "secundaria": "#FF6B35", "acento": "#00CC66"}', 'Cores da marca'),
('identidade_visual', 'favicon', '{"url": "/favicon.ico"}', 'Favicon do site'),

('tipografia', 'fonte_principal', '{"familia": "Inter", "tamanhos": {"h1": "2.5rem", "h2": "2rem", "body": "1rem"}}', 'Configurações de tipografia'),
('tipografia', 'cores_texto', '{"primario": "#1a1a1a", "secundario": "#666666", "destaque": "#0066CC"}', 'Cores dos textos'),

('textos_padrao', 'ctas_principais', '{"aceitar": "Aceitar Proposta", "contato": "Falar no WhatsApp", "alteracao": "Solicitar Alteração"}', 'CTAs principais das propostas'),
('textos_padrao', 'rodape', '{"empresa": "DryStore", "endereco": "Rua Principal, 123", "telefone": "(11) 9999-9999", "email": "contato@drystore.com"}', 'Informações do rodapé'),
('textos_padrao', 'avisos_legais', '{"validade": "Esta proposta tem validade de 30 dias", "condicoes": "Valores sujeitos a alteração sem aviso prévio"}', 'Avisos legais padrão'),

('metricas', 'metas_conversao', '{"taxa_objetivo": 25, "tempo_resposta": 24}', 'Metas de conversão'),
('metricas', 'kpis_dashboard', '{"principais": ["conversao", "tempo_visualizacao", "propostas_geradas"]}', 'KPIs exibidos no dashboard');