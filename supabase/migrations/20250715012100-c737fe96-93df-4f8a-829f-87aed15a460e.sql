-- Criar bucket público para treinamento de IA
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'treinamento-ia',
  'treinamento-ia', 
  true,
  10485760, -- 10MB
  ARRAY['application/pdf']::text[]
);

-- Política para visualização pública (necessária para Dify acessar)
CREATE POLICY "Arquivos de treinamento são publicamente visíveis"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'treinamento-ia');

-- Política para upload restrito a usuários autenticados
CREATE POLICY "Upload de treinamento apenas para usuários autenticados"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'treinamento-ia');

-- Política para atualização restrita a usuários autenticados  
CREATE POLICY "Atualização de treinamento apenas para usuários autenticados"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'treinamento-ia');

-- Política para exclusão restrita a usuários autenticados
CREATE POLICY "Exclusão de treinamento apenas para usuários autenticados"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'treinamento-ia');