-- Corrigir o consumo por m² do produto OSB (código 969)
-- O produto OSB tem dimensões 1,2m x 2,4m = 2,88 m²
-- Logo, consumo_por_m2 = 1 ÷ 2,88 = 0,347

UPDATE itens_composicao 
SET consumo_por_m2 = 0.347
WHERE produto_id IN (
    SELECT id 
    FROM produtos_mestre 
    WHERE codigo = '969' 
    AND descricao ILIKE '%OSB%'
);

-- Verificar se a atualização foi aplicada
SELECT 
    pm.codigo,
    pm.descricao,
    ic.consumo_por_m2,
    ic.quebra_aplicada,
    cm.nome as composicao
FROM itens_composicao ic
JOIN produtos_mestre pm ON ic.produto_id = pm.id
JOIN composicoes_mestre cm ON ic.composicao_id = cm.id
WHERE pm.codigo = '969';