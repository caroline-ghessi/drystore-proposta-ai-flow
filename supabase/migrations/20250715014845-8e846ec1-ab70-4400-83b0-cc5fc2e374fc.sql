-- Remover política restritiva atual para uploads de treinamento
DROP POLICY "Upload de treinamento apenas para usuários autenticados" ON storage.objects;

-- Criar nova política pública para uploads no bucket treinamento-ia
CREATE POLICY "Upload público de treinamento IA"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'treinamento-ia');