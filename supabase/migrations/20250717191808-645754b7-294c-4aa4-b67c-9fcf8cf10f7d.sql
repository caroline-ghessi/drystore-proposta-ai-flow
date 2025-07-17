-- Etapa 3: Criar novo enum limpo sem 'telhas'
CREATE TYPE tipo_proposta_enum_clean AS ENUM (
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

-- Alterar a coluna para usar o novo enum
ALTER TABLE propostas 
ALTER COLUMN tipo_proposta TYPE tipo_proposta_enum_clean 
USING tipo_proposta::text::tipo_proposta_enum_clean;

-- Remover o enum antigo e renomear
DROP TYPE tipo_proposta_enum;
ALTER TYPE tipo_proposta_enum_clean RENAME TO tipo_proposta_enum;