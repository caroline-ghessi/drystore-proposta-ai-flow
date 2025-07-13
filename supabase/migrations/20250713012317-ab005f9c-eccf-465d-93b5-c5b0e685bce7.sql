-- Migration: Sistema Completo de Telhas Shingle
-- Cria nova estrutura para orçamentos completos incluindo todos os componentes

-- 1. Criar tabela de produtos shingle completa
CREATE TABLE IF NOT EXISTS public.produtos_shingle_completos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_componente TEXT NOT NULL CHECK (tipo_componente IN (
        'TELHA', 'CUMEEIRA', 'RUFO_LATERAL', 'RUFO_CAPA', 
        'CALHA', 'PREGO', 'MANTA', 'STARTER'
    )),
    codigo TEXT NOT NULL,
    linha TEXT CHECK (linha IN ('SUPREME', 'DURATION', 'UNIVERSAL')),
    descricao TEXT NOT NULL,
    cor TEXT,
    unidade_medida TEXT NOT NULL,
    conteudo_unidade DECIMAL(10,3) NOT NULL, -- m² por pacote ou m por peça
    quebra_padrao DECIMAL(5,2) DEFAULT 5.0,
    preco_unitario DECIMAL(15,2) NOT NULL,
    peso_unitario DECIMAL(10,2), -- kg
    especificacoes_tecnicas JSONB,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(codigo, tipo_componente)
);

-- 2. Inserir produtos base do sistema completo
INSERT INTO public.produtos_shingle_completos (tipo_componente, codigo, linha, descricao, cor, unidade_medida, conteudo_unidade, quebra_padrao, preco_unitario, peso_unitario) VALUES
-- Telhas
('TELHA', '10420', 'SUPREME', 'SHINGLE LP SUPREME CINZA GRAFITE', 'CINZA GRAFITE', 'pct', 3.1, 5.0, 256.90, 37.2),
('TELHA', '10421', 'SUPREME', 'SHINGLE LP SUPREME MARROM', 'MARROM', 'pct', 3.1, 5.0, 256.90, 37.2),
('TELHA', '10422', 'DURATION', 'SHINGLE LP DURATION CINZA', 'CINZA', 'pct', 3.1, 5.0, 280.00, 37.2),
('TELHA', '10423', 'DURATION', 'SHINGLE LP DURATION MARROM', 'MARROM', 'pct', 3.1, 5.0, 280.00, 37.2),

-- Cumeeiras
('CUMEEIRA', '10430', 'UNIVERSAL', 'CUMEEIRA SHINGLE CINZA', 'CINZA', 'pç', 0.305, 10.0, 28.50, 0.8),
('CUMEEIRA', '10431', 'UNIVERSAL', 'CUMEEIRA SHINGLE MARROM', 'MARROM', 'pç', 0.305, 10.0, 28.50, 0.8),

-- Rufos
('RUFO_LATERAL', '10440', 'UNIVERSAL', 'RUFO LATERAL GALVANIZADO', NULL, 'br', 3.0, 5.0, 45.00, 2.5),
('RUFO_CAPA', '10441', 'UNIVERSAL', 'RUFO CAPA GALVANIZADO', NULL, 'br', 3.0, 5.0, 52.00, 2.8),

-- Calhas
('CALHA', '10450', 'UNIVERSAL', 'CALHA GALVANIZADA', NULL, 'br', 3.0, 5.0, 85.00, 4.2),

-- Acessórios
('PREGO', '10460', 'UNIVERSAL', 'PREGO GALVANIZADO 17x27', NULL, 'kg', 1.0, 0.0, 18.50, 1.0),
('MANTA', '10470', 'UNIVERSAL', 'MANTA ASFALTICA STARTER', NULL, 'm²', 1.0, 10.0, 12.00, 1.5);

-- 3. Criar tabela de orçamentos completos
CREATE TABLE IF NOT EXISTS public.orcamentos_telhado_shingle (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    proposta_id UUID REFERENCES public.propostas(id),
    
    -- Dimensões do telhado
    area_telhado DECIMAL(15,2) NOT NULL,
    comprimento_cumeeira DECIMAL(15,2) DEFAULT 0,
    perimetro_telhado DECIMAL(15,2) DEFAULT 0,
    comprimento_calha DECIMAL(15,2) DEFAULT 0,
    comprimento_rufo_lateral DECIMAL(15,2) DEFAULT 0,
    comprimento_rufo_capa DECIMAL(15,2) DEFAULT 0,
    
    -- Configurações
    telha_codigo TEXT,
    cor_acessorios TEXT DEFAULT 'CINZA',
    incluir_calha BOOLEAN DEFAULT true,
    incluir_manta_starter BOOLEAN DEFAULT true,
    
    -- Percentuais de quebra personalizados (opcional)
    quebra_telha DECIMAL(5,2),
    quebra_cumeeira DECIMAL(5,2),
    quebra_rufo DECIMAL(5,2),
    
    -- Resumo financeiro
    valor_total DECIMAL(15,2),
    valor_por_m2 DECIMAL(15,2),
    
    -- Status
    status TEXT DEFAULT 'rascunho',
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela de itens do orçamento
CREATE TABLE IF NOT EXISTS public.itens_orcamento_shingle (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    orcamento_id UUID REFERENCES public.orcamentos_telhado_shingle(id) ON DELETE CASCADE,
    produto_codigo TEXT NOT NULL,
    tipo_componente TEXT NOT NULL,
    
    -- Dimensões
    dimensao_base DECIMAL(15,2), -- área ou comprimento
    unidade_dimensao TEXT,
    fator_conversao DECIMAL(10,4),
    quebra_aplicada DECIMAL(5,2),
    fator_com_quebra DECIMAL(10,4),
    
    -- Quantidades
    quantidade_calculada DECIMAL(15,3),
    quantidade_arredondada INTEGER,
    unidade_venda TEXT,
    
    -- Valores
    preco_unitario DECIMAL(15,2),
    valor_total DECIMAL(15,2),
    
    -- Descrição do item
    descricao TEXT,
    especificacoes JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Função para calcular orçamento completo
CREATE OR REPLACE FUNCTION calcular_orcamento_shingle_completo(
    p_area_telhado DECIMAL,
    p_comprimento_cumeeira DECIMAL DEFAULT 0,
    p_perimetro_telhado DECIMAL DEFAULT 0,
    p_comprimento_calha DECIMAL DEFAULT 0,
    p_telha_codigo TEXT DEFAULT '10420',
    p_cor_acessorios TEXT DEFAULT 'CINZA',
    p_incluir_manta BOOLEAN DEFAULT true
)
RETURNS TABLE (
    tipo_item TEXT,
    codigo TEXT,
    descricao TEXT,
    dimensao_base DECIMAL,
    unidade_dimensao TEXT,
    fator_conversao DECIMAL,
    quebra_percentual DECIMAL,
    quantidade_calculada DECIMAL,
    quantidade_final INTEGER,
    unidade_venda TEXT,
    preco_unitario DECIMAL,
    valor_total DECIMAL
) AS $$
DECLARE
    v_telha RECORD;
    v_cumeeira RECORD;
    v_rufo_lateral RECORD;
    v_rufo_capa RECORD;
    v_calha RECORD;
    v_prego RECORD;
    v_manta RECORD;
    v_total_metros_lineares DECIMAL;
    v_consumo_pregos DECIMAL;
    v_comprimento_rufo_lateral DECIMAL;
    v_comprimento_rufo_capa DECIMAL;
BEGIN
    -- Estimar comprimentos de rufos se não informados
    v_comprimento_rufo_lateral := CASE 
        WHEN p_perimetro_telhado > 0 THEN p_perimetro_telhado * 0.6 
        ELSE 0 
    END;
    v_comprimento_rufo_capa := CASE 
        WHEN p_perimetro_telhado > 0 THEN p_perimetro_telhado * 0.4 
        ELSE 0 
    END;
    v_total_metros_lineares := p_comprimento_cumeeira + p_perimetro_telhado + p_comprimento_calha;
    
    -- Buscar produtos
    SELECT * INTO v_telha FROM produtos_shingle_completos 
    WHERE codigo = p_telha_codigo AND tipo_componente = 'TELHA' AND ativo = true LIMIT 1;
    
    SELECT * INTO v_cumeeira FROM produtos_shingle_completos 
    WHERE tipo_componente = 'CUMEEIRA' AND cor = p_cor_acessorios AND ativo = true LIMIT 1;
    
    SELECT * INTO v_rufo_lateral FROM produtos_shingle_completos 
    WHERE tipo_componente = 'RUFO_LATERAL' AND ativo = true LIMIT 1;
    
    SELECT * INTO v_rufo_capa FROM produtos_shingle_completos 
    WHERE tipo_componente = 'RUFO_CAPA' AND ativo = true LIMIT 1;
    
    SELECT * INTO v_calha FROM produtos_shingle_completos 
    WHERE tipo_componente = 'CALHA' AND ativo = true LIMIT 1;
    
    SELECT * INTO v_prego FROM produtos_shingle_completos 
    WHERE tipo_componente = 'PREGO' AND ativo = true LIMIT 1;
    
    SELECT * INTO v_manta FROM produtos_shingle_completos 
    WHERE tipo_componente = 'MANTA' AND ativo = true LIMIT 1;
    
    -- 1. Telhas
    IF v_telha.id IS NOT NULL AND p_area_telhado > 0 THEN
        RETURN QUERY
        WITH calc AS (
            SELECT 
                (1.0 / v_telha.conteudo_unidade) as fator,
                (1.0 / v_telha.conteudo_unidade) * (1 + v_telha.quebra_padrao / 100.0) as fator_quebra,
                p_area_telhado * (1.0 / v_telha.conteudo_unidade) * (1 + v_telha.quebra_padrao / 100.0) as qtd
        )
        SELECT 
            'TELHA'::TEXT,
            v_telha.codigo,
            v_telha.descricao,
            p_area_telhado,
            'm²'::TEXT,
            calc.fator,
            v_telha.quebra_padrao,
            calc.qtd,
            CEIL(calc.qtd)::INTEGER,
            v_telha.unidade_medida,
            v_telha.preco_unitario,
            CEIL(calc.qtd) * v_telha.preco_unitario
        FROM calc;
    END IF;
    
    -- 2. Cumeeiras
    IF v_cumeeira.id IS NOT NULL AND p_comprimento_cumeeira > 0 THEN
        RETURN QUERY
        WITH calc AS (
            SELECT 
                (1.0 / v_cumeeira.conteudo_unidade) as fator,
                (1.0 / v_cumeeira.conteudo_unidade) * (1 + v_cumeeira.quebra_padrao / 100.0) as fator_quebra,
                p_comprimento_cumeeira * (1.0 / v_cumeeira.conteudo_unidade) * (1 + v_cumeeira.quebra_padrao / 100.0) as qtd
        )
        SELECT 
            'CUMEEIRA'::TEXT,
            v_cumeeira.codigo,
            v_cumeeira.descricao,
            p_comprimento_cumeeira,
            'm'::TEXT,
            calc.fator,
            v_cumeeira.quebra_padrao,
            calc.qtd,
            CEIL(calc.qtd)::INTEGER,
            v_cumeeira.unidade_medida,
            v_cumeeira.preco_unitario,
            CEIL(calc.qtd) * v_cumeeira.preco_unitario
        FROM calc;
    END IF;
    
    -- 3. Rufo Lateral
    IF v_rufo_lateral.id IS NOT NULL AND v_comprimento_rufo_lateral > 0 THEN
        RETURN QUERY
        WITH calc AS (
            SELECT 
                (1.0 / v_rufo_lateral.conteudo_unidade) as fator,
                (1.0 / v_rufo_lateral.conteudo_unidade) * (1 + v_rufo_lateral.quebra_padrao / 100.0) as fator_quebra,
                v_comprimento_rufo_lateral * (1.0 / v_rufo_lateral.conteudo_unidade) * (1 + v_rufo_lateral.quebra_padrao / 100.0) as qtd
        )
        SELECT 
            'RUFO_LATERAL'::TEXT,
            v_rufo_lateral.codigo,
            v_rufo_lateral.descricao,
            v_comprimento_rufo_lateral,
            'm'::TEXT,
            calc.fator,
            v_rufo_lateral.quebra_padrao,
            calc.qtd,
            CEIL(calc.qtd)::INTEGER,
            v_rufo_lateral.unidade_medida,
            v_rufo_lateral.preco_unitario,
            CEIL(calc.qtd) * v_rufo_lateral.preco_unitario
        FROM calc;
    END IF;
    
    -- 4. Rufo Capa
    IF v_rufo_capa.id IS NOT NULL AND v_comprimento_rufo_capa > 0 THEN
        RETURN QUERY
        WITH calc AS (
            SELECT 
                (1.0 / v_rufo_capa.conteudo_unidade) as fator,
                (1.0 / v_rufo_capa.conteudo_unidade) * (1 + v_rufo_capa.quebra_padrao / 100.0) as fator_quebra,
                v_comprimento_rufo_capa * (1.0 / v_rufo_capa.conteudo_unidade) * (1 + v_rufo_capa.quebra_padrao / 100.0) as qtd
        )
        SELECT 
            'RUFO_CAPA'::TEXT,
            v_rufo_capa.codigo,
            v_rufo_capa.descricao,
            v_comprimento_rufo_capa,
            'm'::TEXT,
            calc.fator,
            v_rufo_capa.quebra_padrao,
            calc.qtd,
            CEIL(calc.qtd)::INTEGER,
            v_rufo_capa.unidade_medida,
            v_rufo_capa.preco_unitario,
            CEIL(calc.qtd) * v_rufo_capa.preco_unitario
        FROM calc;
    END IF;
    
    -- 5. Calhas
    IF v_calha.id IS NOT NULL AND p_comprimento_calha > 0 THEN
        RETURN QUERY
        WITH calc AS (
            SELECT 
                (1.0 / v_calha.conteudo_unidade) as fator,
                (1.0 / v_calha.conteudo_unidade) * (1 + v_calha.quebra_padrao / 100.0) as fator_quebra,
                p_comprimento_calha * (1.0 / v_calha.conteudo_unidade) * (1 + v_calha.quebra_padrao / 100.0) as qtd
        )
        SELECT 
            'CALHA'::TEXT,
            v_calha.codigo,
            v_calha.descricao,
            p_comprimento_calha,
            'm'::TEXT,
            calc.fator,
            v_calha.quebra_padrao,
            calc.qtd,
            CEIL(calc.qtd)::INTEGER,
            v_calha.unidade_medida,
            v_calha.preco_unitario,
            CEIL(calc.qtd) * v_calha.preco_unitario
        FROM calc;
    END IF;
    
    -- 6. Pregos
    IF v_prego.id IS NOT NULL THEN
        -- 0.15 kg/m² para telhas + 0.1 kg/m linear para acessórios
        v_consumo_pregos := (p_area_telhado * 0.15) + (v_total_metros_lineares * 0.1);
        
        RETURN QUERY
        SELECT 
            'PREGO'::TEXT,
            v_prego.codigo,
            v_prego.descricao,
            v_consumo_pregos,
            'kg'::TEXT,
            1.0::DECIMAL,
            0.0::DECIMAL,
            v_consumo_pregos,
            CEIL(v_consumo_pregos)::INTEGER,
            v_prego.unidade_medida,
            v_prego.preco_unitario,
            CEIL(v_consumo_pregos) * v_prego.preco_unitario;
    END IF;
    
    -- 7. Manta Starter
    IF v_manta.id IS NOT NULL AND p_incluir_manta AND p_perimetro_telhado > 0 THEN
        RETURN QUERY
        WITH calc AS (
            SELECT 
                p_perimetro_telhado * 0.25 as area_base, -- 25cm de largura
                p_perimetro_telhado * 0.25 * (1 + v_manta.quebra_padrao / 100.0) as area_total
        )
        SELECT 
            'MANTA_STARTER'::TEXT,
            v_manta.codigo,
            v_manta.descricao,
            calc.area_base,
            'm²'::TEXT,
            1.0::DECIMAL,
            v_manta.quebra_padrao,
            calc.area_total,
            CEIL(calc.area_total)::INTEGER,
            v_manta.unidade_medida,
            v_manta.preco_unitario,
            CEIL(calc.area_total) * v_manta.preco_unitario
        FROM calc;
    END IF;
    
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger para updated_at
CREATE TRIGGER update_orcamentos_telhado_shingle_updated_at
    BEFORE UPDATE ON public.orcamentos_telhado_shingle
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_produtos_shingle_completos_updated_at
    BEFORE UPDATE ON public.produtos_shingle_completos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Políticas RLS (Row Level Security)
ALTER TABLE public.produtos_shingle_completos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamentos_telhado_shingle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_orcamento_shingle ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Produtos shingle são públicos" ON public.produtos_shingle_completos FOR ALL USING (true);
CREATE POLICY "Orçamentos públicos temporário" ON public.orcamentos_telhado_shingle FOR ALL USING (true);
CREATE POLICY "Itens orçamento públicos temporário" ON public.itens_orcamento_shingle FOR ALL USING (true);

-- 8. Índices para performance
CREATE INDEX IF NOT EXISTS idx_produtos_shingle_tipo_componente ON public.produtos_shingle_completos(tipo_componente);
CREATE INDEX IF NOT EXISTS idx_produtos_shingle_codigo ON public.produtos_shingle_completos(codigo);
CREATE INDEX IF NOT EXISTS idx_produtos_shingle_ativo ON public.produtos_shingle_completos(ativo);
CREATE INDEX IF NOT EXISTS idx_orcamentos_shingle_proposta ON public.orcamentos_telhado_shingle(proposta_id);
CREATE INDEX IF NOT EXISTS idx_itens_orcamento_shingle_orcamento ON public.itens_orcamento_shingle(orcamento_id);