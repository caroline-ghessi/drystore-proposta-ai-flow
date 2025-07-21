
-- Corrigir especificamente o item STARTER na composição Telhas Shingle Supreme
-- que foi adicionado após a migração anterior e tem valores incorretos

UPDATE itens_composicao 
SET 
    consumo_por_m2 = 1.0,
    valor_unitario = 82.66,
    valor_por_m2 = 82.66,
    quebra_aplicada = 0.0,
    tipo_calculo = 'direto',
    formula_customizada = NULL,
    observacoes_calculo = 'Equivale a 7,4ml de starter por m² (1 pacote = 23ml) - Corrigido para valor unitário correto'
WHERE id = 'c27372b2-d1d5-4673-b799-955f012ea16f';

-- Recalcular especificamente a composição Telhas Shingle Supreme
UPDATE composicoes_mestre 
SET 
    valor_total_m2 = (
        SELECT COALESCE(SUM(valor_por_m2), 0)
        FROM itens_composicao 
        WHERE composicao_id = composicoes_mestre.id
    ),
    updated_at = NOW()
WHERE codigo = '1.16' AND nome ILIKE '%supreme%';

-- Verificar se existem outros itens similares que precisam de correção
-- (para casos onde o produto foi adicionado após nossa migração anterior)
UPDATE itens_composicao 
SET 
    consumo_por_m2 = 1.0,
    valor_unitario = 82.66,
    valor_por_m2 = 82.66,
    quebra_aplicada = 0.0,
    tipo_calculo = 'direto',
    formula_customizada = NULL,
    observacoes_calculo = 'Equivale a 7,4ml de starter por m² (1 pacote = 23ml) - Corrigido automaticamente'
WHERE produto_id = (
    SELECT id FROM produtos_mestre WHERE codigo = '10471'
)
AND (valor_por_m2 < 50.0 OR valor_unitario < 50.0)  -- Identificar valores incorretos
AND id != 'c27372b2-d1d5-4673-b799-955f012ea16f';   -- Evitar duplicar a correção acima

-- Recalcular todas as composições afetadas por essas correções
UPDATE composicoes_mestre 
SET 
    valor_total_m2 = (
        SELECT COALESCE(SUM(valor_por_m2), 0)
        FROM itens_composicao 
        WHERE composicao_id = composicoes_mestre.id
    ),
    updated_at = NOW()
WHERE id IN (
    SELECT DISTINCT composicao_id 
    FROM itens_composicao ic
    JOIN produtos_mestre pm ON ic.produto_id = pm.id
    WHERE pm.codigo = '10471'
);
