-- Primeiro, vamos verificar e criar os produtos mestres correspondentes aos produtos drywall
-- se não existirem, e depois configurar as composições

-- Inserir produtos mestres baseados nos produtos drywall (caso não existam)
INSERT INTO produtos_mestre (codigo, descricao, categoria, unidade_medida, preco_unitario, quantidade_embalagem, quebra_padrao, ativo)
SELECT 
    pdm.codigo_funcao,
    pdm.descricao,
    pdm.categoria_funcao,
    pdm.unidade_comercial,
    pdm.preco_unitario,
    1.0,
    CASE 
        WHEN pdm.codigo_funcao LIKE 'DRY-%' THEN 15.0
        WHEN pdm.codigo_funcao LIKE 'GUIA-%' OR pdm.codigo_funcao LIKE 'MONT-%' THEN 5.0
        WHEN pdm.codigo_funcao LIKE 'PAR-%' THEN 10.0
        WHEN pdm.codigo_funcao = 'BUCHA-S6' THEN 0.0
        WHEN pdm.codigo_funcao LIKE 'FITA-%' THEN 10.0
        WHEN pdm.codigo_funcao LIKE 'MASSA-%' THEN 10.0
        WHEN pdm.codigo_funcao LIKE 'LA-VIDRO-%' THEN 5.0
    END,
    true
FROM produtos_drywall_mestre pdm
WHERE pdm.codigo_funcao IN (
    'DRY-ST-12.5', 'DRY-RF-12.5', 'DRY-RU-12.5', 'DRY-PERF-12.5',
    'GUIA-70', 'MONT-70', 'PAR-13MM', 'PAR-25MM', 
    'BUCHA-S6', 'FITA-50MM', 'MASSA-JUNTA', 'MASSA-ACAB', 'LA-VIDRO-50MM'
)
AND pdm.ativo = true
AND pdm.codigo_funcao NOT IN (SELECT codigo FROM produtos_mestre WHERE ativo = true);

-- Agora configurar as composições usando os produtos_mestre corretos
-- Inserir itens para composição "Gesso ST" (código: 1.10)
INSERT INTO itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, valor_unitario, valor_por_m2, ordem, tipo_calculo, observacoes_calculo)
SELECT 
    cm.id as composicao_id,
    pm.id as produto_id,
    CASE 
        WHEN pm.codigo = 'DRY-ST-12.5' THEN 1.05
        WHEN pm.codigo = 'GUIA-70' THEN 0.70
        WHEN pm.codigo = 'MONT-70' THEN 0.93
        WHEN pm.codigo = 'PAR-13MM' THEN 6.00
        WHEN pm.codigo = 'PAR-25MM' THEN 3.67
        WHEN pm.codigo = 'BUCHA-S6' THEN 0.33
        WHEN pm.codigo = 'FITA-50MM' THEN 1.10
        WHEN pm.codigo = 'MASSA-JUNTA' THEN 0.33
        WHEN pm.codigo = 'MASSA-ACAB' THEN 1.00
        WHEN pm.codigo = 'LA-VIDRO-50MM' THEN 0.525
    END as consumo_por_m2,
    CASE 
        WHEN pm.codigo LIKE 'DRY-%' THEN 15.0
        WHEN pm.codigo LIKE 'GUIA-%' OR pm.codigo LIKE 'MONT-%' THEN 5.0
        WHEN pm.codigo LIKE 'PAR-%' THEN 10.0
        WHEN pm.codigo = 'BUCHA-S6' THEN 0.0
        WHEN pm.codigo LIKE 'FITA-%' THEN 10.0
        WHEN pm.codigo LIKE 'MASSA-%' THEN 10.0
        WHEN pm.codigo LIKE 'LA-VIDRO-%' THEN 5.0
    END as quebra_aplicada,
    1.0 as fator_correcao,
    pm.preco_unitario as valor_unitario,
    CASE 
        WHEN pm.codigo = 'DRY-ST-12.5' THEN 1.05 * pm.preco_unitario * 1.15
        WHEN pm.codigo = 'GUIA-70' THEN 0.70 * pm.preco_unitario * 1.05
        WHEN pm.codigo = 'MONT-70' THEN 0.93 * pm.preco_unitario * 1.05
        WHEN pm.codigo = 'PAR-13MM' THEN 6.00 * pm.preco_unitario * 1.10
        WHEN pm.codigo = 'PAR-25MM' THEN 3.67 * pm.preco_unitario * 1.10
        WHEN pm.codigo = 'BUCHA-S6' THEN 0.33 * pm.preco_unitario
        WHEN pm.codigo = 'FITA-50MM' THEN 1.10 * pm.preco_unitario * 1.10
        WHEN pm.codigo = 'MASSA-JUNTA' THEN 0.33 * pm.preco_unitario * 1.10
        WHEN pm.codigo = 'MASSA-ACAB' THEN 1.00 * pm.preco_unitario * 1.10
        WHEN pm.codigo = 'LA-VIDRO-50MM' THEN 0.525 * pm.preco_unitario * 1.05
    END as valor_por_m2,
    CASE 
        WHEN pm.codigo = 'DRY-ST-12.5' THEN 1
        WHEN pm.codigo = 'GUIA-70' THEN 2
        WHEN pm.codigo = 'MONT-70' THEN 3
        WHEN pm.codigo = 'PAR-13MM' THEN 4
        WHEN pm.codigo = 'PAR-25MM' THEN 5
        WHEN pm.codigo = 'BUCHA-S6' THEN 6
        WHEN pm.codigo = 'FITA-50MM' THEN 7
        WHEN pm.codigo = 'MASSA-JUNTA' THEN 8
        WHEN pm.codigo = 'MASSA-ACAB' THEN 9
        WHEN pm.codigo = 'LA-VIDRO-50MM' THEN 10
    END as ordem,
    'direto' as tipo_calculo,
    CASE 
        WHEN pm.codigo = 'DRY-ST-12.5' THEN 'Área × 2 faces ÷ 2,88m² × 1,15 quebra'
        WHEN pm.codigo = 'GUIA-70' THEN '(L×2)÷3×1,05 / área total'
        WHEN pm.codigo = 'MONT-70' THEN 'Espaçamento 0,60m + reforços'
        WHEN pm.codigo = 'PAR-13MM' THEN '6 parafusos por montante'
        WHEN pm.codigo = 'PAR-25MM' THEN 'Área÷0,30×1,10'
        WHEN pm.codigo = 'BUCHA-S6' THEN '(L÷0,60)×2 / área'
        WHEN pm.codigo = 'FITA-50MM' THEN 'Perímetro + juntas × 1,10'
        WHEN pm.codigo = 'MASSA-JUNTA' THEN 'Metros fita × 0,3 kg/m'
        WHEN pm.codigo = 'MASSA-ACAB' THEN 'Área × 2 faces × 0,5 kg/m²'
        WHEN pm.codigo = 'LA-VIDRO-50MM' THEN 'Área × 1,05 ÷ 15m²/rolo'
    END as observacoes_calculo
FROM composicoes_mestre cm
CROSS JOIN produtos_mestre pm
WHERE cm.codigo = '1.10'
  AND pm.codigo IN (
    'DRY-ST-12.5', 'GUIA-70', 'MONT-70', 'PAR-13MM', 'PAR-25MM', 
    'BUCHA-S6', 'FITA-50MM', 'MASSA-JUNTA', 'MASSA-ACAB', 'LA-VIDRO-50MM'
  )
  AND pm.ativo = true;

-- Repetir para as outras composições (RF, RU, Performa)
INSERT INTO itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, valor_unitario, valor_por_m2, ordem, tipo_calculo, observacoes_calculo)
SELECT 
    cm.id as composicao_id,
    pm.id as produto_id,
    CASE 
        WHEN pm.codigo = 'DRY-RF-12.5' THEN 1.05
        WHEN pm.codigo = 'GUIA-70' THEN 0.70
        WHEN pm.codigo = 'MONT-70' THEN 0.93
        WHEN pm.codigo = 'PAR-13MM' THEN 6.00
        WHEN pm.codigo = 'PAR-25MM' THEN 3.67
        WHEN pm.codigo = 'BUCHA-S6' THEN 0.33
        WHEN pm.codigo = 'FITA-50MM' THEN 1.10
        WHEN pm.codigo = 'MASSA-JUNTA' THEN 0.33
        WHEN pm.codigo = 'MASSA-ACAB' THEN 1.00
        WHEN pm.codigo = 'LA-VIDRO-50MM' THEN 0.525
    END as consumo_por_m2,
    pm.quebra_padrao as quebra_aplicada,
    1.0 as fator_correcao,
    pm.preco_unitario as valor_unitario,
    CASE 
        WHEN pm.codigo = 'DRY-RF-12.5' THEN 1.05 * pm.preco_unitario * 1.15
        WHEN pm.codigo = 'GUIA-70' THEN 0.70 * pm.preco_unitario * 1.05
        WHEN pm.codigo = 'MONT-70' THEN 0.93 * pm.preco_unitario * 1.05
        WHEN pm.codigo = 'PAR-13MM' THEN 6.00 * pm.preco_unitario * 1.10
        WHEN pm.codigo = 'PAR-25MM' THEN 3.67 * pm.preco_unitario * 1.10
        WHEN pm.codigo = 'BUCHA-S6' THEN 0.33 * pm.preco_unitario
        WHEN pm.codigo = 'FITA-50MM' THEN 1.10 * pm.preco_unitario * 1.10
        WHEN pm.codigo = 'MASSA-JUNTA' THEN 0.33 * pm.preco_unitario * 1.10
        WHEN pm.codigo = 'MASSA-ACAB' THEN 1.00 * pm.preco_unitario * 1.10
        WHEN pm.codigo = 'LA-VIDRO-50MM' THEN 0.525 * pm.preco_unitario * 1.05
    END as valor_por_m2,
    CASE 
        WHEN pm.codigo = 'DRY-RF-12.5' THEN 1
        WHEN pm.codigo = 'GUIA-70' THEN 2
        WHEN pm.codigo = 'MONT-70' THEN 3
        WHEN pm.codigo = 'PAR-13MM' THEN 4
        WHEN pm.codigo = 'PAR-25MM' THEN 5
        WHEN pm.codigo = 'BUCHA-S6' THEN 6
        WHEN pm.codigo = 'FITA-50MM' THEN 7
        WHEN pm.codigo = 'MASSA-JUNTA' THEN 8
        WHEN pm.codigo = 'MASSA-ACAB' THEN 9
        WHEN pm.codigo = 'LA-VIDRO-50MM' THEN 10
    END as ordem,
    'direto' as tipo_calculo,
    'Composição RF - Resistente ao Fogo' as observacoes_calculo
FROM composicoes_mestre cm
CROSS JOIN produtos_mestre pm
WHERE cm.codigo = '1.11'
  AND pm.codigo IN (
    'DRY-RF-12.5', 'GUIA-70', 'MONT-70', 'PAR-13MM', 'PAR-25MM', 
    'BUCHA-S6', 'FITA-50MM', 'MASSA-JUNTA', 'MASSA-ACAB', 'LA-VIDRO-50MM'
  )
  AND pm.ativo = true;

-- Composição RU
INSERT INTO itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, valor_unitario, valor_por_m2, ordem, tipo_calculo, observacoes_calculo)
SELECT 
    cm.id as composicao_id,
    pm.id as produto_id,
    CASE 
        WHEN pm.codigo = 'DRY-RU-12.5' THEN 1.05
        WHEN pm.codigo = 'GUIA-70' THEN 0.70
        WHEN pm.codigo = 'MONT-70' THEN 0.93
        WHEN pm.codigo = 'PAR-13MM' THEN 6.00
        WHEN pm.codigo = 'PAR-25MM' THEN 3.67
        WHEN pm.codigo = 'BUCHA-S6' THEN 0.33
        WHEN pm.codigo = 'FITA-50MM' THEN 1.10
        WHEN pm.codigo = 'MASSA-JUNTA' THEN 0.33
        WHEN pm.codigo = 'MASSA-ACAB' THEN 1.00
        WHEN pm.codigo = 'LA-VIDRO-50MM' THEN 0.525
    END as consumo_por_m2,
    pm.quebra_padrao as quebra_aplicada,
    1.0 as fator_correcao,
    pm.preco_unitario as valor_unitario,
    CASE 
        WHEN pm.codigo = 'DRY-RU-12.5' THEN 1.05 * pm.preco_unitario * 1.15
        WHEN pm.codigo = 'GUIA-70' THEN 0.70 * pm.preco_unitario * 1.05
        WHEN pm.codigo = 'MONT-70' THEN 0.93 * pm.preco_unitario * 1.05
        WHEN pm.codigo = 'PAR-13MM' THEN 6.00 * pm.preco_unitario * 1.10
        WHEN pm.codigo = 'PAR-25MM' THEN 3.67 * pm.preco_unitario * 1.10
        WHEN pm.codigo = 'BUCHA-S6' THEN 0.33 * pm.preco_unitario
        WHEN pm.codigo = 'FITA-50MM' THEN 1.10 * pm.preco_unitario * 1.10
        WHEN pm.codigo = 'MASSA-JUNTA' THEN 0.33 * pm.preco_unitario * 1.10
        WHEN pm.codigo = 'MASSA-ACAB' THEN 1.00 * pm.preco_unitario * 1.10
        WHEN pm.codigo = 'LA-VIDRO-50MM' THEN 0.525 * pm.preco_unitario * 1.05
    END as valor_por_m2,
    CASE 
        WHEN pm.codigo = 'DRY-RU-12.5' THEN 1
        WHEN pm.codigo = 'GUIA-70' THEN 2
        WHEN pm.codigo = 'MONT-70' THEN 3
        WHEN pm.codigo = 'PAR-13MM' THEN 4
        WHEN pm.codigo = 'PAR-25MM' THEN 5
        WHEN pm.codigo = 'BUCHA-S6' THEN 6
        WHEN pm.codigo = 'FITA-50MM' THEN 7
        WHEN pm.codigo = 'MASSA-JUNTA' THEN 8
        WHEN pm.codigo = 'MASSA-ACAB' THEN 9
        WHEN pm.codigo = 'LA-VIDRO-50MM' THEN 10
    END as ordem,
    'direto' as tipo_calculo,
    'Composição RU - Resistente à Umidade' as observacoes_calculo
FROM composicoes_mestre cm
CROSS JOIN produtos_mestre pm
WHERE cm.codigo = '1.14'
  AND pm.codigo IN (
    'DRY-RU-12.5', 'GUIA-70', 'MONT-70', 'PAR-13MM', 'PAR-25MM', 
    'BUCHA-S6', 'FITA-50MM', 'MASSA-JUNTA', 'MASSA-ACAB', 'LA-VIDRO-50MM'
  )
  AND pm.ativo = true;

-- Composição Performa
INSERT INTO itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, valor_unitario, valor_por_m2, ordem, tipo_calculo, observacoes_calculo)
SELECT 
    cm.id as composicao_id,
    pm.id as produto_id,
    CASE 
        WHEN pm.codigo = 'DRY-PERF-12.5' THEN 1.05
        WHEN pm.codigo = 'GUIA-70' THEN 0.70
        WHEN pm.codigo = 'MONT-70' THEN 0.93
        WHEN pm.codigo = 'PAR-13MM' THEN 6.00
        WHEN pm.codigo = 'PAR-25MM' THEN 3.67
        WHEN pm.codigo = 'BUCHA-S6' THEN 0.33
        WHEN pm.codigo = 'FITA-50MM' THEN 1.10
        WHEN pm.codigo = 'MASSA-JUNTA' THEN 0.33
        WHEN pm.codigo = 'MASSA-ACAB' THEN 1.00
        WHEN pm.codigo = 'LA-VIDRO-50MM' THEN 0.525
    END as consumo_por_m2,
    pm.quebra_padrao as quebra_aplicada,
    1.0 as fator_correcao,
    pm.preco_unitario as valor_unitario,
    CASE 
        WHEN pm.codigo = 'DRY-PERF-12.5' THEN 1.05 * pm.preco_unitario * 1.15
        WHEN pm.codigo = 'GUIA-70' THEN 0.70 * pm.preco_unitario * 1.05
        WHEN pm.codigo = 'MONT-70' THEN 0.93 * pm.preco_unitario * 1.05
        WHEN pm.codigo = 'PAR-13MM' THEN 6.00 * pm.preco_unitario * 1.10
        WHEN pm.codigo = 'PAR-25MM' THEN 3.67 * pm.preco_unitario * 1.10
        WHEN pm.codigo = 'BUCHA-S6' THEN 0.33 * pm.preco_unitario
        WHEN pm.codigo = 'FITA-50MM' THEN 1.10 * pm.preco_unitario * 1.10
        WHEN pm.codigo = 'MASSA-JUNTA' THEN 0.33 * pm.preco_unitario * 1.10
        WHEN pm.codigo = 'MASSA-ACAB' THEN 1.00 * pm.preco_unitario * 1.10
        WHEN pm.codigo = 'LA-VIDRO-50MM' THEN 0.525 * pm.preco_unitario * 1.05
    END as valor_por_m2,
    CASE 
        WHEN pm.codigo = 'DRY-PERF-12.5' THEN 1
        WHEN pm.codigo = 'GUIA-70' THEN 2
        WHEN pm.codigo = 'MONT-70' THEN 3
        WHEN pm.codigo = 'PAR-13MM' THEN 4
        WHEN pm.codigo = 'PAR-25MM' THEN 5
        WHEN pm.codigo = 'BUCHA-S6' THEN 6
        WHEN pm.codigo = 'FITA-50MM' THEN 7
        WHEN pm.codigo = 'MASSA-JUNTA' THEN 8
        WHEN pm.codigo = 'MASSA-ACAB' THEN 9
        WHEN pm.codigo = 'LA-VIDRO-50MM' THEN 10
    END as ordem,
    'direto' as tipo_calculo,
    'Composição Performa - Alta Performance' as observacoes_calculo
FROM composicoes_mestre cm
CROSS JOIN produtos_mestre pm
WHERE cm.codigo = '1.30'
  AND pm.codigo IN (
    'DRY-PERF-12.5', 'GUIA-70', 'MONT-70', 'PAR-13MM', 'PAR-25MM', 
    'BUCHA-S6', 'FITA-50MM', 'MASSA-JUNTA', 'MASSA-ACAB', 'LA-VIDRO-50MM'
  )
  AND pm.ativo = true;

-- Recalcular valor total das composições
SELECT recalcular_composicao(id) FROM composicoes_mestre WHERE codigo IN ('1.10', '1.11', '1.14', '1.30');