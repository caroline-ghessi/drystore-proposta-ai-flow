-- Atualizar CHECK constraint para incluir PERFORMA
ALTER TABLE produtos_drywall DROP CONSTRAINT IF EXISTS produtos_drywall_tipo_placa_check;
ALTER TABLE produtos_drywall ADD CONSTRAINT produtos_drywall_tipo_placa_check 
CHECK (tipo_placa IN ('ST', 'RU', 'RF', 'PERFORMA', 'GLASROC'));

-- Inserir produtos faltantes
INSERT INTO produtos_drywall (categoria, codigo, descricao, tipo_placa, espessura, unidade_medida, preco_unitario) VALUES
-- Placa Performa (alta performance acústica)
('PLACA', '1.30', 'Performa', 'PERFORMA', 12.5, 'm²', 39.02),
-- Revestimento Glasroc X - Base
('PLACA', '1.33', 'Revestimento Glasroc X - Base', 'GLASROC', 12.5, 'm²', 127.66);

-- Inserir nova composição: Parede Performa Acústica 95mm
DO $$
DECLARE
    v_placa_performa_id UUID;
    v_montante_70_id UUID;
    v_guia_70_id UUID;
    v_la_70_id UUID;
    v_parafuso_35_id UUID;
    v_parafuso_metal_id UUID;
    v_fita_id UUID;
    v_massa_id UUID;
BEGIN
    -- Buscar IDs dos produtos
    SELECT id INTO v_placa_performa_id FROM produtos_drywall WHERE codigo = '1.30';
    SELECT id INTO v_montante_70_id FROM produtos_drywall WHERE codigo = 'M70';
    SELECT id INTO v_guia_70_id FROM produtos_drywall WHERE codigo = 'G70';
    SELECT id INTO v_la_70_id FROM produtos_drywall WHERE codigo = '1.13';
    SELECT id INTO v_parafuso_35_id FROM produtos_drywall WHERE codigo = 'PF35';
    SELECT id INTO v_parafuso_metal_id FROM produtos_drywall WHERE codigo = 'PM13';
    SELECT id INTO v_fita_id FROM produtos_drywall WHERE codigo = 'FP50';
    SELECT id INTO v_massa_id FROM produtos_drywall WHERE codigo = 'MJ';

    -- Inserir composição Parede Performa Acústica 95mm
    INSERT INTO composicoes_drywall (nome, tipo_parede, espessura_total, produto_id, categoria_componente, consumo_por_m2, quebra_padrao, ordem_montagem) VALUES
    ('Parede Performa Acústica 95mm', 'ACUSTICA', 95, v_placa_performa_id, 'PLACA', 2.00, 5, 4),
    ('Parede Performa Acústica 95mm', 'ACUSTICA', 95, v_montante_70_id, 'PERFIL', 2.50, 5, 2),
    ('Parede Performa Acústica 95mm', 'ACUSTICA', 95, v_guia_70_id, 'PERFIL', 0.70, 5, 1),
    ('Parede Performa Acústica 95mm', 'ACUSTICA', 95, v_la_70_id, 'ISOLAMENTO', 1.00, 10, 3),
    ('Parede Performa Acústica 95mm', 'ACUSTICA', 95, v_parafuso_35_id, 'ACESSORIO', 0.24, 5, 5),
    ('Parede Performa Acústica 95mm', 'ACUSTICA', 95, v_parafuso_metal_id, 'ACESSORIO', 0.08, 5, 6),
    ('Parede Performa Acústica 95mm', 'ACUSTICA', 95, v_fita_id, 'ACABAMENTO', 0.032, 10, 7),
    ('Parede Performa Acústica 95mm', 'ACUSTICA', 95, v_massa_id, 'ACABAMENTO', 0.45, 10, 8);
END $$;