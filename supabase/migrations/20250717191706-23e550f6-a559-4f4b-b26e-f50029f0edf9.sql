-- Etapa 2: Atualizar registros existentes de 'telhas' para 'telhas-shingle'
UPDATE propostas 
SET tipo_proposta = 'telhas-shingle'
WHERE tipo_proposta = 'telhas';