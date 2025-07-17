-- Migração para restaurar valores das composições e corrigir mapeamentos
-- Fase 1: Atualizar valores das composições conforme catálogo

-- Atualizar valores das composições existentes
UPDATE composicoes_mestre SET valor_total_m2 = 90.91 WHERE codigo = '1.01';
UPDATE composicoes_mestre SET valor_total_m2 = 16.84 WHERE codigo = '1.02';
UPDATE composicoes_mestre SET valor_total_m2 = 50.80 WHERE codigo = '1.03';
UPDATE composicoes_mestre SET valor_total_m2 = 62.54 WHERE codigo = '1.04';
UPDATE composicoes_mestre SET valor_total_m2 = 74.20 WHERE codigo = '1.05';
UPDATE composicoes_mestre SET valor_total_m2 = 20.01 WHERE codigo = '1.06';
UPDATE composicoes_mestre SET valor_total_m2 = 16.26 WHERE codigo = '1.07';
UPDATE composicoes_mestre SET valor_total_m2 = 205.54 WHERE codigo = '1.08';
UPDATE composicoes_mestre SET valor_total_m2 = 29.87 WHERE codigo = '1.10';
UPDATE composicoes_mestre SET valor_total_m2 = 28.78 WHERE codigo = '1.11';
UPDATE composicoes_mestre SET valor_total_m2 = 38.98 WHERE codigo = '1.14';
UPDATE composicoes_mestre SET valor_total_m2 = 64.51 WHERE codigo = '1.15';
UPDATE composicoes_mestre SET valor_total_m2 = 215.53 WHERE codigo = '1.16';
UPDATE composicoes_mestre SET valor_total_m2 = 238.83 WHERE codigo = '1.17';
UPDATE composicoes_mestre SET valor_total_m2 = 180.00 WHERE codigo = '1.18';
UPDATE composicoes_mestre SET valor_total_m2 = 56.32 WHERE codigo = '1.19';
UPDATE composicoes_mestre SET valor_total_m2 = 87.59 WHERE codigo = '1.20';
UPDATE composicoes_mestre SET valor_total_m2 = 63.47 WHERE codigo = '1.21';
UPDATE composicoes_mestre SET valor_total_m2 = 66.65 WHERE codigo = '1.22';
UPDATE composicoes_mestre SET valor_total_m2 = 27.14 WHERE codigo = '1.23';
UPDATE composicoes_mestre SET valor_total_m2 = 162.67 WHERE codigo = '1.24';
UPDATE composicoes_mestre SET valor_total_m2 = 3038.71 WHERE codigo = '1.25';
UPDATE composicoes_mestre SET valor_total_m2 = 30.62 WHERE codigo = '1.26';
UPDATE composicoes_mestre SET valor_total_m2 = 14.90 WHERE codigo = '1.27';
UPDATE composicoes_mestre SET valor_total_m2 = 160.89 WHERE codigo = '1.28';
UPDATE composicoes_mestre SET valor_total_m2 = 164.05 WHERE codigo = '1.29';
UPDATE composicoes_mestre SET valor_total_m2 = 39.02 WHERE codigo = '1.30';
UPDATE composicoes_mestre SET valor_total_m2 = 107.82 WHERE codigo = '1.31';
UPDATE composicoes_mestre SET valor_total_m2 = 4.95 WHERE codigo = '1.32';
UPDATE composicoes_mestre SET valor_total_m2 = 132.44 WHERE codigo = '1.33';
UPDATE composicoes_mestre SET valor_total_m2 = 17.18 WHERE codigo = '1.34';
UPDATE composicoes_mestre SET valor_total_m2 = 35.76 WHERE codigo = '1.35';
UPDATE composicoes_mestre SET valor_total_m2 = 79.84 WHERE codigo = '1.36';
UPDATE composicoes_mestre SET valor_total_m2 = 32.93 WHERE codigo = '1.40';
UPDATE composicoes_mestre SET valor_total_m2 = 38.13 WHERE codigo = '1.41';
UPDATE composicoes_mestre SET valor_total_m2 = 81.00 WHERE codigo = '1.42';

-- Corrigir mapeamentos existentes (mantas-membranas -> impermeabilizacao)
UPDATE tipo_proposta_composicoes SET tipo_proposta = 'impermeabilizacao' WHERE tipo_proposta = 'mantas-membranas';

-- Adicionar mapeamentos faltantes para tipos sem composições
-- Divisórias (usando composições de vedação interna)
INSERT INTO tipo_proposta_composicoes (tipo_proposta, composicao_id, fator_aplicacao, ordem_calculo, obrigatorio, ativo)
SELECT 'divisorias', cm.id, 1.0, 
  CASE 
    WHEN cm.codigo = '1.10' THEN 1  -- Gesso ST como padrão
    WHEN cm.codigo = '1.11' THEN 2  -- Gesso RF
    WHEN cm.codigo = '1.14' THEN 3  -- Gesso RU
    WHEN cm.codigo = '1.30' THEN 4  -- Performa
  END, 
  CASE WHEN cm.codigo = '1.10' THEN true ELSE false END, -- Só ST é obrigatório
  true
FROM composicoes_mestre cm 
WHERE cm.codigo IN ('1.10', '1.11', '1.14', '1.30') 
AND cm.ativo = true;

-- Forros (usando composições de forros)
INSERT INTO tipo_proposta_composicoes (tipo_proposta, composicao_id, fator_aplicacao, ordem_calculo, obrigatorio, ativo)
SELECT 'forros', cm.id, 1.0,
  CASE 
    WHEN cm.codigo = '1.15' THEN 1  -- Forro de Gesso padrão
    WHEN cm.codigo = '1.28' THEN 2  -- Forro Glasroc X
    WHEN cm.codigo = '1.27' THEN 3  -- Lã de Vidro (opcional)
  END,
  CASE WHEN cm.codigo = '1.15' THEN true ELSE false END, -- Só forro padrão é obrigatório
  true
FROM composicoes_mestre cm 
WHERE cm.codigo IN ('1.15', '1.28', '1.27')
AND cm.ativo = true;

-- Mapear mais composições para telhas-shingle (incluir OSB base)
INSERT INTO tipo_proposta_composicoes (tipo_proposta, composicao_id, fator_aplicacao, ordem_calculo, obrigatorio, ativo)
SELECT 'telhas-shingle', cm.id, 1.0,
  CASE 
    WHEN cm.codigo = '1.01' THEN 1  -- OSB base (obrigatório)
    WHEN cm.codigo = '1.18' THEN 5  -- Telha Trapezoidal TP40
    WHEN cm.codigo = '1.19' THEN 6  -- Telha Ondulada
    WHEN cm.codigo = '1.31' THEN 7  -- Telha TP40 simples
  END,
  CASE WHEN cm.codigo = '1.01' THEN true ELSE false END,
  true
FROM composicoes_mestre cm 
WHERE cm.codigo IN ('1.01', '1.18', '1.19', '1.31')
AND cm.ativo = true
AND NOT EXISTS (
  SELECT 1 FROM tipo_proposta_composicoes tpc 
  WHERE tpc.composicao_id = cm.id AND tpc.tipo_proposta = 'telhas-shingle'
);

-- Verificar se todos os tipos de proposta necessários estão mapeados
-- Comentário para verificação manual posterior