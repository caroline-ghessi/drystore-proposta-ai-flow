-- Atualizar configurações de footer com mais campos
UPDATE public.configuracoes_globais 
SET valor = jsonb_build_object(
  'empresa', 'DryStore',
  'descricao', 'Sua escolha segura em materiais de construção e energia renovável.',
  'endereco', 'Rua Principal, 123',
  'telefone', '(11) 3456-7890',
  'whatsapp', '(11) 99999-9999',
  'email', 'contato@drystore.com.br',
  'certificacoes', jsonb_build_array('ABNT NBR 14715', 'ISO 9001', 'PBQP-H'),
  'selos_qualidade', jsonb_build_array('ANCC', 'INMETRO'),
  'copyright', '© 2025 DryStore. Todos os direitos reservados.',
  'redes_sociais', jsonb_build_object(
    'facebook', '',
    'instagram', '',
    'linkedin', '',
    'youtube', ''
  )
)
WHERE categoria = 'textos_padrao' AND chave = 'rodape';