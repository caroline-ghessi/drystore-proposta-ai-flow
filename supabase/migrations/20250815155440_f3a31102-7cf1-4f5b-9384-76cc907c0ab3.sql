-- First, check which produto_ids in composicoes_drywall don't exist in produtos_drywall_mestre
-- and update them to NULL to avoid foreign key violations
UPDATE composicoes_drywall 
SET produto_id = NULL 
WHERE produto_id IS NOT NULL 
AND produto_id NOT IN (SELECT id FROM produtos_drywall_mestre);

-- Now we can safely update the foreign key constraint
ALTER TABLE composicoes_drywall DROP CONSTRAINT IF EXISTS composicoes_drywall_produto_id_fkey;

-- Add new foreign key constraint pointing to produtos_drywall_mestre
ALTER TABLE composicoes_drywall 
ADD CONSTRAINT composicoes_drywall_produto_id_fkey 
FOREIGN KEY (produto_id) REFERENCES produtos_drywall_mestre(id);