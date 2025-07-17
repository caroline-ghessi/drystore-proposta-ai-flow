-- Migração para popular composições e itens faltantes

-- Popular composições para energia solar
INSERT INTO public.composicoes_mestre (nome, codigo, categoria, aplicacao, descricao, valor_total_m2) VALUES
('Painéis Solares Residenciais', 'COMP_SOLAR_PAINEIS', 'ENERGIA_SOLAR', 'Residencial', 'Conjunto de painéis fotovoltaicos', 1200.00),
('Estrutura Fixação Solar', 'COMP_SOLAR_ESTRUTURA', 'ENERGIA_SOLAR', 'Universal', 'Trilhos e fixadores para painéis', 150.00),
('Inversores e Proteções', 'COMP_SOLAR_INVERSORES', 'ENERGIA_SOLAR', 'Universal', 'Inversores e proteções elétricas', 800.00),
('Cabeamento Solar', 'COMP_SOLAR_CABOS', 'ENERGIA_SOLAR', 'Universal', 'Cabos DC e AC para sistema solar', 80.00);

-- Popular composições para telhas shingle
INSERT INTO public.composicoes_mestre (nome, codigo, categoria, aplicacao, descricao, valor_total_m2) VALUES
('Telhas Shingle Premium', 'COMP_SHINGLE_TELHAS', 'COBERTURA', 'Residencial', 'Telhas shingle de alta qualidade', 120.00),
('Base OSB para Shingle', 'COMP_SHINGLE_OSB', 'ESTRUTURA', 'Universal', 'Placa OSB para base das telhas', 45.00),
('Subcobertura Impermeável', 'COMP_SHINGLE_SUBCOBERTURA', 'IMPERMEABILIZACAO', 'Universal', 'Manta de subcobertura', 25.00),
('Cumeeiras e Rufos', 'COMP_SHINGLE_ACABAMENTO', 'ACABAMENTO', 'Universal', 'Cumeeiras e rufos para telhas shingle', 85.00),
('Fixação Shingle', 'COMP_SHINGLE_FIXACAO', 'FIXACAO', 'Universal', 'Pregos e grampos especiais', 15.00);

-- Popular composições para impermeabilização
INSERT INTO public.composicoes_mestre (nome, codigo, categoria, aplicacao, descricao, valor_total_m2) VALUES
('Impermeabilizante Acrílico', 'COMP_IMPERF_ACRILICO', 'IMPERMEABILIZACAO', 'Lajes e terraços', 'Sistema impermeabilizante acrílico', 35.00),
('Primer Impermeabilização', 'COMP_IMPERF_PRIMER', 'IMPERMEABILIZACAO', 'Preparação', 'Primer para impermeabilização', 12.00),
('Tela de Reforço', 'COMP_IMPERF_TELA', 'IMPERMEABILIZACAO', 'Reforço estrutural', 'Tela de poliéster para reforço', 8.00);

-- Popular composições para divisórias
INSERT INTO public.composicoes_mestre (nome, codigo, categoria, aplicacao, descricao, valor_total_m2) VALUES
('Drywall Padrão 12.5mm', 'COMP_DRYWALL_PADRAO', 'DIVISORIAS', 'Residencial/Comercial', 'Sistema de divisória em drywall', 65.00),
('Perfis Metálicos Drywall', 'COMP_DRYWALL_PERFIS', 'ESTRUTURA', 'Universal', 'Montantes e guias para drywall', 25.00),
('Isolamento Acústico', 'COMP_DRYWALL_ISOLAMENTO', 'ISOLAMENTO', 'Acústico', 'Lã de vidro para isolamento', 18.00);

-- Agora vamos popular os itens das composições

-- Itens para energia solar
INSERT INTO public.itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, ordem, valor_unitario, valor_por_m2) 
SELECT 
  cm.id,
  pm.id,
  CASE 
    WHEN cm.codigo = 'COMP_SOLAR_PAINEIS' THEN 0.125
    WHEN cm.codigo = 'COMP_SOLAR_ESTRUTURA' THEN 1.0
    WHEN cm.codigo = 'COMP_SOLAR_INVERSORES' THEN 0.001
    WHEN cm.codigo = 'COMP_SOLAR_CABOS' THEN 2.0
  END as consumo,
  5.0,
  1.0,
  ROW_NUMBER() OVER (PARTITION BY cm.id ORDER BY pm.codigo),
  pm.preco_unitario,
  pm.preco_unitario * CASE 
    WHEN cm.codigo = 'COMP_SOLAR_PAINEIS' THEN 0.125
    WHEN cm.codigo = 'COMP_SOLAR_ESTRUTURA' THEN 1.0
    WHEN cm.codigo = 'COMP_SOLAR_INVERSORES' THEN 0.001
    WHEN cm.codigo = 'COMP_SOLAR_CABOS' THEN 2.0
  END
FROM composicoes_mestre cm
CROSS JOIN produtos_mestre pm
WHERE cm.categoria = 'ENERGIA_SOLAR'
AND pm.categoria IN ('ELETRICO', 'ESTRUTURA_METALICA', 'CABOS')
AND pm.ativo = true
LIMIT 20;

-- Itens para telhas shingle
INSERT INTO public.itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, ordem, valor_unitario, valor_por_m2)
SELECT 
  cm.id,
  pm.id,
  CASE 
    WHEN cm.codigo = 'COMP_SHINGLE_TELHAS' THEN 3.2
    WHEN cm.codigo = 'COMP_SHINGLE_OSB' THEN 1.0
    WHEN cm.codigo = 'COMP_SHINGLE_SUBCOBERTURA' THEN 1.1
    WHEN cm.codigo = 'COMP_SHINGLE_ACABAMENTO' THEN 0.5
    WHEN cm.codigo = 'COMP_SHINGLE_FIXACAO' THEN 0.15
  END as consumo,
  8.0,
  1.0,
  ROW_NUMBER() OVER (PARTITION BY cm.id ORDER BY pm.codigo),
  pm.preco_unitario,
  pm.preco_unitario * CASE 
    WHEN cm.codigo = 'COMP_SHINGLE_TELHAS' THEN 3.2
    WHEN cm.codigo = 'COMP_SHINGLE_OSB' THEN 1.0
    WHEN cm.codigo = 'COMP_SHINGLE_SUBCOBERTURA' THEN 1.1
    WHEN cm.codigo = 'COMP_SHINGLE_ACABAMENTO' THEN 0.5
    WHEN cm.codigo = 'COMP_SHINGLE_FIXACAO' THEN 0.15
  END
FROM composicoes_mestre cm
CROSS JOIN produtos_mestre pm
WHERE cm.categoria IN ('COBERTURA', 'ESTRUTURA', 'IMPERMEABILIZACAO', 'ACABAMENTO', 'FIXACAO')
AND pm.categoria IN ('COBERTURA', 'MADEIRAS', 'IMPERMEABILIZACAO', 'METAIS', 'FIXACAO')
AND pm.ativo = true
LIMIT 25;

-- Itens para impermeabilização
INSERT INTO public.itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, ordem, valor_unitario, valor_por_m2)
SELECT 
  cm.id,
  pm.id,
  CASE 
    WHEN cm.codigo = 'COMP_IMPERF_ACRILICO' THEN 1.5
    WHEN cm.codigo = 'COMP_IMPERF_PRIMER' THEN 0.3
    WHEN cm.codigo = 'COMP_IMPERF_TELA' THEN 1.1
  END as consumo,
  5.0,
  1.0,
  ROW_NUMBER() OVER (PARTITION BY cm.id ORDER BY pm.codigo),
  pm.preco_unitario,
  pm.preco_unitario * CASE 
    WHEN cm.codigo = 'COMP_IMPERF_ACRILICO' THEN 1.5
    WHEN cm.codigo = 'COMP_IMPERF_PRIMER' THEN 0.3
    WHEN cm.codigo = 'COMP_IMPERF_TELA' THEN 1.1
  END
FROM composicoes_mestre cm
CROSS JOIN produtos_mestre pm
WHERE cm.categoria = 'IMPERMEABILIZACAO'
AND pm.categoria IN ('IMPERMEABILIZACAO', 'QUIMICOS', 'TEXTIL')
AND pm.ativo = true
LIMIT 15;

-- Itens para divisórias
INSERT INTO public.itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, ordem, valor_unitario, valor_por_m2)
SELECT 
  cm.id,
  pm.id,
  CASE 
    WHEN cm.codigo = 'COMP_DRYWALL_PADRAO' THEN 2.0
    WHEN cm.codigo = 'COMP_DRYWALL_PERFIS' THEN 3.5
    WHEN cm.codigo = 'COMP_DRYWALL_ISOLAMENTO' THEN 1.0
  END as consumo,
  10.0,
  1.0,
  ROW_NUMBER() OVER (PARTITION BY cm.id ORDER BY pm.codigo),
  pm.preco_unitario,
  pm.preco_unitario * CASE 
    WHEN cm.codigo = 'COMP_DRYWALL_PADRAO' THEN 2.0
    WHEN cm.codigo = 'COMP_DRYWALL_PERFIS' THEN 3.5
    WHEN cm.codigo = 'COMP_DRYWALL_ISOLAMENTO' THEN 1.0
  END
FROM composicoes_mestre cm
CROSS JOIN produtos_mestre pm
WHERE cm.categoria IN ('DIVISORIAS', 'ESTRUTURA', 'ISOLAMENTO')
AND pm.categoria IN ('DRYWALL', 'ESTRUTURA_METALICA', 'ISOLAMENTO')
AND pm.ativo = true
LIMIT 20;

-- Atualizar valores totais das composições
UPDATE public.composicoes_mestre 
SET valor_total_m2 = (
  SELECT COALESCE(SUM(valor_por_m2), 0)
  FROM itens_composicao 
  WHERE composicao_id = composicoes_mestre.id
);

-- Completar mapeamentos para os tipos faltantes
INSERT INTO public.tipo_proposta_composicoes (tipo_proposta, composicao_id, obrigatorio, ordem_calculo, fator_aplicacao)
SELECT 'energia-solar', id, true, ROW_NUMBER() OVER (ORDER BY codigo), 1.0
FROM composicoes_mestre 
WHERE categoria = 'ENERGIA_SOLAR';

INSERT INTO public.tipo_proposta_composicoes (tipo_proposta, composicao_id, obrigatorio, ordem_calculo, fator_aplicacao)
SELECT 'impermeabilizacao', id, true, ROW_NUMBER() OVER (ORDER BY codigo), 1.0
FROM composicoes_mestre 
WHERE categoria = 'IMPERMEABILIZACAO';

INSERT INTO public.tipo_proposta_composicoes (tipo_proposta, composicao_id, obrigatorio, ordem_calculo, fator_aplicacao)
SELECT 'divisorias', id, true, ROW_NUMBER() OVER (ORDER BY codigo), 1.0
FROM composicoes_mestre 
WHERE categoria IN ('DIVISORIAS', 'ESTRUTURA', 'ISOLAMENTO')
AND aplicacao LIKE '%drywall%' OR codigo LIKE '%DRYWALL%';