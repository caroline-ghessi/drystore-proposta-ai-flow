-- Criar bucket para logos e favicons
INSERT INTO storage.buckets (id, name, public) VALUES ('logos-empresa', 'logos-empresa', true);

-- Políticas para o bucket logos-empresa
CREATE POLICY "Logos são públicos para visualização" ON storage.objects
FOR SELECT USING (bucket_id = 'logos-empresa');

CREATE POLICY "Admins podem fazer upload de logos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'logos-empresa');

CREATE POLICY "Admins podem atualizar logos" ON storage.objects
FOR UPDATE USING (bucket_id = 'logos-empresa');

CREATE POLICY "Admins podem deletar logos" ON storage.objects
FOR DELETE USING (bucket_id = 'logos-empresa');