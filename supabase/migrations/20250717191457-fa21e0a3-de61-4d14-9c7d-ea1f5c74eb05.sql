-- Atualizar enum tipo_proposta_enum para trocar 'telhas' por 'telhas-shingle'

-- Primeiro, criar o novo enum
CREATE TYPE tipo_proposta_enum_new AS ENUM (
  'energia-solar',
  'telhas-shingle', 
  'divisorias',
  'pisos',
  'forros',
  'materiais-construcao',
  'tintas-texturas',
  'verga-fibra',
  'argamassa-silentfloor',
  'light-steel-frame',
  'impermeabilizacao'
);

-- Atualizar registros existentes de 'telhas' para 'telhas-shingle'
UPDATE propostas 
SET tipo_proposta = 'telhas-shingle'::tipo_proposta_enum_new::text::tipo_proposta_enum_new
WHERE tipo_proposta = 'telhas';

-- Alterar a coluna para usar o novo enum
ALTER TABLE propostas 
ALTER COLUMN tipo_proposta TYPE tipo_proposta_enum_new 
USING tipo_proposta::text::tipo_proposta_enum_new;

-- Remover o enum antigo e renomear o novo
DROP TYPE tipo_proposta_enum;
ALTER TYPE tipo_proposta_enum_new RENAME TO tipo_proposta_enum;