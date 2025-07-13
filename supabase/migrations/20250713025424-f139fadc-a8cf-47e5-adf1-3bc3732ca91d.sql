-- Criar nova estrutura unificada para produtos Shingle
CREATE TABLE IF NOT EXISTS produtos_shingle_novo (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_componente TEXT NOT NULL CHECK (tipo_componente IN (
        'TELHA', 'CUMEEIRA', 'RUFO_LATERAL', 'RUFO_CAPA', 
        'CALHA', 'PREGO', 'MANTA_STARTER', 'GRAMPO',
        'OSB', 'SUBCOBERTURA', 'VENTILACAO', 
        'SELANTE', 'FLASH'
    )),
    codigo TEXT NOT NULL UNIQUE,
    linha TEXT CHECK (linha IN ('SUPREME', 'DURATION', 'UNIVERSAL')),
    descricao TEXT NOT NULL,
    cor TEXT,
    unidade_medida TEXT NOT NULL,
    conteudo_unidade DECIMAL(10,3) NOT NULL, -- m² por pacote ou m por peça
    quebra_padrao DECIMAL(5,2) DEFAULT 5.0,
    preco_unitario DECIMAL(15,2) NOT NULL,
    peso_unitario DECIMAL(10,2),
    especificacoes_tecnicas JSONB,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_produtos_shingle_tipo ON produtos_shingle_novo(tipo_componente);
CREATE INDEX IF NOT EXISTS idx_produtos_shingle_linha ON produtos_shingle_novo(linha);
CREATE INDEX IF NOT EXISTS idx_produtos_shingle_ativo ON produtos_shingle_novo(ativo);

-- Tabela de composições para regras de cálculo
CREATE TABLE IF NOT EXISTS composicoes_shingle (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_composicao TEXT NOT NULL,
    linha_telha TEXT,
    produto_id UUID REFERENCES produtos_shingle_novo(id) ON DELETE CASCADE,
    tipo_calculo TEXT CHECK (tipo_calculo IN ('AREA', 'LINEAR', 'UNITARIO', 'ESPECIAL')) NOT NULL,
    base_calculo TEXT NOT NULL, -- 'area_telhado', 'comprimento_cumeeira', etc
    consumo_unitario DECIMAL(10,4) NOT NULL,
    ordem_instalacao INTEGER DEFAULT 1,
    obrigatorio BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir produtos completos conforme documentação
INSERT INTO produtos_shingle_novo (tipo_componente, codigo, linha, descricao, cor, unidade_medida, conteudo_unidade, quebra_padrao, preco_unitario, peso_unitario, especificacoes_tecnicas) VALUES
-- Telhas
('TELHA', '10420', 'SUPREME', 'SHINGLE LP SUPREME CINZA GRAFITE', 'CINZA GRAFITE', 'pct', 3.1, 5.0, 256.90, 37.2, '{"garantia_anos": 25, "resistencia_vento_kmh": 200}'),
('TELHA', '10421', 'DURATION', 'SHINGLE LP DURATION CINZA', 'CINZA', 'pct', 3.1, 5.0, 280.00, 37.2, '{"garantia_anos": 30, "resistencia_vento_kmh": 220}'),

-- Base Estrutural
('OSB', '10430', 'UNIVERSAL', 'LP OSB HOME PLUS 11,1MM - 1,20x2,44', NULL, 'm²', 1.0, 5.0, 45.00, 8.5, '{"espessura_mm": 11.1, "dimensoes": "1,20x2,44m"}'),

-- Impermeabilização
('SUBCOBERTURA', '10435', 'UNIVERSAL', 'SUBCOBERTURA TYVEK PROTEC 120', NULL, 'rl', 50.0, 10.0, 450.00, 15.0, '{"largura_m": 1.5, "comprimento_m": 33.3}'),
('MANTA_STARTER', '10470', 'UNIVERSAL', 'MANTA ASFÁLTICA STARTER', NULL, 'm²', 1.0, 10.0, 12.00, 4.5, '{"largura_padrao_m": 0.25}'),

-- Cumeeiras
('CUMEEIRA', '10440', 'UNIVERSAL', 'CUMEEIRA SHINGLE CINZA', 'CINZA', 'pç', 0.305, 10.0, 28.50, 0.8, '{"comprimento_m": 0.305}'),
('CUMEEIRA', '10441', 'UNIVERSAL', 'CUMEEIRA SHINGLE MARROM', 'MARROM', 'pç', 0.305, 10.0, 28.50, 0.8, '{"comprimento_m": 0.305}'),
('VENTILACAO', '10442', 'UNIVERSAL', 'CUMEEIRA VENTILADA DRYSTORE', NULL, 'pç', 0.305, 5.0, 42.00, 1.2, '{"comprimento_m": 0.305, "ventilacao": true}'),

-- Fixação
('PREGO', '10445', 'UNIVERSAL', 'PREGO ROLO SHINGLE 18X25MM', NULL, 'rl', 120.0, 5.0, 85.00, 2.5, '{"quantidade_unidades": 7200, "area_cobertura_m2": 125}'),
('GRAMPO', '10446', 'UNIVERSAL', 'GRAMPO MAKITA 001708-0A 80W6 C', NULL, 'pct', 5000.0, 5.0, 125.00, 12.0, '{"quantidade_unidades": 5000, "area_cobertura_m2": 100}'),

-- Rufos e Calhas
('RUFO_LATERAL', '10450', 'UNIVERSAL', 'RUFO LATERAL GALVANIZADO', NULL, 'br', 3.0, 5.0, 45.00, 2.8, '{"comprimento_m": 3.0, "largura_mm": 200}'),
('RUFO_CAPA', '10451', 'UNIVERSAL', 'RUFO CAPA GALVANIZADO', NULL, 'br', 3.0, 5.0, 52.00, 3.2, '{"comprimento_m": 3.0, "largura_mm": 250}'),
('CALHA', '10455', 'UNIVERSAL', 'CALHA GALVANIZADA', NULL, 'br', 3.0, 5.0, 85.00, 4.5, '{"comprimento_m": 3.0, "diametro_mm": 125}'),

-- Impermeabilização Complementar
('SELANTE', '10460', 'UNIVERSAL', 'MONOPOL ASFÁLTICO PT 310ML', NULL, 'bn', 1.0, 0.0, 28.00, 0.45, '{"volume_ml": 310, "rendimento_m": 50}'),
('FLASH', '10461', 'UNIVERSAL', 'BOBINA ALUMÍNIO STEP FLASH 150', NULL, 'und', 1.0, 0.0, 180.00, 1.8, '{"largura_mm": 150, "comprimento_m": 10}');

-- Inserir composições padrão
INSERT INTO composicoes_shingle (nome_composicao, linha_telha, produto_id, tipo_calculo, base_calculo, consumo_unitario, ordem_instalacao, obrigatorio)
SELECT 
    'Telhado Shingle Completo',
    'UNIVERSAL',
    p.id,
    CASE 
        WHEN p.tipo_componente IN ('TELHA', 'OSB', 'SUBCOBERTURA') THEN 'AREA'
        WHEN p.tipo_componente IN ('CUMEEIRA', 'VENTILACAO') THEN 'LINEAR'
        WHEN p.tipo_componente = 'MANTA_STARTER' THEN 'ESPECIAL'
        WHEN p.tipo_componente IN ('PREGO', 'GRAMPO') THEN 'ESPECIAL'
        WHEN p.tipo_componente IN ('SELANTE', 'FLASH') THEN 'UNITARIO'
        ELSE 'LINEAR'
    END,
    CASE 
        WHEN p.tipo_componente IN ('TELHA', 'OSB', 'SUBCOBERTURA') THEN 'area_telhado'
        WHEN p.tipo_componente IN ('CUMEEIRA', 'VENTILACAO') THEN 'comprimento_cumeeira'
        WHEN p.tipo_componente = 'RUFO_LATERAL' THEN 'comprimento_rufo_lateral'
        WHEN p.tipo_componente = 'RUFO_CAPA' THEN 'comprimento_rufo_capa'
        WHEN p.tipo_componente = 'CALHA' THEN 'comprimento_calha'
        WHEN p.tipo_componente = 'MANTA_STARTER' THEN 'perimetro_telhado'
        WHEN p.tipo_componente IN ('PREGO', 'GRAMPO') THEN 'area_telhado'
        ELSE 'quantidade_pontos'
    END,
    CASE 
        WHEN p.tipo_componente = 'TELHA' THEN 0.3226 -- 1/3.1
        WHEN p.tipo_componente = 'OSB' THEN 1.0
        WHEN p.tipo_componente = 'SUBCOBERTURA' THEN 0.02 -- 1/50
        WHEN p.tipo_componente IN ('CUMEEIRA', 'VENTILACAO') THEN 3.279 -- 1/0.305
        WHEN p.tipo_componente IN ('RUFO_LATERAL', 'RUFO_CAPA', 'CALHA') THEN 0.333 -- 1/3
        WHEN p.tipo_componente = 'MANTA_STARTER' THEN 0.25 -- largura 25cm
        WHEN p.tipo_componente = 'PREGO' THEN 0.008 -- 1 rolo/125m²
        WHEN p.tipo_componente = 'GRAMPO' THEN 0.01 -- 1 pacote/100m²
        ELSE 1.0
    END,
    CASE 
        WHEN p.tipo_componente = 'OSB' THEN 1
        WHEN p.tipo_componente = 'SUBCOBERTURA' THEN 2
        WHEN p.tipo_componente = 'MANTA_STARTER' THEN 3
        WHEN p.tipo_componente IN ('RUFO_LATERAL', 'RUFO_CAPA') THEN 4
        WHEN p.tipo_componente = 'TELHA' THEN 5
        WHEN p.tipo_componente IN ('CUMEEIRA', 'VENTILACAO') THEN 6
        WHEN p.tipo_componente = 'CALHA' THEN 7
        WHEN p.tipo_componente IN ('PREGO', 'GRAMPO') THEN 8
        WHEN p.tipo_componente IN ('SELANTE', 'FLASH') THEN 9
        ELSE 10
    END,
    CASE 
        WHEN p.tipo_componente IN ('SELANTE', 'FLASH', 'CALHA') THEN false
        ELSE true
    END
FROM produtos_shingle_novo p;

-- Function para calcular orçamento completo
CREATE OR REPLACE FUNCTION calcular_orcamento_shingle_completo_v2(
    p_area_telhado DECIMAL,
    p_comprimento_cumeeira DECIMAL DEFAULT 0,
    p_perimetro_telhado DECIMAL DEFAULT 0,
    p_comprimento_calha DECIMAL DEFAULT 0,
    p_telha_codigo TEXT DEFAULT '10420',
    p_cor_acessorios TEXT DEFAULT 'CINZA',
    p_incluir_manta BOOLEAN DEFAULT true,
    p_incluir_calha BOOLEAN DEFAULT true
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
    valor_total DECIMAL,
    categoria TEXT,
    ordem INTEGER
) AS $$
DECLARE
    v_comprimento_rufo_lateral DECIMAL;
    v_comprimento_rufo_capa DECIMAL;
    v_total_metros_lineares DECIMAL;
    v_consumo_pregos DECIMAL;
    v_consumo_grampos DECIMAL;
    v_area_manta DECIMAL;
BEGIN
    -- Calcular dimensões automáticas
    v_comprimento_rufo_lateral := p_perimetro_telhado * 0.6;
    v_comprimento_rufo_capa := p_perimetro_telhado * 0.4;
    v_total_metros_lineares := p_comprimento_cumeeira + p_perimetro_telhado + p_comprimento_calha;
    v_consumo_pregos := (p_area_telhado * 0.15) + (v_total_metros_lineares * 0.1);
    v_consumo_grampos := p_area_telhado * 0.01;
    v_area_manta := p_perimetro_telhado * 0.25;
    
    -- 1. Base Estrutural (OSB) - OBRIGATÓRIO
    RETURN QUERY
    SELECT 
        'OSB'::TEXT,
        p.codigo,
        p.descricao,
        p_area_telhado,
        'm²'::TEXT,
        1.0::DECIMAL,
        p.quebra_padrao,
        p_area_telhado * (1 + p.quebra_padrao / 100),
        CEIL(p_area_telhado * (1 + p.quebra_padrao / 100))::INTEGER,
        p.unidade_medida,
        p.preco_unitario,
        CEIL(p_area_telhado * (1 + p.quebra_padrao / 100)) * p.preco_unitario,
        'Base Estrutural'::TEXT,
        1::INTEGER
    FROM produtos_shingle_novo p
    WHERE p.tipo_componente = 'OSB' AND p.ativo = true
    LIMIT 1;
    
    -- 2. Subcobertura - OBRIGATÓRIO
    RETURN QUERY
    SELECT 
        'SUBCOBERTURA'::TEXT,
        p.codigo,
        p.descricao,
        p_area_telhado,
        'm²'::TEXT,
        (1.0 / p.conteudo_unidade),
        p.quebra_padrao,
        p_area_telhado * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100),
        CEIL(p_area_telhado * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100))::INTEGER,
        p.unidade_medida,
        p.preco_unitario,
        CEIL(p_area_telhado * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100)) * p.preco_unitario,
        'Impermeabilização'::TEXT,
        2::INTEGER
    FROM produtos_shingle_novo p
    WHERE p.tipo_componente = 'SUBCOBERTURA' AND p.ativo = true
    LIMIT 1;
    
    -- 3. Manta Starter
    IF p_incluir_manta AND p_perimetro_telhado > 0 THEN
        RETURN QUERY
        SELECT 
            'MANTA_STARTER'::TEXT,
            p.codigo,
            p.descricao,
            v_area_manta,
            'm²'::TEXT,
            1.0::DECIMAL,
            p.quebra_padrao,
            v_area_manta * (1 + p.quebra_padrao / 100),
            CEIL(v_area_manta * (1 + p.quebra_padrao / 100))::INTEGER,
            p.unidade_medida,
            p.preco_unitario,
            CEIL(v_area_manta * (1 + p.quebra_padrao / 100)) * p.preco_unitario,
            'Impermeabilização'::TEXT,
            3::INTEGER
        FROM produtos_shingle_novo p
        WHERE p.tipo_componente = 'MANTA_STARTER' AND p.ativo = true
        LIMIT 1;
    END IF;
    
    -- 4. Telhas
    IF p_area_telhado > 0 THEN
        RETURN QUERY
        SELECT 
            'TELHA'::TEXT,
            p.codigo,
            p.descricao,
            p_area_telhado,
            'm²'::TEXT,
            (1.0 / p.conteudo_unidade),
            p.quebra_padrao,
            p_area_telhado * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100),
            CEIL(p_area_telhado * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100))::INTEGER,
            p.unidade_medida,
            p.preco_unitario,
            CEIL(p_area_telhado * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100)) * p.preco_unitario,
            'Cobertura'::TEXT,
            5::INTEGER
        FROM produtos_shingle_novo p
        WHERE p.codigo = p_telha_codigo AND p.ativo = true
        LIMIT 1;
    END IF;
    
    -- 5. Cumeeiras
    IF p_comprimento_cumeeira > 0 THEN
        RETURN QUERY
        SELECT 
            'CUMEEIRA'::TEXT,
            p.codigo,
            p.descricao,
            p_comprimento_cumeeira,
            'm'::TEXT,
            (1.0 / p.conteudo_unidade),
            p.quebra_padrao,
            p_comprimento_cumeeira * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100),
            CEIL(p_comprimento_cumeeira * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100))::INTEGER,
            p.unidade_medida,
            p.preco_unitario,
            CEIL(p_comprimento_cumeeira * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100)) * p.preco_unitario,
            'Acabamento'::TEXT,
            6::INTEGER
        FROM produtos_shingle_novo p
        WHERE p.tipo_componente = 'CUMEEIRA' 
        AND (p.cor = p_cor_acessorios OR p_cor IS NULL)
        AND p.ativo = true
        LIMIT 1;
    END IF;
    
    -- 6. Rufos
    IF v_comprimento_rufo_lateral > 0 THEN
        RETURN QUERY
        SELECT 
            'RUFO_LATERAL'::TEXT,
            p.codigo,
            p.descricao,
            v_comprimento_rufo_lateral,
            'm'::TEXT,
            (1.0 / p.conteudo_unidade),
            p.quebra_padrao,
            v_comprimento_rufo_lateral * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100),
            CEIL(v_comprimento_rufo_lateral * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100))::INTEGER,
            p.unidade_medida,
            p.preco_unitario,
            CEIL(v_comprimento_rufo_lateral * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100)) * p.preco_unitario,
            'Acabamento'::TEXT,
            7::INTEGER
        FROM produtos_shingle_novo p
        WHERE p.tipo_componente = 'RUFO_LATERAL' AND p.ativo = true
        LIMIT 1;
    END IF;
    
    IF v_comprimento_rufo_capa > 0 THEN
        RETURN QUERY
        SELECT 
            'RUFO_CAPA'::TEXT,
            p.codigo,
            p.descricao,
            v_comprimento_rufo_capa,
            'm'::TEXT,
            (1.0 / p.conteudo_unidade),
            p.quebra_padrao,
            v_comprimento_rufo_capa * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100),
            CEIL(v_comprimento_rufo_capa * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100))::INTEGER,
            p.unidade_medida,
            p.preco_unitario,
            CEIL(v_comprimento_rufo_capa * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100)) * p.preco_unitario,
            'Acabamento'::TEXT,
            8::INTEGER
        FROM produtos_shingle_novo p
        WHERE p.tipo_componente = 'RUFO_CAPA' AND p.ativo = true
        LIMIT 1;
    END IF;
    
    -- 7. Calhas
    IF p_incluir_calha AND p_comprimento_calha > 0 THEN
        RETURN QUERY
        SELECT 
            'CALHA'::TEXT,
            p.codigo,
            p.descricao,
            p_comprimento_calha,
            'm'::TEXT,
            (1.0 / p.conteudo_unidade),
            p.quebra_padrao,
            p_comprimento_calha * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100),
            CEIL(p_comprimento_calha * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100))::INTEGER,
            p.unidade_medida,
            p.preco_unitario,
            CEIL(p_comprimento_calha * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100)) * p.preco_unitario,
            'Sistema de Águas'::TEXT,
            9::INTEGER
        FROM produtos_shingle_novo p
        WHERE p.tipo_componente = 'CALHA' AND p.ativo = true
        LIMIT 1;
    END IF;
    
    -- 8. Fixação - Pregos
    RETURN QUERY
    SELECT 
        'PREGO'::TEXT,
        p.codigo,
        p.descricao,
        v_consumo_pregos,
        'kg'::TEXT,
        1.0::DECIMAL,
        p.quebra_padrao,
        v_consumo_pregos * (1 + p.quebra_padrao / 100),
        CEIL(v_consumo_pregos * (1 + p.quebra_padrao / 100) / p.conteudo_unidade)::INTEGER,
        p.unidade_medida,
        p.preco_unitario,
        CEIL(v_consumo_pregos * (1 + p.quebra_padrao / 100) / p.conteudo_unidade) * p.preco_unitario,
        'Fixação'::TEXT,
        10::INTEGER
    FROM produtos_shingle_novo p
    WHERE p.tipo_componente = 'PREGO' AND p.ativo = true
    LIMIT 1;
    
    -- 9. Fixação - Grampos
    RETURN QUERY
    SELECT 
        'GRAMPO'::TEXT,
        p.codigo,
        p.descricao,
        v_consumo_grampos,
        'kg'::TEXT,
        1.0::DECIMAL,
        p.quebra_padrao,
        v_consumo_grampos * (1 + p.quebra_padrao / 100),
        CEIL(v_consumo_grampos * (1 + p.quebra_padrao / 100) / p.conteudo_unidade)::INTEGER,
        p.unidade_medida,
        p.preco_unitario,
        CEIL(v_consumo_grampos * (1 + p.quebra_padrao / 100) / p.conteudo_unidade) * p.preco_unitario,
        'Fixação'::TEXT,
        11::INTEGER
    FROM produtos_shingle_novo p
    WHERE p.tipo_componente = 'GRAMPO' AND p.ativo = true
    LIMIT 1;
    
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_produtos_shingle()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_produtos_shingle_updated_at
    BEFORE UPDATE ON produtos_shingle_novo
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_produtos_shingle();

-- Habilitar RLS
ALTER TABLE produtos_shingle_novo ENABLE ROW LEVEL SECURITY;
ALTER TABLE composicoes_shingle ENABLE ROW LEVEL SECURITY;

-- Políticas RLS temporárias (acesso público)
CREATE POLICY "Produtos shingle públicos" ON produtos_shingle_novo FOR ALL USING (true);
CREATE POLICY "Composições shingle públicas" ON composicoes_shingle FOR ALL USING (true);