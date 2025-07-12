-- Adicionar campo para controlar exibição de preços unitários na proposta do cliente
ALTER TABLE public.propostas 
ADD COLUMN ocultar_precos_unitarios BOOLEAN NOT NULL DEFAULT FALSE;