-- Correção: Popular apenas os itens com valores válidos

-- Primeiro, vamos verificar quais produtos existem nas categorias relevantes
INSERT INTO public.itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, ordem, valor_unitario, valor_por_m2) 
SELECT 
  cm.id,
  pm.id,
  1.0, -- Consumo padrão
  5.0,
  1.0,
  1,
  pm.preco_unitario,
  pm.preco_unitario * 1.0
FROM composicoes_mestre cm
CROSS JOIN produtos_mestre pm
WHERE cm.codigo = 'COMP_SOLAR_PAINEIS'
AND pm.categoria = 'ELETRICO'
AND pm.ativo = true
LIMIT 3;

-- Estrutura solar
INSERT INTO public.itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, ordem, valor_unitario, valor_por_m2) 
SELECT 
  cm.id,
  pm.id,
  2.0, -- Consumo para estrutura
  5.0,
  1.0,
  2,
  pm.preco_unitario,
  pm.preco_unitario * 2.0
FROM composicoes_mestre cm
CROSS JOIN produtos_mestre pm
WHERE cm.codigo = 'COMP_SOLAR_ESTRUTURA'
AND pm.categoria IN ('ESTRUTURA_METALICA', 'METAIS')
AND pm.ativo = true
LIMIT 2;

-- Telhas shingle
INSERT INTO public.itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, ordem, valor_unitario, valor_por_m2)
SELECT 
  cm.id,
  pm.id,
  3.2, -- Consumo para telhas
  8.0,
  1.0,
  1,
  pm.preco_unitario,
  pm.preco_unitario * 3.2
FROM composicoes_mestre cm
CROSS JOIN produtos_mestre pm
WHERE cm.codigo = 'COMP_SHINGLE_TELHAS'
AND pm.categoria = 'COBERTURA'
AND pm.ativo = true
LIMIT 2;

-- OSB para shingle
INSERT INTO public.itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, ordem, valor_unitario, valor_por_m2)
SELECT 
  cm.id,
  pm.id,
  1.0,
  8.0,
  1.0,
  2,
  pm.preco_unitario,
  pm.preco_unitario * 1.0
FROM composicoes_mestre cm
CROSS JOIN produtos_mestre pm
WHERE cm.codigo = 'COMP_SHINGLE_OSB'
AND pm.categoria = 'MADEIRAS'
AND pm.ativo = true
LIMIT 2;

-- Impermeabilização
INSERT INTO public.itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, ordem, valor_unitario, valor_por_m2)
SELECT 
  cm.id,
  pm.id,
  1.5,
  5.0,
  1.0,
  1,
  pm.preco_unitario,
  pm.preco_unitario * 1.5
FROM composicoes_mestre cm
CROSS JOIN produtos_mestre pm
WHERE cm.codigo = 'COMP_IMPERF_ACRILICO'
AND pm.categoria = 'IMPERMEABILIZACAO'
AND pm.ativo = true
LIMIT 2;

-- Atualizar valores totais das composições
UPDATE public.composicoes_mestre 
SET valor_total_m2 = (
  SELECT COALESCE(SUM(valor_por_m2), 0)
  FROM itens_composicao 
  WHERE composicao_id = composicoes_mestre.id
);

-- Completar mapeamentos para energia solar
INSERT INTO public.tipo_proposta_composicoes (tipo_proposta, composicao_id, obrigatorio, ordem_calculo, fator_aplicacao)
SELECT 'energia-solar', id, true, ROW_NUMBER() OVER (ORDER BY codigo), 1.0
FROM composicoes_mestre 
WHERE categoria = 'ENERGIA_SOLAR'
AND NOT EXISTS (
  SELECT 1 FROM tipo_proposta_composicoes tpc 
  WHERE tpc.tipo_proposta = 'energia-solar' AND tpc.composicao_id = composicoes_mestre.id
);

-- Completar mapeamentos para impermeabilização
INSERT INTO public.tipo_proposta_composicoes (tipo_proposta, composicao_id, obrigatorio, ordem_calculo, fator_aplicacao)
SELECT 'impermeabilizacao', id, true, ROW_NUMBER() OVER (ORDER BY codigo), 1.0
FROM composicoes_mestre 
WHERE categoria = 'IMPERMEABILIZACAO'
AND NOT EXISTS (
  SELECT 1 FROM tipo_proposta_composicoes tpc 
  WHERE tpc.tipo_proposta = 'impermeabilizacao' AND tpc.composicao_id = composicoes_mestre.id
);