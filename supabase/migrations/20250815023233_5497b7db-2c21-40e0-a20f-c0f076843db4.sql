-- Cleanup: Remove unused shingle product tables
-- These tables are not used by the current proposal system or material calculator

-- Drop produtos_shingle_novo table
DROP TABLE IF EXISTS public.produtos_shingle_novo CASCADE;

-- Drop telhas_shingle table  
DROP TABLE IF EXISTS public.telhas_shingle CASCADE;

-- Drop produtos_shingle_completos table
DROP TABLE IF EXISTS public.produtos_shingle_completos CASCADE;

-- Drop the view that references telhas_shingle
DROP VIEW IF EXISTS public.v_telhas_shingle_resumo CASCADE;