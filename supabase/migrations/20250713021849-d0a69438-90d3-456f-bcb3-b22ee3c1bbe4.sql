-- Inserir composições restantes para drywall
DO $$
DECLARE
    v_placa_ru_id UUID;
    v_placa_rf_id UUID;
    v_montante_70_id UUID;
    v_guia_70_id UUID;
    v_montante_90_id UUID;
    v_guia_90_id UUID;
    v_la_70_id UUID;
    v_la_100_id UUID;
    v_parafuso_25_id UUID;
    v_parafuso_35_id UUID;
    v_parafuso_metal_id UUID;
    v_fita_id UUID;
    v_massa_id UUID;
BEGIN
    -- Buscar IDs dos produtos
    SELECT id INTO v_placa_ru_id FROM produtos_drywall WHERE codigo = '1.14';
    SELECT id INTO v_placa_rf_id FROM produtos_drywall WHERE codigo = '1.11';
    SELECT id INTO v_montante_70_id FROM produtos_drywall WHERE codigo = 'M70';
    SELECT id INTO v_guia_70_id FROM produtos_drywall WHERE codigo = 'G70';
    SELECT id INTO v_montante_90_id FROM produtos_drywall WHERE codigo = 'M90';
    SELECT id INTO v_guia_90_id FROM produtos_drywall WHERE codigo = 'G90';
    SELECT id INTO v_la_70_id FROM produtos_drywall WHERE codigo = '1.13';
    SELECT id INTO v_la_100_id FROM produtos_drywall WHERE codigo = '1.12';
    SELECT id INTO v_parafuso_25_id FROM produtos_drywall WHERE codigo = 'PF25';
    SELECT id INTO v_parafuso_35_id FROM produtos_drywall WHERE codigo = 'PF35';
    SELECT id INTO v_parafuso_metal_id FROM produtos_drywall WHERE codigo = 'PM13';
    SELECT id INTO v_fita_id FROM produtos_drywall WHERE codigo = 'FP50';
    SELECT id INTO v_massa_id FROM produtos_drywall WHERE codigo = 'MJ';

    -- Parede Simples RU 73mm
    INSERT INTO composicoes_drywall (nome, tipo_parede, espessura_total, produto_id, categoria_componente, consumo_por_m2, quebra_padrao, ordem_montagem) VALUES
    ('Parede Simples RU 73mm', 'SIMPLES', 73, v_placa_ru_id, 'PLACA', 2.00, 5, 4),
    ('Parede Simples RU 73mm', 'SIMPLES', 73, v_montante_70_id, 'PERFIL', 2.50, 5, 2),
    ('Parede Simples RU 73mm', 'SIMPLES', 73, v_guia_70_id, 'PERFIL', 0.70, 5, 1),
    ('Parede Simples RU 73mm', 'SIMPLES', 73, v_la_70_id, 'ISOLAMENTO', 1.00, 10, 3),
    ('Parede Simples RU 73mm', 'SIMPLES', 73, v_parafuso_25_id, 'ACESSORIO', 0.24, 5, 5),
    ('Parede Simples RU 73mm', 'SIMPLES', 73, v_parafuso_metal_id, 'ACESSORIO', 0.08, 5, 6),
    ('Parede Simples RU 73mm', 'SIMPLES', 73, v_fita_id, 'ACABAMENTO', 0.032, 10, 7),
    ('Parede Simples RU 73mm', 'SIMPLES', 73, v_massa_id, 'ACABAMENTO', 0.45, 10, 8);

    -- Parede Dupla ST 98mm
    INSERT INTO composicoes_drywall (nome, tipo_parede, espessura_total, produto_id, categoria_componente, consumo_por_m2, quebra_padrao, ordem_montagem) VALUES
    ('Parede Dupla ST 98mm', 'DUPLA', 98, (SELECT id FROM produtos_drywall WHERE codigo = '1.10'), 'PLACA', 4.00, 5, 4), -- 4 placas (2 de cada lado)
    ('Parede Dupla ST 98mm', 'DUPLA', 98, v_montante_70_id, 'PERFIL', 2.50, 5, 2),
    ('Parede Dupla ST 98mm', 'DUPLA', 98, v_guia_70_id, 'PERFIL', 0.70, 5, 1),
    ('Parede Dupla ST 98mm', 'DUPLA', 98, v_la_70_id, 'ISOLAMENTO', 1.00, 10, 3),
    ('Parede Dupla ST 98mm', 'DUPLA', 98, v_parafuso_35_id, 'ACESSORIO', 0.48, 5, 5), -- Mais parafusos para dupla
    ('Parede Dupla ST 98mm', 'DUPLA', 98, v_parafuso_metal_id, 'ACESSORIO', 0.08, 5, 6),
    ('Parede Dupla ST 98mm', 'DUPLA', 98, v_fita_id, 'ACABAMENTO', 0.064, 10, 7), -- Mais fita
    ('Parede Dupla ST 98mm', 'DUPLA', 98, v_massa_id, 'ACABAMENTO', 0.90, 10, 8); -- Mais massa

    -- Parede Acústica 120mm
    INSERT INTO composicoes_drywall (nome, tipo_parede, espessura_total, produto_id, categoria_componente, consumo_por_m2, quebra_padrao, ordem_montagem) VALUES
    ('Parede Acústica 120mm', 'ACUSTICA', 120, (SELECT id FROM produtos_drywall WHERE codigo = '1.10'), 'PLACA', 4.00, 5, 4),
    ('Parede Acústica 120mm', 'ACUSTICA', 120, v_montante_90_id, 'PERFIL', 2.50, 5, 2),
    ('Parede Acústica 120mm', 'ACUSTICA', 120, v_guia_90_id, 'PERFIL', 0.70, 5, 1),
    ('Parede Acústica 120mm', 'ACUSTICA', 120, v_la_100_id, 'ISOLAMENTO', 1.00, 10, 3),
    ('Parede Acústica 120mm', 'ACUSTICA', 120, v_parafuso_35_id, 'ACESSORIO', 0.48, 5, 5),
    ('Parede Acústica 120mm', 'ACUSTICA', 120, v_parafuso_metal_id, 'ACESSORIO', 0.08, 5, 6),
    ('Parede Acústica 120mm', 'ACUSTICA', 120, v_fita_id, 'ACABAMENTO', 0.064, 10, 7),
    ('Parede Acústica 120mm', 'ACUSTICA', 120, v_massa_id, 'ACABAMENTO', 0.90, 10, 8);

    -- Parede Corta-Fogo RF 98mm
    INSERT INTO composicoes_drywall (nome, tipo_parede, espessura_total, produto_id, categoria_componente, consumo_por_m2, quebra_padrao, ordem_montagem) VALUES
    ('Parede Corta-Fogo RF 98mm', 'CORTA_FOGO', 98, v_placa_rf_id, 'PLACA', 4.00, 5, 4),
    ('Parede Corta-Fogo RF 98mm', 'CORTA_FOGO', 98, v_montante_70_id, 'PERFIL', 2.50, 5, 2),
    ('Parede Corta-Fogo RF 98mm', 'CORTA_FOGO', 98, v_guia_70_id, 'PERFIL', 0.70, 5, 1),
    ('Parede Corta-Fogo RF 98mm', 'CORTA_FOGO', 98, v_la_70_id, 'ISOLAMENTO', 1.00, 10, 3), -- Usar lã de rocha na prática
    ('Parede Corta-Fogo RF 98mm', 'CORTA_FOGO', 98, v_parafuso_35_id, 'ACESSORIO', 0.48, 5, 5),
    ('Parede Corta-Fogo RF 98mm', 'CORTA_FOGO', 98, v_parafuso_metal_id, 'ACESSORIO', 0.08, 5, 6),
    ('Parede Corta-Fogo RF 98mm', 'CORTA_FOGO', 98, v_fita_id, 'ACABAMENTO', 0.064, 10, 7),
    ('Parede Corta-Fogo RF 98mm', 'CORTA_FOGO', 98, v_massa_id, 'ACABAMENTO', 0.90, 10, 8);
END $$;