-- Primeiro, vamos adicionar o novo valor ao enum existente
ALTER TYPE tipo_proposta_enum ADD VALUE 'telhas-shingle';

-- Atualizar todos os registros de 'telhas' para 'telhas-shingle'
UPDATE propostas 
SET tipo_proposta = 'telhas-shingle'
WHERE tipo_proposta = 'telhas';

-- Não podemos remover valores de enum diretamente, mas podemos criar um novo enum limpo
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