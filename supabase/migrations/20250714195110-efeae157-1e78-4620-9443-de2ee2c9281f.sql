-- Adicionar campo modo para distinguir entre IA e manual
ALTER TABLE followups_ia 
ADD COLUMN modo text NOT NULL DEFAULT 'ia' CHECK (modo IN ('ia', 'manual'));

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN followups_ia.modo IS 'Modo do follow-up: ia (gerado por IA) ou manual (escrito pelo vendedor)';