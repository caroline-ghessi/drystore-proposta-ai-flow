-- Criar tabelas para sistema de drywall
CREATE TABLE produtos_drywall (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    categoria TEXT CHECK (categoria IN (
        'PLACA', 'PERFIL', 'ISOLAMENTO', 'ACESSORIO', 'ACABAMENTO'
    )) NOT NULL,
    codigo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    tipo_placa TEXT CHECK (tipo_placa IN ('ST', 'RU', 'RF', 'GLASROC')),
    espessura DECIMAL(5,1), -- em mm
    unidade_medida TEXT NOT NULL,
    preco_unitario DECIMAL(15,2),
    peso_unitario DECIMAL(10,2), -- kg/unidade
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_produtos_drywall_categoria ON produtos_drywall(categoria);
CREATE INDEX idx_produtos_drywall_codigo ON produtos_drywall(codigo);
CREATE INDEX idx_produtos_drywall_ativo ON produtos_drywall(ativo);

-- Inserir produtos baseados na documentação
INSERT INTO produtos_drywall (categoria, codigo, descricao, tipo_placa, espessura, unidade_medida, preco_unitario) VALUES
-- Placas
('PLACA', '1.10', 'Gesso ST', 'ST', 12.5, 'm²', 29.87),
('PLACA', '1.11', 'Gesso RF', 'RF', 12.5, 'm²', 28.78),
('PLACA', '1.14', 'Gesso RU', 'RU', 12.5, 'm²', 38.98),
('PLACA', '1.28', 'Forro Glasroc X', 'GLASROC', 12.5, 'm²', 156.12),
('PLACA', '1.29', 'Revestimento Glasroc X', 'GLASROC', 12.5, 'm²', 159.27),
-- Isolamento
('ISOLAMENTO', '1.12', 'Lã de vidro 100MM', NULL, 100, 'm²', 25.89),
('ISOLAMENTO', '1.13', 'Lã de vidro 70MM', NULL, 70, 'm²', 18.82),
('ISOLAMENTO', '1.27', 'Lã de vidro 50MM', NULL, 50, 'm²', 14.90),
-- Perfis
('PERFIL', 'M48', 'Montante 48mm', NULL, 48, 'm', 8.50),
('PERFIL', 'G48', 'Guia 48mm', NULL, 48, 'm', 7.20),
('PERFIL', 'M70', 'Montante 70mm', NULL, 70, 'm', 10.80),
('PERFIL', 'G70', 'Guia 70mm', NULL, 70, 'm', 9.40),
('PERFIL', 'M90', 'Montante 90mm', NULL, 90, 'm', 13.20),
('PERFIL', 'G90', 'Guia 90mm', NULL, 90, 'm', 11.50),
-- Acessórios
('ACESSORIO', 'PF25', 'Parafuso 25mm', NULL, 25, 'cto', 28.00),
('ACESSORIO', 'PF35', 'Parafuso 35mm', NULL, 35, 'cto', 32.00),
('ACESSORIO', 'PM13', 'Parafuso metal 13mm', NULL, 13, 'cto', 25.00),
-- Acabamento
('ACABAMENTO', 'FP50', 'Fita papel 50mm', NULL, 50, 'rl', 12.00),
('ACABAMENTO', 'MJ', 'Massa para juntas', NULL, NULL, 'kg', 2.80),
('ACABAMENTO', 'CR', 'Cantoneira reforçada', NULL, NULL, 'br', 8.50);

-- Tabela de composições de parede
CREATE TABLE composicoes_drywall (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    tipo_parede TEXT CHECK (tipo_parede IN (
        'SIMPLES', 'DUPLA', 'ACUSTICA', 'CORTA_FOGO'
    )) NOT NULL,
    espessura_total INTEGER, -- em mm
    produto_id UUID REFERENCES produtos_drywall(id),
    categoria_componente TEXT,
    consumo_por_m2 DECIMAL(10,4),
    quebra_padrao DECIMAL(5,2),
    ordem_montagem INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir composição padrão: Parede Simples ST 73mm
DO $$
DECLARE
    v_placa_st_id UUID;
    v_montante_48_id UUID;
    v_guia_48_id UUID;
    v_la_50_id UUID;
    v_parafuso_25_id UUID;
    v_parafuso_metal_id UUID;
    v_fita_id UUID;
    v_massa_id UUID;
BEGIN
    -- Buscar IDs dos produtos
    SELECT id INTO v_placa_st_id FROM produtos_drywall WHERE codigo = '1.10';
    SELECT id INTO v_montante_48_id FROM produtos_drywall WHERE codigo = 'M48';
    SELECT id INTO v_guia_48_id FROM produtos_drywall WHERE codigo = 'G48';
    SELECT id INTO v_la_50_id FROM produtos_drywall WHERE codigo = '1.27';
    SELECT id INTO v_parafuso_25_id FROM produtos_drywall WHERE codigo = 'PF25';
    SELECT id INTO v_parafuso_metal_id FROM produtos_drywall WHERE codigo = 'PM13';
    SELECT id INTO v_fita_id FROM produtos_drywall WHERE codigo = 'FP50';
    SELECT id INTO v_massa_id FROM produtos_drywall WHERE codigo = 'MJ';

    -- Inserir composição
    INSERT INTO composicoes_drywall (nome, tipo_parede, espessura_total, produto_id, categoria_componente, consumo_por_m2, quebra_padrao, ordem_montagem) VALUES
    ('Parede Simples ST 73mm', 'SIMPLES', 73, v_placa_st_id, 'PLACA', 2.00, 5, 4),
    ('Parede Simples ST 73mm', 'SIMPLES', 73, v_montante_48_id, 'PERFIL', 2.50, 5, 2),
    ('Parede Simples ST 73mm', 'SIMPLES', 73, v_guia_48_id, 'PERFIL', 0.70, 5, 1),
    ('Parede Simples ST 73mm', 'SIMPLES', 73, v_la_50_id, 'ISOLAMENTO', 1.00, 10, 3),
    ('Parede Simples ST 73mm', 'SIMPLES', 73, v_parafuso_25_id, 'ACESSORIO', 0.24, 5, 5),
    ('Parede Simples ST 73mm', 'SIMPLES', 73, v_parafuso_metal_id, 'ACESSORIO', 0.08, 5, 6),
    ('Parede Simples ST 73mm', 'SIMPLES', 73, v_fita_id, 'ACABAMENTO', 0.032, 10, 7),
    ('Parede Simples ST 73mm', 'SIMPLES', 73, v_massa_id, 'ACABAMENTO', 0.45, 10, 8);
END $$;

-- Tabela de orçamentos
CREATE TABLE orcamentos_drywall (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    proposta_id UUID REFERENCES propostas(id),
    
    -- Configurações da parede
    area_parede DECIMAL(15,2) NOT NULL,
    tipo_parede TEXT NOT NULL,
    composicao_nome TEXT NOT NULL,
    pe_direito DECIMAL(5,2) DEFAULT 2.80,
    comprimento_linear DECIMAL(15,2),
    
    -- Opções adicionais
    incluir_porta BOOLEAN DEFAULT false,
    quantidade_portas INTEGER DEFAULT 0,
    incluir_tomadas BOOLEAN DEFAULT true,
    quantidade_tomadas INTEGER DEFAULT 0,
    
    -- Quebras personalizadas
    quebra_placa DECIMAL(5,2),
    quebra_perfil DECIMAL(5,2),
    quebra_isolamento DECIMAL(5,2),
    
    -- Valores calculados
    valor_total DECIMAL(15,2),
    valor_por_m2 DECIMAL(15,2),
    peso_total_kg DECIMAL(15,2),
    
    -- Status
    status TEXT DEFAULT 'rascunho',
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens calculados
CREATE TABLE itens_calculo_drywall (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    orcamento_id UUID REFERENCES orcamentos_drywall(id),
    produto_id UUID REFERENCES produtos_drywall(id),
    categoria TEXT NOT NULL,
    descricao TEXT NOT NULL,
    consumo_base DECIMAL(15,4),
    quebra_percentual DECIMAL(5,2),
    consumo_com_quebra DECIMAL(15,4),
    quantidade_final DECIMAL(15,2),
    unidade TEXT NOT NULL,
    preco_unitario DECIMAL(15,2),
    valor_total DECIMAL(15,2),
    ordem INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function para calcular orçamento
CREATE OR REPLACE FUNCTION calcular_orcamento_drywall(
    p_area_parede DECIMAL,
    p_composicao_nome TEXT,
    p_pe_direito DECIMAL DEFAULT 2.80,
    p_incluir_porta BOOLEAN DEFAULT false,
    p_quantidade_portas INTEGER DEFAULT 0
)
RETURNS TABLE (
    categoria TEXT,
    descricao TEXT,
    consumo_base DECIMAL,
    quebra_percentual DECIMAL,
    consumo_com_quebra DECIMAL,
    unidade TEXT,
    quantidade_final DECIMAL,
    preco_unitario DECIMAL,
    valor_total DECIMAL,
    ordem INTEGER
) AS $$
DECLARE
    v_area_liquida DECIMAL;
BEGIN
    -- Ajustar área se houver portas (área média porta = 2.1m²)
    v_area_liquida := p_area_parede;
    IF p_incluir_porta THEN
        v_area_liquida := v_area_liquida - (p_quantidade_portas * 2.1);
    END IF;
    
    RETURN QUERY
    SELECT 
        pd.categoria,
        pd.descricao,
        cd.consumo_por_m2 * v_area_liquida as consumo_base,
        cd.quebra_padrao,
        cd.consumo_por_m2 * v_area_liquida * (1 + cd.quebra_padrao / 100) as consumo_com_quebra,
        pd.unidade_medida,
        CASE 
            WHEN pd.unidade_medida = 'cto' THEN 
                CEIL((cd.consumo_por_m2 * v_area_liquida * (1 + cd.quebra_padrao / 100)) / 100) * 100
            WHEN pd.unidade_medida = 'rl' THEN
                CEIL((cd.consumo_por_m2 * v_area_liquida * (1 + cd.quebra_padrao / 100)) / 100) * 100
            ELSE
                CEIL(cd.consumo_por_m2 * v_area_liquida * (1 + cd.quebra_padrao / 100))
        END as quantidade_final,
        pd.preco_unitario,
        CASE 
            WHEN pd.unidade_medida = 'cto' THEN 
                CEIL((cd.consumo_por_m2 * v_area_liquida * (1 + cd.quebra_padrao / 100)) / 100) * pd.preco_unitario
            WHEN pd.unidade_medida = 'rl' THEN
                CEIL((cd.consumo_por_m2 * v_area_liquida * (1 + cd.quebra_padrao / 100)) / 100) * pd.preco_unitario
            ELSE
                CEIL(cd.consumo_por_m2 * v_area_liquida * (1 + cd.quebra_padrao / 100)) * pd.preco_unitario
        END as valor_total,
        cd.ordem_montagem
    FROM composicoes_drywall cd
    JOIN produtos_drywall pd ON cd.produto_id = pd.id
    WHERE cd.nome = p_composicao_nome
    ORDER BY cd.ordem_montagem;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column_drywall()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_produtos_drywall_updated_at BEFORE UPDATE ON produtos_drywall FOR EACH ROW EXECUTE FUNCTION update_updated_at_column_drywall();
CREATE TRIGGER update_orcamentos_drywall_updated_at BEFORE UPDATE ON orcamentos_drywall FOR EACH ROW EXECUTE FUNCTION update_updated_at_column_drywall();

-- RLS Policies (públicas temporariamente)
ALTER TABLE produtos_drywall ENABLE ROW LEVEL SECURITY;
ALTER TABLE composicoes_drywall ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos_drywall ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_calculo_drywall ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Produtos drywall públicos" ON produtos_drywall FOR ALL USING (true);
CREATE POLICY "Composições drywall públicas" ON composicoes_drywall FOR ALL USING (true);
CREATE POLICY "Orçamentos drywall públicos" ON orcamentos_drywall FOR ALL USING (true);
CREATE POLICY "Itens cálculo drywall públicos" ON itens_calculo_drywall FOR ALL USING (true);