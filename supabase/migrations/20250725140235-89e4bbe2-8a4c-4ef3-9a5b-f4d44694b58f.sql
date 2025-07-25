-- Ajuste final nos consumos ainda altos

-- TYVEK: Reduzir consumo drasticamente (1 rolo deve cobrir muito mais área)
UPDATE itens_composicao 
SET consumo_por_m2 = 0.001, -- 1 rolo para 1000m²
    observacoes_calculo = 'Aproximadamente 1 rolo por 1000m² de cobertura'
WHERE produto_id = (SELECT id FROM produtos_mestre WHERE codigo = '7427');

-- PREGO ROLO: Reduzir consumo 
UPDATE itens_composicao 
SET consumo_por_m2 = 1.0, -- 1 unidade por m²
    observacoes_calculo = 'Aproximadamente 1 prego por m² de cobertura'
WHERE produto_id = (SELECT id FROM produtos_mestre WHERE codigo = '3539');

-- Verificar os novos valores
SELECT pm.codigo, pm.descricao, ic.consumo_por_m2, ic.observacoes_calculo
FROM itens_composicao ic
JOIN produtos_mestre pm ON ic.produto_id = pm.id
WHERE pm.codigo IN ('7427', '3539');