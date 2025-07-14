-- Corrigir valores NFVA dos produtos de ventilação
-- Valores baseados em especificações técnicas realistas

UPDATE produtos_shingle_novo 
SET especificacoes_tecnicas = jsonb_set(
  COALESCE(especificacoes_tecnicas, '{}'),
  '{nfva_m2}',
  '0.0935'
)
WHERE codigo = 'INFLOW-OC-122';

UPDATE produtos_shingle_novo 
SET especificacoes_tecnicas = jsonb_set(
  COALESCE(especificacoes_tecnicas, '{}'),
  '{nfva_m2}',
  '0.0780'
)
WHERE codigo = 'GRELHA-BEIRAL-VENT';

UPDATE produtos_shingle_novo 
SET especificacoes_tecnicas = jsonb_set(
  COALESCE(especificacoes_tecnicas, '{}'),
  '{nfva_m2}',
  '0.0650'
)
WHERE codigo = 'BEIRAL-VENT-LP';

UPDATE produtos_shingle_novo 
SET especificacoes_tecnicas = jsonb_set(
  COALESCE(especificacoes_tecnicas, '{}'),
  '{nfva_m2}',
  '0.0520'
)
WHERE codigo = 'AERADOR-DRYSTORE';

UPDATE produtos_shingle_novo 
SET especificacoes_tecnicas = jsonb_set(
  COALESCE(especificacoes_tecnicas, '{}'),
  '{nfva_m2}',
  '0.0285'
)
WHERE codigo = 'CUMEEIRA-VENT-DRY';

-- Adicionar comentários sobre densidade recomendada
UPDATE produtos_shingle_novo 
SET especificacoes_tecnicas = jsonb_set(
  especificacoes_tecnicas,
  '{densidade_maxima_m2}',
  '0.2'
)
WHERE codigo = 'AERADOR-DRYSTORE';

UPDATE produtos_shingle_novo 
SET especificacoes_tecnicas = jsonb_set(
  especificacoes_tecnicas,
  '{densidade_maxima_m2}',
  '0.25'
)
WHERE codigo = 'INFLOW-OC-122';

UPDATE produtos_shingle_novo 
SET especificacoes_tecnicas = jsonb_set(
  especificacoes_tecnicas,
  '{densidade_maxima_m2}',
  '0.3'
)
WHERE codigo = 'GRELHA-BEIRAL-VENT';