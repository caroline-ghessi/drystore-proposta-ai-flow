-- Inserir itens de composição para Sistema Telha Shingle Supreme
WITH supreme_composicao AS (
  SELECT id FROM composicoes_mestre WHERE codigo = 'SHINGLE_SUPREME' LIMIT 1
),
oakridge_composicao AS (
  SELECT id FROM composicoes_mestre WHERE codigo = 'SHINGLE_OAKRIDGE' LIMIT 1
)

-- Itens para Sistema Supreme
INSERT INTO itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, ordem, valor_unitario, valor_por_m2)
SELECT 
  sc.id,
  pm.id,
  CASE 
    WHEN pm.codigo = '969' THEN 1.0  -- OSB 11mm: 1m²/m²
    WHEN pm.codigo = '7427' THEN 1.0 -- Subcobertura: 1m²/m²
    WHEN pm.codigo = '10420' THEN 0.323 -- Telha Supreme: ~3.1m²/pacote
    WHEN pm.codigo = '969001' THEN 0.8 -- Cumeeira: 0.8m/m²
    WHEN pm.codigo = '8938001' THEN 0.15 -- Pregos: 0.15kg/m²
  END as consumo_por_m2,
  CASE 
    WHEN pm.codigo = '969' THEN 5.0  -- OSB: 5% quebra
    WHEN pm.codigo = '7427' THEN 10.0 -- Subcobertura: 10% quebra
    WHEN pm.codigo = '10420' THEN 8.0 -- Telha: 8% quebra
    WHEN pm.codigo = '969001' THEN 10.0 -- Cumeeira: 10% quebra
    WHEN pm.codigo = '8938001' THEN 5.0 -- Pregos: 5% quebra
  END as quebra_aplicada,
  1.0 as fator_correcao,
  CASE 
    WHEN pm.codigo = '969' THEN 1    -- OSB primeiro
    WHEN pm.codigo = '7427' THEN 2   -- Subcobertura segundo
    WHEN pm.codigo = '10420' THEN 3  -- Telha terceiro
    WHEN pm.codigo = '969001' THEN 4 -- Cumeeira quarto
    WHEN pm.codigo = '8938001' THEN 5 -- Pregos quinto
  END as ordem,
  pm.preco_unitario,
  pm.preco_unitario * CASE 
    WHEN pm.codigo = '969' THEN 1.0 * 1.05
    WHEN pm.codigo = '7427' THEN 1.0 * 1.10
    WHEN pm.codigo = '10420' THEN 0.323 * 1.08
    WHEN pm.codigo = '969001' THEN 0.8 * 1.10
    WHEN pm.codigo = '8938001' THEN 0.15 * 1.05
  END as valor_por_m2
FROM supreme_composicao sc, produtos_mestre pm
WHERE pm.codigo IN ('969', '7427', '10420', '969001', '8938001')
AND pm.ativo = true

UNION ALL

-- Itens para Sistema Oakridge
SELECT 
  oc.id,
  pm.id,
  CASE 
    WHEN pm.codigo = '969' THEN 1.0  -- OSB 11mm: 1m²/m²
    WHEN pm.codigo = '7427' THEN 1.0 -- Subcobertura: 1m²/m²
    WHEN pm.codigo = '8938' THEN 0.323 -- Telha Oakridge: ~3.1m²/pacote
    WHEN pm.codigo = '969001' THEN 0.8 -- Cumeeira: 0.8m/m²
    WHEN pm.codigo = '8938001' THEN 0.15 -- Pregos: 0.15kg/m²
  END as consumo_por_m2,
  CASE 
    WHEN pm.codigo = '969' THEN 5.0  -- OSB: 5% quebra
    WHEN pm.codigo = '7427' THEN 10.0 -- Subcobertura: 10% quebra
    WHEN pm.codigo = '8938' THEN 8.0 -- Telha: 8% quebra
    WHEN pm.codigo = '969001' THEN 10.0 -- Cumeeira: 10% quebra
    WHEN pm.codigo = '8938001' THEN 5.0 -- Pregos: 5% quebra
  END as quebra_aplicada,
  1.0 as fator_correcao,
  CASE 
    WHEN pm.codigo = '969' THEN 1    -- OSB primeiro
    WHEN pm.codigo = '7427' THEN 2   -- Subcobertura segundo
    WHEN pm.codigo = '8938' THEN 3   -- Telha terceiro
    WHEN pm.codigo = '969001' THEN 4 -- Cumeeira quarto
    WHEN pm.codigo = '8938001' THEN 5 -- Pregos quinto
  END as ordem,
  pm.preco_unitario,
  pm.preco_unitario * CASE 
    WHEN pm.codigo = '969' THEN 1.0 * 1.05
    WHEN pm.codigo = '7427' THEN 1.0 * 1.10
    WHEN pm.codigo = '8938' THEN 0.323 * 1.08
    WHEN pm.codigo = '969001' THEN 0.8 * 1.10
    WHEN pm.codigo = '8938001' THEN 0.15 * 1.05
  END as valor_por_m2
FROM oakridge_composicao oc, produtos_mestre pm
WHERE pm.codigo IN ('969', '7427', '8938', '969001', '8938001')
AND pm.ativo = true;

-- Recalcular valores totais das composições
UPDATE composicoes_mestre 
SET valor_total_m2 = (
  SELECT COALESCE(SUM(valor_por_m2), 0)
  FROM itens_composicao 
  WHERE composicao_id = composicoes_mestre.id
),
updated_at = NOW()
WHERE codigo IN ('SHINGLE_SUPREME', 'SHINGLE_OAKRIDGE');