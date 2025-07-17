-- Popular mapeamentos faltantes para todos os tipos de proposta
-- Primeiro, vamos popular mapeamentos básicos para energia solar (expandir o existente)

-- Adicionar mais composições para energia solar se necessário
INSERT INTO public.tipo_proposta_composicoes (tipo_proposta, composicao_id, obrigatorio, ordem_calculo, fator_aplicacao) 
SELECT 
  'energia-solar' as tipo_proposta,
  id as composicao_id,
  true as obrigatorio,
  ROW_NUMBER() OVER (ORDER BY nome) + 10 as ordem_calculo,
  1.0 as fator_aplicacao
FROM public.composicoes_mestre 
WHERE categoria IN ('ESTRUTURA', 'PROTECOES', 'CABOS')
AND id NOT IN (SELECT composicao_id FROM public.tipo_proposta_composicoes WHERE tipo_proposta = 'energia-solar')
LIMIT 5;

-- Telhas Shingle - expandir mapeamentos existentes
INSERT INTO public.tipo_proposta_composicoes (tipo_proposta, composicao_id, obrigatorio, ordem_calculo, fator_aplicacao) 
SELECT 
  'telhas-shingle' as tipo_proposta,
  id as composicao_id,
  true as obrigatorio,
  ROW_NUMBER() OVER (ORDER BY nome) + 10 as ordem_calculo,
  1.0 as fator_aplicacao
FROM public.composicoes_mestre 
WHERE categoria IN ('COBERTURA', 'ESTRUTURA', 'FIXACAO', 'ACABAMENTO')
AND id NOT IN (SELECT composicao_id FROM public.tipo_proposta_composicoes WHERE tipo_proposta = 'telhas-shingle')
LIMIT 8;

-- Divisórias/Drywall
INSERT INTO public.tipo_proposta_composicoes (tipo_proposta, composicao_id, obrigatorio, ordem_calculo, fator_aplicacao) 
SELECT 
  'divisorias' as tipo_proposta,
  id as composicao_id,
  true as obrigatorio,
  ROW_NUMBER() OVER (ORDER BY nome) as ordem_calculo,
  1.0 as fator_aplicacao
FROM public.composicoes_mestre 
WHERE categoria IN ('DIVISORIAS', 'ESTRUTURA_SECA', 'ACABAMENTO')
LIMIT 5;

-- Impermeabilização
INSERT INTO public.tipo_proposta_composicoes (tipo_proposta, composicao_id, obrigatorio, ordem_calculo, fator_aplicacao) 
SELECT 
  'impermeabilizacao' as tipo_proposta,
  id as composicao_id,
  true as obrigatorio,
  ROW_NUMBER() OVER (ORDER BY nome) as ordem_calculo,
  1.0 as fator_aplicacao
FROM public.composicoes_mestre 
WHERE categoria IN ('IMPERMEABILIZACAO', 'TELAS', 'PRIMER')
LIMIT 4;

-- Forros
INSERT INTO public.tipo_proposta_composicoes (tipo_proposta, composicao_id, obrigatorio, ordem_calculo, fator_aplicacao) 
SELECT 
  'forros' as tipo_proposta,
  id as composicao_id,
  true as obrigatorio,
  ROW_NUMBER() OVER (ORDER BY nome) as ordem_calculo,
  1.0 as fator_aplicacao
FROM public.composicoes_mestre 
WHERE categoria IN ('FORROS', 'ESTRUTURA_SECA', 'FIXACAO')
LIMIT 4;

-- Pisos
INSERT INTO public.tipo_proposta_composicoes (tipo_proposta, composicao_id, obrigatorio, ordem_calculo, fator_aplicacao) 
SELECT 
  'pisos' as tipo_proposta,
  id as composicao_id,
  true as obrigatorio,
  ROW_NUMBER() OVER (ORDER BY nome) as ordem_calculo,
  1.0 as fator_aplicacao
FROM public.composicoes_mestre 
WHERE categoria IN ('PISOS', 'CONTRAPISO', 'REJUNTE', 'ARGAMASSA')
LIMIT 5;

-- Telhas Cerâmicas
INSERT INTO public.tipo_proposta_composicoes (tipo_proposta, composicao_id, obrigatorio, ordem_calculo, fator_aplicacao) 
SELECT 
  'telhas-ceramicas' as tipo_proposta,
  id as composicao_id,
  true as obrigatorio,
  ROW_NUMBER() OVER (ORDER BY nome) as ordem_calculo,
  1.0 as fator_aplicacao
FROM public.composicoes_mestre 
WHERE categoria IN ('COBERTURA', 'ESTRUTURA', 'MADEIRAMENTO')
LIMIT 4;

-- Mantas e Membranas
INSERT INTO public.tipo_proposta_composicoes (tipo_proposta, composicao_id, obrigatorio, ordem_calculo, fator_aplicacao) 
SELECT 
  'mantas-membranas' as tipo_proposta,
  id as composicao_id,
  true as obrigatorio,
  ROW_NUMBER() OVER (ORDER BY nome) as ordem_calculo,
  1.0 as fator_aplicacao
FROM public.composicoes_mestre 
WHERE categoria IN ('IMPERMEABILIZACAO', 'MANTAS', 'MEMBRANAS')
LIMIT 3;

-- Vergalões de Fibra
INSERT INTO public.tipo_proposta_composicoes (tipo_proposta, composicao_id, obrigatorio, ordem_calculo, fator_aplicacao) 
SELECT 
  'verga-fibra' as tipo_proposta,
  id as composicao_id,
  true as obrigatorio,
  ROW_NUMBER() OVER (ORDER BY nome) as ordem_calculo,
  1.0 as fator_aplicacao
FROM public.composicoes_mestre 
WHERE categoria IN ('ESTRUTURA', 'CONCRETO', 'VERGALHO')
LIMIT 3;

-- Ventilação
INSERT INTO public.tipo_proposta_composicoes (tipo_proposta, composicao_id, obrigatorio, ordem_calculo, fator_aplicacao) 
SELECT 
  'ventilacao' as tipo_proposta,
  id as composicao_id,
  true as obrigatorio,
  ROW_NUMBER() OVER (ORDER BY nome) as ordem_calculo,
  1.0 as fator_aplicacao
FROM public.composicoes_mestre 
WHERE categoria IN ('VENTILACAO', 'EXAUSTAO', 'DUTOS')
LIMIT 4;