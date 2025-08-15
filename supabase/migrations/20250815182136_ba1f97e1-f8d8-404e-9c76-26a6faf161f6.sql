-- Configurar composições de divisórias drywall baseado no guia técnico
-- Inserir itens para composição "Gesso ST" (código: 1.10)
INSERT INTO itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, valor_unitario, valor_por_m2, ordem, tipo_calculo, observacoes_calculo)
SELECT 
    cm.id as composicao_id,
    pdm.id as produto_id,
    CASE 
        WHEN pdm.codigo_funcao = 'DRY-ST-12.5' THEN 1.05 -- 1,05 placas/m² (área × 2 faces ÷ 2,88m² × 1,15)
        WHEN pdm.codigo_funcao = 'GUIA-70' THEN 0.70 -- 0,70 barras/m² ((L×2)÷3×1,05 / área)
        WHEN pdm.codigo_funcao = 'MONT-70' THEN 0.93 -- 0,93 barras/m² (espaçamento 0,60m)
        WHEN pdm.codigo_funcao = 'PAR-13MM' THEN 6.00 -- 6 un/m² (6 por montante)
        WHEN pdm.codigo_funcao = 'PAR-25MM' THEN 3.67 -- 3,67 un/m² (área÷0,30×1,10)
        WHEN pdm.codigo_funcao = 'BUCHA-S6' THEN 0.33 -- 0,33 un/m² ((L÷0,60)×2 / área)
        WHEN pdm.codigo_funcao = 'FITA-50MM' THEN 1.10 -- 1,10 m/m² (perímetro + juntas)
        WHEN pdm.codigo_funcao = 'MASSA-JUNTA' THEN 0.33 -- 0,33 kg/m² (metros fita × 0,3)
        WHEN pdm.codigo_funcao = 'MASSA-ACAB' THEN 1.00 -- 1,00 kg/m² (área × 2 faces × 0,5)
        WHEN pdm.codigo_funcao = 'LA-VIDRO-50MM' THEN 0.525 -- 0,525 rolo/m² (área × 1,05 ÷ 15m²/rolo)
    END as consumo_por_m2,
    CASE 
        WHEN pdm.codigo_funcao LIKE 'DRY-%' THEN 15.0 -- 15% placas
        WHEN pdm.codigo_funcao LIKE 'GUIA-%' OR pdm.codigo_funcao LIKE 'MONT-%' THEN 5.0 -- 5% perfis
        WHEN pdm.codigo_funcao LIKE 'PAR-%' THEN 10.0 -- 10% parafusos
        WHEN pdm.codigo_funcao = 'BUCHA-S6' THEN 0.0 -- sem quebra buchas
        WHEN pdm.codigo_funcao LIKE 'FITA-%' THEN 10.0 -- 10% fita
        WHEN pdm.codigo_funcao LIKE 'MASSA-%' THEN 10.0 -- 10% massa
        WHEN pdm.codigo_funcao LIKE 'LA-VIDRO-%' THEN 5.0 -- 5% isolamento
    END as quebra_aplicada,
    1.0 as fator_correcao,
    pdm.preco_unitario as valor_unitario,
    CASE 
        WHEN pdm.codigo_funcao = 'DRY-ST-12.5' THEN 1.05 * pdm.preco_unitario * 1.15
        WHEN pdm.codigo_funcao = 'GUIA-70' THEN 0.70 * pdm.preco_unitario * 1.05
        WHEN pdm.codigo_funcao = 'MONT-70' THEN 0.93 * pdm.preco_unitario * 1.05
        WHEN pdm.codigo_funcao = 'PAR-13MM' THEN 6.00 * pdm.preco_unitario * 1.10
        WHEN pdm.codigo_funcao = 'PAR-25MM' THEN 3.67 * pdm.preco_unitario * 1.10
        WHEN pdm.codigo_funcao = 'BUCHA-S6' THEN 0.33 * pdm.preco_unitario
        WHEN pdm.codigo_funcao = 'FITA-50MM' THEN 1.10 * pdm.preco_unitario * 1.10
        WHEN pdm.codigo_funcao = 'MASSA-JUNTA' THEN 0.33 * pdm.preco_unitario * 1.10
        WHEN pdm.codigo_funcao = 'MASSA-ACAB' THEN 1.00 * pdm.preco_unitario * 1.10
        WHEN pdm.codigo_funcao = 'LA-VIDRO-50MM' THEN 0.525 * pdm.preco_unitario * 1.05
    END as valor_por_m2,
    CASE 
        WHEN pdm.codigo_funcao = 'DRY-ST-12.5' THEN 1
        WHEN pdm.codigo_funcao = 'GUIA-70' THEN 2
        WHEN pdm.codigo_funcao = 'MONT-70' THEN 3
        WHEN pdm.codigo_funcao = 'PAR-13MM' THEN 4
        WHEN pdm.codigo_funcao = 'PAR-25MM' THEN 5
        WHEN pdm.codigo_funcao = 'BUCHA-S6' THEN 6
        WHEN pdm.codigo_funcao = 'FITA-50MM' THEN 7
        WHEN pdm.codigo_funcao = 'MASSA-JUNTA' THEN 8
        WHEN pdm.codigo_funcao = 'MASSA-ACAB' THEN 9
        WHEN pdm.codigo_funcao = 'LA-VIDRO-50MM' THEN 10
    END as ordem,
    'direto' as tipo_calculo,
    CASE 
        WHEN pdm.codigo_funcao = 'DRY-ST-12.5' THEN 'Área × 2 faces ÷ 2,88m² × 1,15 quebra'
        WHEN pdm.codigo_funcao = 'GUIA-70' THEN '(L×2)÷3×1,05 / área total'
        WHEN pdm.codigo_funcao = 'MONT-70' THEN 'Espaçamento 0,60m + reforços'
        WHEN pdm.codigo_funcao = 'PAR-13MM' THEN '6 parafusos por montante'
        WHEN pdm.codigo_funcao = 'PAR-25MM' THEN 'Área÷0,30×1,10'
        WHEN pdm.codigo_funcao = 'BUCHA-S6' THEN '(L÷0,60)×2 / área'
        WHEN pdm.codigo_funcao = 'FITA-50MM' THEN 'Perímetro + juntas × 1,10'
        WHEN pdm.codigo_funcao = 'MASSA-JUNTA' THEN 'Metros fita × 0,3 kg/m'
        WHEN pdm.codigo_funcao = 'MASSA-ACAB' THEN 'Área × 2 faces × 0,5 kg/m²'
        WHEN pdm.codigo_funcao = 'LA-VIDRO-50MM' THEN 'Área × 1,05 ÷ 15m²/rolo'
    END as observacoes_calculo
FROM composicoes_mestre cm
CROSS JOIN produtos_drywall_mestre pdm
WHERE cm.codigo = '1.10' -- Gesso ST
  AND pdm.codigo_funcao IN (
    'DRY-ST-12.5', 'GUIA-70', 'MONT-70', 'PAR-13MM', 'PAR-25MM', 
    'BUCHA-S6', 'FITA-50MM', 'MASSA-JUNTA', 'MASSA-ACAB', 'LA-VIDRO-50MM'
  )
  AND pdm.ativo = true;

-- Inserir itens para composição "Gesso RF" (código: 1.11)
INSERT INTO itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, valor_unitario, valor_por_m2, ordem, tipo_calculo, observacoes_calculo)
SELECT 
    cm.id as composicao_id,
    pdm.id as produto_id,
    CASE 
        WHEN pdm.codigo_funcao = 'DRY-RF-12.5' THEN 1.05 -- Placa RF em vez de ST
        WHEN pdm.codigo_funcao = 'GUIA-70' THEN 0.70
        WHEN pdm.codigo_funcao = 'MONT-70' THEN 0.93
        WHEN pdm.codigo_funcao = 'PAR-13MM' THEN 6.00
        WHEN pdm.codigo_funcao = 'PAR-25MM' THEN 3.67
        WHEN pdm.codigo_funcao = 'BUCHA-S6' THEN 0.33
        WHEN pdm.codigo_funcao = 'FITA-50MM' THEN 1.10
        WHEN pdm.codigo_funcao = 'MASSA-JUNTA' THEN 0.33
        WHEN pdm.codigo_funcao = 'MASSA-ACAB' THEN 1.00
        WHEN pdm.codigo_funcao = 'LA-VIDRO-50MM' THEN 0.525
    END as consumo_por_m2,
    CASE 
        WHEN pdm.codigo_funcao LIKE 'DRY-%' THEN 15.0
        WHEN pdm.codigo_funcao LIKE 'GUIA-%' OR pdm.codigo_funcao LIKE 'MONT-%' THEN 5.0
        WHEN pdm.codigo_funcao LIKE 'PAR-%' THEN 10.0
        WHEN pdm.codigo_funcao = 'BUCHA-S6' THEN 0.0
        WHEN pdm.codigo_funcao LIKE 'FITA-%' THEN 10.0
        WHEN pdm.codigo_funcao LIKE 'MASSA-%' THEN 10.0
        WHEN pdm.codigo_funcao LIKE 'LA-VIDRO-%' THEN 5.0
    END as quebra_aplicada,
    1.0 as fator_correcao,
    pdm.preco_unitario as valor_unitario,
    CASE 
        WHEN pdm.codigo_funcao = 'DRY-RF-12.5' THEN 1.05 * pdm.preco_unitario * 1.15
        WHEN pdm.codigo_funcao = 'GUIA-70' THEN 0.70 * pdm.preco_unitario * 1.05
        WHEN pdm.codigo_funcao = 'MONT-70' THEN 0.93 * pdm.preco_unitario * 1.05
        WHEN pdm.codigo_funcao = 'PAR-13MM' THEN 6.00 * pdm.preco_unitario * 1.10
        WHEN pdm.codigo_funcao = 'PAR-25MM' THEN 3.67 * pdm.preco_unitario * 1.10
        WHEN pdm.codigo_funcao = 'BUCHA-S6' THEN 0.33 * pdm.preco_unitario
        WHEN pdm.codigo_funcao = 'FITA-50MM' THEN 1.10 * pdm.preco_unitario * 1.10
        WHEN pdm.codigo_funcao = 'MASSA-JUNTA' THEN 0.33 * pdm.preco_unitario * 1.10
        WHEN pdm.codigo_funcao = 'MASSA-ACAB' THEN 1.00 * pdm.preco_unitario * 1.10
        WHEN pdm.codigo_funcao = 'LA-VIDRO-50MM' THEN 0.525 * pdm.preco_unitario * 1.05
    END as valor_por_m2,
    CASE 
        WHEN pdm.codigo_funcao = 'DRY-RF-12.5' THEN 1
        WHEN pdm.codigo_funcao = 'GUIA-70' THEN 2
        WHEN pdm.codigo_funcao = 'MONT-70' THEN 3
        WHEN pdm.codigo_funcao = 'PAR-13MM' THEN 4
        WHEN pdm.codigo_funcao = 'PAR-25MM' THEN 5
        WHEN pdm.codigo_funcao = 'BUCHA-S6' THEN 6
        WHEN pdm.codigo_funcao = 'FITA-50MM' THEN 7
        WHEN pdm.codigo_funcao = 'MASSA-JUNTA' THEN 8
        WHEN pdm.codigo_funcao = 'MASSA-ACAB' THEN 9
        WHEN pdm.codigo_funcao = 'LA-VIDRO-50MM' THEN 10
    END as ordem,
    'direto' as tipo_calculo,
    'Mesmas fórmulas da ST, placa resistente ao fogo' as observacoes_calculo
FROM composicoes_mestre cm
CROSS JOIN produtos_drywall_mestre pdm
WHERE cm.codigo = '1.11' -- Gesso RF
  AND pdm.codigo_funcao IN (
    'DRY-RF-12.5', 'GUIA-70', 'MONT-70', 'PAR-13MM', 'PAR-25MM', 
    'BUCHA-S6', 'FITA-50MM', 'MASSA-JUNTA', 'MASSA-ACAB', 'LA-VIDRO-50MM'
  )
  AND pdm.ativo = true;

-- Inserir itens para composição "Gesso RU" (código: 1.14)
INSERT INTO itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, valor_unitario, valor_por_m2, ordem, tipo_calculo, observacoes_calculo)
SELECT 
    cm.id as composicao_id,
    pdm.id as produto_id,
    CASE 
        WHEN pdm.codigo_funcao = 'DRY-RU-12.5' THEN 1.05 -- Placa RU em vez de ST
        WHEN pdm.codigo_funcao = 'GUIA-70' THEN 0.70
        WHEN pdm.codigo_funcao = 'MONT-70' THEN 0.93
        WHEN pdm.codigo_funcao = 'PAR-13MM' THEN 6.00
        WHEN pdm.codigo_funcao = 'PAR-25MM' THEN 3.67
        WHEN pdm.codigo_funcao = 'BUCHA-S6' THEN 0.33
        WHEN pdm.codigo_funcao = 'FITA-50MM' THEN 1.10
        WHEN pdm.codigo_funcao = 'MASSA-JUNTA' THEN 0.33
        WHEN pdm.codigo_funcao = 'MASSA-ACAB' THEN 1.00
        WHEN pdm.codigo_funcao = 'LA-VIDRO-50MM' THEN 0.525
    END as consumo_por_m2,
    CASE 
        WHEN pdm.codigo_funcao LIKE 'DRY-%' THEN 15.0
        WHEN pdm.codigo_funcao LIKE 'GUIA-%' OR pdm.codigo_funcao LIKE 'MONT-%' THEN 5.0
        WHEN pdm.codigo_funcao LIKE 'PAR-%' THEN 10.0
        WHEN pdm.codigo_funcao = 'BUCHA-S6' THEN 0.0
        WHEN pdm.codigo_funcao LIKE 'FITA-%' THEN 10.0
        WHEN pdm.codigo_funcao LIKE 'MASSA-%' THEN 10.0
        WHEN pdm.codigo_funcao LIKE 'LA-VIDRO-%' THEN 5.0
    END as quebra_aplicada,
    1.0 as fator_correcao,
    pdm.preco_unitario as valor_unitario,
    CASE 
        WHEN pdm.codigo_funcao = 'DRY-RU-12.5' THEN 1.05 * pdm.preco_unitario * 1.15
        WHEN pdm.codigo_funcao = 'GUIA-70' THEN 0.70 * pdm.preco_unitario * 1.05
        WHEN pdm.codigo_funcao = 'MONT-70' THEN 0.93 * pdm.preco_unitario * 1.05
        WHEN pdm.codigo_funcao = 'PAR-13MM' THEN 6.00 * pdm.preco_unitario * 1.10
        WHEN pdm.codigo_funcao = 'PAR-25MM' THEN 3.67 * pdm.preco_unitario * 1.10
        WHEN pdm.codigo_funcao = 'BUCHA-S6' THEN 0.33 * pdm.preco_unitario
        WHEN pdm.codigo_funcao = 'FITA-50MM' THEN 1.10 * pdm.preco_unitario * 1.10
        WHEN pdm.codigo_funcao = 'MASSA-JUNTA' THEN 0.33 * pdm.preco_unitario * 1.10
        WHEN pdm.codigo_funcao = 'MASSA-ACAB' THEN 1.00 * pdm.preco_unitario * 1.10
        WHEN pdm.codigo_funcao = 'LA-VIDRO-50MM' THEN 0.525 * pdm.preco_unitario * 1.05
    END as valor_por_m2,
    CASE 
        WHEN pdm.codigo_funcao = 'DRY-RU-12.5' THEN 1
        WHEN pdm.codigo_funcao = 'GUIA-70' THEN 2
        WHEN pdm.codigo_funcao = 'MONT-70' THEN 3
        WHEN pdm.codigo_funcao = 'PAR-13MM' THEN 4
        WHEN pdm.codigo_funcao = 'PAR-25MM' THEN 5
        WHEN pdm.codigo_funcao = 'BUCHA-S6' THEN 6
        WHEN pdm.codigo_funcao = 'FITA-50MM' THEN 7
        WHEN pdm.codigo_funcao = 'MASSA-JUNTA' THEN 8
        WHEN pdm.codigo_funcao = 'MASSA-ACAB' THEN 9
        WHEN pdm.codigo_funcao = 'LA-VIDRO-50MM' THEN 10
    END as ordem,
    'direto' as tipo_calculo,
    'Mesmas fórmulas da ST, placa resistente à umidade' as observacoes_calculo
FROM composicoes_mestre cm
CROSS JOIN produtos_drywall_mestre pdm
WHERE cm.codigo = '1.14' -- Gesso RU
  AND pdm.codigo_funcao IN (
    'DRY-RU-12.5', 'GUIA-70', 'MONT-70', 'PAR-13MM', 'PAR-25MM', 
    'BUCHA-S6', 'FITA-50MM', 'MASSA-JUNTA', 'MASSA-ACAB', 'LA-VIDRO-50MM'
  )
  AND pdm.ativo = true;

-- Inserir itens para composição "Performa" (código: 1.30)
INSERT INTO itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, valor_unitario, valor_por_m2, ordem, tipo_calculo, observacoes_calculo)
SELECT 
    cm.id as composicao_id,
    pdm.id as produto_id,
    CASE 
        WHEN pdm.codigo_funcao = 'DRY-PERF-12.5' THEN 1.05 -- Placa Performa em vez de ST
        WHEN pdm.codigo_funcao = 'GUIA-70' THEN 0.70
        WHEN pdm.codigo_funcao = 'MONT-70' THEN 0.93
        WHEN pdm.codigo_funcao = 'PAR-13MM' THEN 6.00
        WHEN pdm.codigo_funcao = 'PAR-25MM' THEN 3.67
        WHEN pdm.codigo_funcao = 'BUCHA-S6' THEN 0.33
        WHEN pdm.codigo_funcao = 'FITA-50MM' THEN 1.10
        WHEN pdm.codigo_funcao = 'MASSA-JUNTA' THEN 0.33
        WHEN pdm.codigo_funcao = 'MASSA-ACAB' THEN 1.00
        WHEN pdm.codigo_funcao = 'LA-VIDRO-50MM' THEN 0.525
    END as consumo_por_m2,
    CASE 
        WHEN pdm.codigo_funcao LIKE 'DRY-%' THEN 15.0
        WHEN pdm.codigo_funcao LIKE 'GUIA-%' OR pdm.codigo_funcao LIKE 'MONT-%' THEN 5.0
        WHEN pdm.codigo_funcao LIKE 'PAR-%' THEN 10.0
        WHEN pdm.codigo_funcao = 'BUCHA-S6' THEN 0.0
        WHEN pdm.codigo_funcao LIKE 'FITA-%' THEN 10.0
        WHEN pdm.codigo_funcao LIKE 'MASSA-%' THEN 10.0
        WHEN pdm.codigo_funcao LIKE 'LA-VIDRO-%' THEN 5.0
    END as quebra_aplicada,
    1.0 as fator_correcao,
    pdm.preco_unitario as valor_unitario,
    CASE 
        WHEN pdm.codigo_funcao = 'DRY-PERF-12.5' THEN 1.05 * pdm.preco_unitario * 1.15
        WHEN pdm.codigo_funcao = 'GUIA-70' THEN 0.70 * pdm.preco_unitario * 1.05
        WHEN pdm.codigo_funcao = 'MONT-70' THEN 0.93 * pdm.preco_unitario * 1.05
        WHEN pdm.codigo_funcao = 'PAR-13MM' THEN 6.00 * pdm.preco_unitario * 1.10
        WHEN pdm.codigo_funcao = 'PAR-25MM' THEN 3.67 * pdm.preco_unitario * 1.10
        WHEN pdm.codigo_funcao = 'BUCHA-S6' THEN 0.33 * pdm.preco_unitario
        WHEN pdm.codigo_funcao = 'FITA-50MM' THEN 1.10 * pdm.preco_unitario * 1.10
        WHEN pdm.codigo_funcao = 'MASSA-JUNTA' THEN 0.33 * pdm.preco_unitario * 1.10
        WHEN pdm.codigo_funcao = 'MASSA-ACAB' THEN 1.00 * pdm.preco_unitario * 1.10
        WHEN pdm.codigo_funcao = 'LA-VIDRO-50MM' THEN 0.525 * pdm.preco_unitario * 1.05
    END as valor_por_m2,
    CASE 
        WHEN pdm.codigo_funcao = 'DRY-PERF-12.5' THEN 1
        WHEN pdm.codigo_funcao = 'GUIA-70' THEN 2
        WHEN pdm.codigo_funcao = 'MONT-70' THEN 3
        WHEN pdm.codigo_funcao = 'PAR-13MM' THEN 4
        WHEN pdm.codigo_funcao = 'PAR-25MM' THEN 5
        WHEN pdm.codigo_funcao = 'BUCHA-S6' THEN 6
        WHEN pdm.codigo_funcao = 'FITA-50MM' THEN 7
        WHEN pdm.codigo_funcao = 'MASSA-JUNTA' THEN 8
        WHEN pdm.codigo_funcao = 'MASSA-ACAB' THEN 9
        WHEN pdm.codigo_funcao = 'LA-VIDRO-50MM' THEN 10
    END as ordem,
    'direto' as tipo_calculo,
    'Mesmas fórmulas da ST, placa alta performance' as observacoes_calculo
FROM composicoes_mestre cm
CROSS JOIN produtos_drywall_mestre pdm
WHERE cm.codigo = '1.30' -- Performa
  AND pdm.codigo_funcao IN (
    'DRY-PERF-12.5', 'GUIA-70', 'MONT-70', 'PAR-13MM', 'PAR-25MM', 
    'BUCHA-S6', 'FITA-50MM', 'MASSA-JUNTA', 'MASSA-ACAB', 'LA-VIDRO-50MM'
  )
  AND pdm.ativo = true;

-- Recalcular valor total de todas as composições configuradas
SELECT recalcular_composicao(id) FROM composicoes_mestre WHERE codigo IN ('1.10', '1.11', '1.14', '1.30');