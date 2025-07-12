-- Definir senha padrão para o usuário administrador de teste
UPDATE public.vendedores 
SET senha = '123456' 
WHERE email = 'joao@drystore.com';