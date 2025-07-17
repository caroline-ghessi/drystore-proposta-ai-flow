-- Corrigir composições Shingle com códigos e produtos corretos

-- Primeiro, limpar itens existentes se houver
DELETE FROM itens_composicao 
WHERE composicao_id IN (
  SELECT id FROM composicoes_mestre WHERE codigo IN ('1.16', '1.17')
);

-- Inserir itens para Sistema Telha Shingle Supreme (1.16)
INSERT INTO itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, ordem, valor_unitario, valor_por_m2)
VALUES 
-- OSB 11mm
('64449d27-0f91-4851-9db8-9dfe32ddcfb9', 'ddfdcf4b-877a-4306-b62f-b46104fde02f', 1.0, 5.0, 1.0, 1, 221.40, 221.40 * 1.0 * 1.05),
-- Subcobertura TYVEK 
('64449d27-0f91-4851-9db8-9dfe32ddcfb9', '44b38cf3-cfa6-4ea7-9cc7-3d733562b93a', 1.0, 10.0, 1.0, 2, 1533.60, 1533.60 * 1.0 * 1.10),
-- Telha Supreme
('64449d27-0f91-4851-9db8-9dfe32ddcfb9', '1817c91f-2b84-4abb-b0dd-4486fa3f8973', 0.323, 8.0, 1.0, 3, 277.45, 277.45 * 0.323 * 1.08),
-- Cumeeira ventilada 
('64449d27-0f91-4851-9db8-9dfe32ddcfb9', '580cf7a7-9c07-48ba-b118-dbfad131d004', 0.8, 10.0, 1.0, 4, 62.53, 62.53 * 0.8 * 1.10),
-- Prego rolo shingle
('64449d27-0f91-4851-9db8-9dfe32ddcfb9', '331ccfae-b3e8-4dff-bf4a-afb830f0a141', 0.15, 5.0, 1.0, 5, 21.49, 21.49 * 0.15 * 1.05);

-- Inserir itens para Sistema Telha Shingle Oakridge (1.17)
INSERT INTO itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, ordem, valor_unitario, valor_por_m2)
VALUES 
-- OSB 11mm
('03122eb9-e036-4519-8338-da9c31c6cfe7', 'ddfdcf4b-877a-4306-b62f-b46104fde02f', 1.0, 5.0, 1.0, 1, 221.40, 221.40 * 1.0 * 1.05),
-- Subcobertura TYVEK
('03122eb9-e036-4519-8338-da9c31c6cfe7', '44b38cf3-cfa6-4ea7-9cc7-3d733562b93a', 1.0, 10.0, 1.0, 2, 1533.60, 1533.60 * 1.0 * 1.10),
-- Telha Oakridge
('03122eb9-e036-4519-8338-da9c31c6cfe7', '930adcf4-d5fb-48aa-a50c-bc62e97b9ab8', 0.323, 8.0, 1.0, 3, 291.49, 291.49 * 0.323 * 1.08),
-- Cumeeira ventilada
('03122eb9-e036-4519-8338-da9c31c6cfe7', '580cf7a7-9c07-48ba-b118-dbfad131d004', 0.8, 10.0, 1.0, 4, 62.53, 62.53 * 0.8 * 1.10),
-- Prego rolo shingle
('03122eb9-e036-4519-8338-da9c31c6cfe7', '331ccfae-b3e8-4dff-bf4a-afb830f0a141', 0.15, 5.0, 1.0, 5, 21.49, 21.49 * 0.15 * 1.05);

-- Recalcular valores totais das composições
UPDATE composicoes_mestre 
SET valor_total_m2 = (
  SELECT COALESCE(SUM(valor_por_m2), 0)
  FROM itens_composicao 
  WHERE composicao_id = composicoes_mestre.id
),
updated_at = NOW()
WHERE codigo IN ('1.16', '1.17');