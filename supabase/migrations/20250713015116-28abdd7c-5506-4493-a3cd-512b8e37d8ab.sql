-- Fase 1: Criar tabela de produtos de impermeabilização
CREATE TABLE public.produtos_impermeabilizacao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    tipo TEXT CHECK (tipo IN ('CIMENTICIO', 'ASFALTICO', 'POLIURETANO', 'ACRILICO', 'TELA', 'PRIMER', 'ACESSORIO')) NOT NULL,
    categoria TEXT CHECK (categoria IN ('IMPERMEABILIZANTE', 'REFORCO', 'PREPARACAO', 'COMPLEMENTO')) NOT NULL,
    
    -- Dados técnicos
    consumo_m2 DECIMAL(10,3) NOT NULL, -- kg/m² ou L/m²
    unidade_medida TEXT NOT NULL, -- kg, L, m²
    unidade_venda TEXT NOT NULL, -- saco, balde, rolo
    quantidade_unidade_venda DECIMAL(10,2) NOT NULL, -- 20kg, 18L, 50m²
    
    -- Cálculos
    fator_multiplicador DECIMAL(10,4) GENERATED ALWAYS AS 
        (consumo_m2 / NULLIF(quantidade_unidade_venda, 0)) STORED,
    quebra_padrao DECIMAL(5,2) DEFAULT 5.0,
    
    -- Valores
    preco_unitario DECIMAL(15,2) NOT NULL,
    
    -- Aplicações
    aplicacoes TEXT[] DEFAULT '{}', -- ['laje', 'piscina', 'reservatorio', 'fundacao']
    normas TEXT[] DEFAULT '{}', -- ['NBR 9575', 'NBR 9574']
    
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expandir tabela calculos_impermeabilizacao
ALTER TABLE public.calculos_impermeabilizacao ADD COLUMN IF NOT EXISTS perimetro DECIMAL(15,2);
ALTER TABLE public.calculos_impermeabilizacao ADD COLUMN IF NOT EXISTS altura_subida DECIMAL(10,2) DEFAULT 0.30;
ALTER TABLE public.calculos_impermeabilizacao ADD COLUMN IF NOT EXISTS area_vertical DECIMAL(15,2) GENERATED ALWAYS AS 
    (COALESCE(perimetro, 0) * COALESCE(altura_subida, 0.30)) STORED;
ALTER TABLE public.calculos_impermeabilizacao ADD COLUMN IF NOT EXISTS area_total_impermeabilizar DECIMAL(15,2) GENERATED ALWAYS AS 
    (area_aplicacao + COALESCE(perimetro * altura_subida, 0)) STORED;

ALTER TABLE public.calculos_impermeabilizacao ADD COLUMN IF NOT EXISTS com_transito BOOLEAN DEFAULT false;
ALTER TABLE public.calculos_impermeabilizacao ADD COLUMN IF NOT EXISTS com_protecao_mecanica BOOLEAN DEFAULT false;
ALTER TABLE public.calculos_impermeabilizacao ADD COLUMN IF NOT EXISTS exposicao_uv BOOLEAN DEFAULT true;
ALTER TABLE public.calculos_impermeabilizacao ADD COLUMN IF NOT EXISTS contato_agua TEXT CHECK (contato_agua IN ('PERMANENTE', 'EVENTUAL', 'NENHUM'));
ALTER TABLE public.calculos_impermeabilizacao ADD COLUMN IF NOT EXISTS com_tela BOOLEAN DEFAULT true;
ALTER TABLE public.calculos_impermeabilizacao ADD COLUMN IF NOT EXISTS com_primer BOOLEAN DEFAULT true;
ALTER TABLE public.calculos_impermeabilizacao ADD COLUMN IF NOT EXISTS quebra_percentual DECIMAL(5,2) DEFAULT 5.0;

-- Tabela de itens do cálculo
CREATE TABLE IF NOT EXISTS public.itens_calculo_impermeabilizacao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    calculo_id UUID REFERENCES public.calculos_impermeabilizacao(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES public.produtos_impermeabilizacao(id),
    
    -- Quantidades
    area_aplicacao DECIMAL(15,2) NOT NULL,
    consumo_m2 DECIMAL(10,3) NOT NULL,
    quantidade_necessaria DECIMAL(15,2) GENERATED ALWAYS AS 
        (area_aplicacao * consumo_m2) STORED,
    quantidade_com_quebra DECIMAL(15,2) NOT NULL,
    unidades_compra INTEGER NOT NULL,
    
    -- Valores
    preco_unitario DECIMAL(15,2) NOT NULL,
    valor_total DECIMAL(15,2) GENERATED ALWAYS AS 
        (unidades_compra * preco_unitario) STORED,
    
    -- Ordem e função
    ordem_aplicacao INTEGER DEFAULT 1,
    funcao TEXT NOT NULL, -- 'primer', 'impermeabilizante', 'reforco', etc
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para as novas tabelas
ALTER TABLE public.produtos_impermeabilizacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_calculo_impermeabilizacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Produtos impermeabilização públicos" 
ON public.produtos_impermeabilizacao 
FOR ALL 
USING (true);

CREATE POLICY "Itens cálculo impermeabilização públicos" 
ON public.itens_calculo_impermeabilizacao 
FOR ALL 
USING (true);

-- Triggers
CREATE TRIGGER update_produtos_impermeabilizacao_updated_at
    BEFORE UPDATE ON public.produtos_impermeabilizacao
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir produtos reais conforme documentação
INSERT INTO public.produtos_impermeabilizacao (codigo, nome, tipo, categoria, consumo_m2, unidade_medida, unidade_venda, quantidade_unidade_venda, preco_unitario, aplicacoes) VALUES
('10555', 'MAPELASTIC SMART /A SACO 20 KG', 'CIMENTICIO', 'IMPERMEABILIZANTE', 1.0, 'kg', 'saco', 20.0, 113.90, '{"laje_descoberta", "piscina", "reservatorio"}'),
('10556', 'MAPELASTIC SMART /B SACO 20 KG', 'CIMENTICIO', 'IMPERMEABILIZANTE', 1.0, 'kg', 'saco', 20.0, 138.90, '{"laje_descoberta", "piscina", "reservatorio"}'),
('10280', 'IMPERMEABILIZAÇÃO ELASTMENT', 'ASFALTICO', 'IMPERMEABILIZANTE', 1.0, 'kg', 'balde', 18.0, 63.47, '{"fundacao", "jardineira"}'),
('10277', 'IMPERMEABILIZAÇÃO MAPELASTIC', 'CIMENTICIO', 'IMPERMEABILIZANTE', 1.5, 'kg', 'saco', 25.0, 82.10, '{"laje_descoberta", "area_molhada"}'),
('10553', 'MAPENET 150 ROLO 1X50 MT', 'TELA', 'REFORCO', 1.1, 'm²', 'rolo', 50.0, 1045.00, '{"universal"}'),
('PRIMER001', 'PRIMER MAPELASTIC', 'PRIMER', 'PREPARACAO', 0.2, 'L', 'galao', 3.6, 85.00, '{"universal"}'),
('MANTA001', 'MANTA ASFÁLTICA 3MM', 'ASFALTICO', 'REFORCO', 1.1, 'm²', 'rolo', 10.0, 49.50, '{"fundacao", "laje_descoberta"}');

-- Fase 2: Função de cálculo avançada
CREATE OR REPLACE FUNCTION public.calcular_orcamento_impermeabilizacao(
    p_area_total DECIMAL,
    p_tipo_aplicacao TEXT DEFAULT 'LAJE_DESCOBERTA',
    p_perimetro DECIMAL DEFAULT NULL,
    p_altura_subida DECIMAL DEFAULT 0.30,
    p_com_tela BOOLEAN DEFAULT true,
    p_com_primer BOOLEAN DEFAULT true,
    p_quebra DECIMAL DEFAULT 5.0,
    p_produto_principal_id UUID DEFAULT NULL
)
RETURNS TABLE (
    produto_id UUID,
    produto_codigo TEXT,
    produto_nome TEXT,
    tipo TEXT,
    funcao TEXT,
    consumo_m2 DECIMAL,
    area_aplicacao DECIMAL,
    quantidade_necessaria DECIMAL,
    quantidade_com_quebra DECIMAL,
    unidades_compra INTEGER,
    unidade_venda TEXT,
    preco_unitario DECIMAL,
    valor_total DECIMAL,
    ordem INTEGER
) AS $$
DECLARE
    v_area_vertical DECIMAL;
    v_area_total_imp DECIMAL;
    v_produto_principal RECORD;
BEGIN
    -- Calcular área vertical (rodapé)
    IF p_perimetro IS NOT NULL THEN
        v_area_vertical := p_perimetro * p_altura_subida;
    ELSE
        v_area_vertical := 0;
    END IF;
    
    v_area_total_imp := p_area_total + v_area_vertical;
    
    -- Selecionar produto principal se não especificado
    IF p_produto_principal_id IS NULL THEN
        SELECT * INTO v_produto_principal
        FROM produtos_impermeabilizacao p
        WHERE p.ativo = true
        AND p.categoria = 'IMPERMEABILIZANTE'
        AND (
            (p_tipo_aplicacao = 'LAJE_DESCOBERTA' AND p.tipo = 'CIMENTICIO')
            OR (p_tipo_aplicacao = 'FUNDACAO' AND p.tipo = 'ASFALTICO')
            OR (p_tipo_aplicacao = 'PISCINA' AND p.tipo = 'CIMENTICIO')
        )
        ORDER BY p.preco_unitario ASC
        LIMIT 1;
    ELSE
        SELECT * INTO v_produto_principal
        FROM produtos_impermeabilizacao p
        WHERE p.id = p_produto_principal_id;
    END IF;
    
    -- 1. Primer (se solicitado)
    IF p_com_primer THEN
        RETURN QUERY
        WITH primer_calc AS (
            SELECT 
                p.*,
                v_area_total_imp as area_app,
                v_area_total_imp * p.consumo_m2 as qtd_necessaria,
                v_area_total_imp * p.consumo_m2 * (1 + p_quebra/100) as qtd_com_quebra
            FROM produtos_impermeabilizacao p
            WHERE p.ativo = true AND p.tipo = 'PRIMER'
            LIMIT 1
        )
        SELECT 
            pc.id,
            pc.codigo,
            pc.nome,
            pc.tipo,
            'PRIMER'::TEXT,
            pc.consumo_m2,
            pc.area_app,
            pc.qtd_necessaria,
            pc.qtd_com_quebra,
            CEIL(pc.qtd_com_quebra / pc.quantidade_unidade_venda)::INTEGER,
            pc.unidade_venda,
            pc.preco_unitario,
            CEIL(pc.qtd_com_quebra / pc.quantidade_unidade_venda) * pc.preco_unitario,
            1::INTEGER
        FROM primer_calc pc;
    END IF;
    
    -- 2. Impermeabilizante principal
    IF v_produto_principal.id IS NOT NULL THEN
        RETURN QUERY
        WITH imp_calc AS (
            SELECT 
                v_produto_principal.*,
                v_area_total_imp as area_app,
                v_area_total_imp * v_produto_principal.consumo_m2 * 2 as qtd_necessaria, -- 2 demãos
                v_area_total_imp * v_produto_principal.consumo_m2 * 2 * (1 + p_quebra/100) as qtd_com_quebra
        )
        SELECT 
            v_produto_principal.id,
            v_produto_principal.codigo,
            v_produto_principal.nome,
            v_produto_principal.tipo,
            'IMPERMEABILIZANTE'::TEXT,
            v_produto_principal.consumo_m2 * 2, -- 2 demãos
            v_area_total_imp,
            v_area_total_imp * v_produto_principal.consumo_m2 * 2,
            v_area_total_imp * v_produto_principal.consumo_m2 * 2 * (1 + p_quebra/100),
            CEIL(v_area_total_imp * v_produto_principal.consumo_m2 * 2 * (1 + p_quebra/100) / v_produto_principal.quantidade_unidade_venda)::INTEGER,
            v_produto_principal.unidade_venda,
            v_produto_principal.preco_unitario,
            CEIL(v_area_total_imp * v_produto_principal.consumo_m2 * 2 * (1 + p_quebra/100) / v_produto_principal.quantidade_unidade_venda) * v_produto_principal.preco_unitario,
            2::INTEGER;
    END IF;
    
    -- 3. Tela de reforço (se solicitada)
    IF p_com_tela THEN
        RETURN QUERY
        WITH tela_calc AS (
            SELECT 
                p.*,
                v_area_total_imp as area_app,
                v_area_total_imp * p.consumo_m2 as qtd_necessaria, -- 10% sobreposição já no consumo
                v_area_total_imp * p.consumo_m2 * (1 + p_quebra/100) as qtd_com_quebra
            FROM produtos_impermeabilizacao p
            WHERE p.ativo = true AND p.tipo = 'TELA'
            ORDER BY p.preco_unitario ASC
            LIMIT 1
        )
        SELECT 
            tc.id,
            tc.codigo,
            tc.nome,
            tc.tipo,
            'REFORCO'::TEXT,
            tc.consumo_m2,
            tc.area_app,
            tc.qtd_necessaria,
            tc.qtd_com_quebra,
            CEIL(tc.qtd_com_quebra / tc.quantidade_unidade_venda)::INTEGER,
            tc.unidade_venda,
            tc.preco_unitario,
            CEIL(tc.qtd_com_quebra / tc.quantidade_unidade_venda) * tc.preco_unitario,
            3::INTEGER
        FROM tela_calc tc;
    END IF;
END;
$$ LANGUAGE plpgsql;