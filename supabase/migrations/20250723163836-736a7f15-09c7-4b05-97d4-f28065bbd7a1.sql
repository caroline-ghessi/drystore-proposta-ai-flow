-- Corrigir separação de composições Shingle Supreme e Oakridge

-- Primeiro, remover mapeamentos existentes de 'telhas-shingle'
DELETE FROM tipo_proposta_composicoes 
WHERE tipo_proposta = 'telhas-shingle';

-- Criar mapeamento específico para Supreme (código 1.16)
INSERT INTO tipo_proposta_composicoes (tipo_proposta, composicao_id, obrigatorio, ordem_calculo, fator_aplicacao)
SELECT 
  'telhas-shingle-supreme' as tipo_proposta,
  id as composicao_id,
  true as obrigatorio,
  1 as ordem_calculo,
  1.0 as fator_aplicacao
FROM composicoes_mestre 
WHERE codigo = '1.16' AND ativo = true;

-- Criar mapeamento específico para Oakridge (código 1.17)  
INSERT INTO tipo_proposta_composicoes (tipo_proposta, composicao_id, obrigatorio, ordem_calculo, fator_aplicacao)
SELECT 
  'telhas-shingle-oakridge' as tipo_proposta,
  id as composicao_id,
  true as obrigatorio,
  1 as ordem_calculo,
  1.0 as fator_aplicacao
FROM composicoes_mestre 
WHERE codigo = '1.17' AND ativo = true;