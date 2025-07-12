-- Criar enum para tipos de usuário
CREATE TYPE tipo_usuario_enum AS ENUM ('administrador', 'vendedor', 'representante');

-- Adicionar coluna tipo na tabela vendedores
ALTER TABLE public.vendedores 
ADD COLUMN tipo tipo_usuario_enum NOT NULL DEFAULT 'vendedor';

-- Adicionar coluna senha para autenticação básica
ALTER TABLE public.vendedores 
ADD COLUMN senha TEXT;

-- Criar índice para facilitar consultas por tipo
CREATE INDEX idx_vendedores_tipo ON public.vendedores(tipo);

-- Atualizar pelo menos um usuário para ser administrador (para testes)
UPDATE public.vendedores 
SET tipo = 'administrador' 
WHERE email = 'joao@drystore.com';

-- Adicionar trigger para atualizar updated_at
CREATE TRIGGER update_vendedores_updated_at
    BEFORE UPDATE ON public.vendedores
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();