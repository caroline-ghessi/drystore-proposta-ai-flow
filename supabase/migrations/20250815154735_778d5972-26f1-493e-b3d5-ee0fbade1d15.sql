-- Fix foreign key reference in composicoes_drywall table
-- Drop the old foreign key constraint
ALTER TABLE composicoes_drywall DROP CONSTRAINT IF EXISTS composicoes_drywall_produto_id_fkey;

-- Add new foreign key constraint pointing to produtos_drywall_mestre
ALTER TABLE composicoes_drywall 
ADD CONSTRAINT composicoes_drywall_produto_id_fkey 
FOREIGN KEY (produto_id) REFERENCES produtos_drywall_mestre(id);