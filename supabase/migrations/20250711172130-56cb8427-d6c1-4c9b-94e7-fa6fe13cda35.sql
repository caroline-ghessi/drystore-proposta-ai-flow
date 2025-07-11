-- Criar ENUMs para tipos e status
CREATE TYPE public.tipo_proposta_enum AS ENUM (
  'energia-solar',
  'telhas', 
  'divisorias',
  'pisos',
  'forros'
);

CREATE TYPE public.status_proposta_enum AS ENUM (
  'processando',
  'enviada',
  'visualizada', 
  'aceita',
  'expirada'
);

CREATE TYPE public.tipo_notificacao_enum AS ENUM (
  'visualizacao',
  'aceitacao',
  'contato',
  'vencimento'
);

-- Tabela de vendedores
CREATE TABLE public.vendedores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  whatsapp TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de clientes
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT,
  endereco TEXT,
  vendedor_id UUID REFERENCES public.vendedores(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de produtos
CREATE TABLE public.produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria TEXT NOT NULL,
  nome TEXT NOT NULL,
  preco_unitario DECIMAL(10,2),
  unidade TEXT NOT NULL DEFAULT 'un',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de propostas
CREATE TABLE public.propostas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_nome TEXT NOT NULL,
  cliente_email TEXT NOT NULL,
  cliente_whatsapp TEXT,
  cliente_endereco TEXT,
  vendedor_id UUID REFERENCES public.vendedores(id),
  tipo_proposta public.tipo_proposta_enum NOT NULL,
  status public.status_proposta_enum NOT NULL DEFAULT 'processando',
  arquivo_original TEXT,
  dados_extraidos JSONB,
  valor_total DECIMAL(12,2),
  forma_pagamento TEXT,
  observacoes TEXT,
  url_unica TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_vencimento TIMESTAMP WITH TIME ZONE,
  data_visualizacao TIMESTAMP WITH TIME ZONE,
  data_aceitacao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de notificações
CREATE TABLE public.notificacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposta_id UUID REFERENCES public.propostas(id) ON DELETE CASCADE,
  tipo public.tipo_notificacao_enum NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN NOT NULL DEFAULT false,
  dados_extras JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS (sem políticas por enquanto, serão públicas)
ALTER TABLE public.vendedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Políticas temporárias públicas (até implementarmos auth)
CREATE POLICY "Acesso público temporário" ON public.vendedores FOR ALL USING (true);
CREATE POLICY "Acesso público temporário" ON public.clientes FOR ALL USING (true);
CREATE POLICY "Acesso público temporário" ON public.produtos FOR ALL USING (true);
CREATE POLICY "Acesso público temporário" ON public.propostas FOR ALL USING (true);
CREATE POLICY "Acesso público temporário" ON public.notificacoes FOR ALL USING (true);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_vendedores_updated_at
  BEFORE UPDATE ON public.vendedores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_produtos_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_propostas_updated_at
  BEFORE UPDATE ON public.propostas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('documentos-propostas', 'documentos-propostas', false),
  ('templates-email', 'templates-email', true);

-- Políticas de storage para documentos-propostas
CREATE POLICY "Acesso público temporário documentos" ON storage.objects
  FOR ALL USING (bucket_id = 'documentos-propostas');

-- Políticas de storage para templates-email
CREATE POLICY "Leitura pública templates" ON storage.objects
  FOR SELECT USING (bucket_id = 'templates-email');

CREATE POLICY "Upload público templates" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'templates-email');

-- Inserir dados iniciais
INSERT INTO public.vendedores (nome, email, whatsapp) VALUES 
  ('João Silva', 'joao@drystore.com', '11999999999'),
  ('Maria Santos', 'maria@drystore.com', '11888888888'),
  ('Pedro Costa', 'pedro@drystore.com', '11777777777');

-- Produtos exemplo para cada categoria
INSERT INTO public.produtos (categoria, nome, preco_unitario, unidade) VALUES 
  ('energia-solar', 'Painel Solar 550W', 899.99, 'un'),
  ('energia-solar', 'Inversor 5kW', 2500.00, 'un'),
  ('energia-solar', 'Estrutura de Fixação', 150.00, 'un'),
  ('telhas', 'Telha Americana', 2.50, 'un'),
  ('telhas', 'Telha Francesa', 3.20, 'un'),
  ('divisorias', 'Divisória Drywall', 45.00, 'm²'),
  ('pisos', 'Piso Laminado', 35.00, 'm²'),
  ('forros', 'Forro PVC', 25.00, 'm²');