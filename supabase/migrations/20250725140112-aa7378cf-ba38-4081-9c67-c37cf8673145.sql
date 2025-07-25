-- CORREÇÃO URGENTE: Ajustar consumos incorretos para produtos Shingle

-- 1. STARTER TELHA SHINGLE (10471): O consumo deve ser calculado por perímetro, não por área
-- Ajustar consumo_por_m2 para ser usado corretamente na função calcular_por_mapeamento
UPDATE itens_composicao 
SET consumo_por_m2 = 0.043478, -- 1/23 (rendimento por pacote)
    observacoes_calculo = 'Calculado por perímetro: perímetro ÷ 23 metros por pacote'
WHERE produto_id = (SELECT id FROM produtos_mestre WHERE codigo = '10471');

-- 2. TYVEK PROTEC (11550): Consumo muito alto, ajustar para valor realista
UPDATE itens_composicao 
SET consumo_por_m2 = 0.002, -- ~1 rolo para 500m²
    observacoes_calculo = 'Aproximadamente 1 rolo por 500m² de cobertura'
WHERE produto_id = (SELECT id FROM produtos_mestre WHERE codigo = '11550');

-- 3. PREGO ROLO (11570): Ajustar consumo para valor mais realista
UPDATE itens_composicao 
SET consumo_por_m2 = 0.5, -- 0.5 unidades por m²
    observacoes_calculo = 'Aproximadamente 0.5 pregos por m² de cobertura'
WHERE produto_id = (SELECT id FROM produtos_mestre WHERE codigo = '11570');

-- 4. GRAMPO MAKITA (11580): Ajustar consumo
UPDATE itens_composicao 
SET consumo_por_m2 = 0.01, -- 0.01 unidades por m²
    observacoes_calculo = 'Aproximadamente 0.01 grampos por m² de cobertura'
WHERE produto_id = (SELECT id FROM produtos_mestre WHERE codigo = '11580');

-- Verificar os valores atualizados
SELECT pm.codigo, pm.descricao, ic.consumo_por_m2, ic.observacoes_calculo
FROM itens_composicao ic
JOIN produtos_mestre pm ON ic.produto_id = pm.id
WHERE pm.codigo IN ('10471', '11550', '11570', '11580');