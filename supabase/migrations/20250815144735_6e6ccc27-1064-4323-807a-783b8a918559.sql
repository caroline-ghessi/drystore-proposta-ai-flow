-- Criar tabela produtos_drywall_mestre para controle administrativo
CREATE TABLE public.produtos_drywall_mestre (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo_funcao TEXT NOT NULL UNIQUE,
    categoria_funcao TEXT NOT NULL,
    descricao TEXT NOT NULL,
    especificacao TEXT NOT NULL,
    preco_unitario NUMERIC NOT NULL DEFAULT 0,
    peso_unitario NUMERIC NOT NULL DEFAULT 0,
    unidade_comercial TEXT NOT NULL DEFAULT 'un',
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.produtos_drywall_mestre ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (admin management)
CREATE POLICY "Produtos drywall mestre públicos" 
ON public.produtos_drywall_mestre 
FOR ALL 
USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_produtos_drywall_mestre_updated_at
BEFORE UPDATE ON public.produtos_drywall_mestre
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Popular tabela com dados atuais da função
INSERT INTO public.produtos_drywall_mestre (codigo_funcao, categoria_funcao, descricao, especificacao, preco_unitario, peso_unitario, unidade_comercial) VALUES
-- VEDAÇÃO
('DRY-ST-12.5', 'VEDAÇÃO', 'Placa Drywall Standard 12,5mm', '1,20m × 2,40m (2,88m²)', 85.00, 25.0, 'un'),

-- ESTRUTURA  
('GUIA-70', 'ESTRUTURA', 'Guia 70mm × 30mm', 'Barra de 3,00m - Galvanizado Z275', 42.00, 2.8, 'barra'),
('MONT-70', 'ESTRUTURA', 'Montante 70mm × 35mm', 'Barra de 3,00m - Galvanizado Z275', 45.00, 3.2, 'barra'),

-- FIXAÇÃO
('PAR-13MM', 'FIXAÇÃO', 'Parafuso Metal-Metal 4,2×13mm', 'Ponta broca - Cabeça lentilha', 85.00, 8.5, 'cx-1000'),
('PAR-25MM', 'FIXAÇÃO', 'Parafuso Metal-Drywall 3,5×25mm', 'Ponta agulha - Cabeça trombeta', 95.00, 9.5, 'cx-1000'),
('BUCHA-S6', 'FIXAÇÃO', 'Bucha S6 com Parafuso 4,5×40mm', 'Nylon + Parafuso galvanizado', 2.50, 0.05, 'un'),

-- ACABAMENTO
('FITA-50MM', 'ACABAMENTO', 'Fita Microperfurada 50mm', 'Papel kraft - Rolo de 150m', 28.00, 1.8, 'rolo'),
('MASSA-JUNTA', 'ACABAMENTO', 'Massa para Juntas', 'Embalagem 20kg - Pronta para uso', 65.00, 20.0, 'saco-20kg'),
('MASSA-ACAB', 'ACABAMENTO', 'Massa de Acabamento', 'Embalagem 20kg - Pronta para uso', 72.00, 20.0, 'saco-20kg'),
('CANT-PERF', 'ACABAMENTO', 'Cantoneira Perfurada 25×25mm', 'Galvanizada - Barra de 3,00m', 32.00, 1.5, 'barra'),

-- ISOLAMENTO
('LA-VIDRO-50MM', 'ISOLAMENTO', 'Lã de Vidro 50mm', 'Densidade 12kg/m³ - Rolo 1,20×12,5m', 185.00, 18.0, 'rolo');