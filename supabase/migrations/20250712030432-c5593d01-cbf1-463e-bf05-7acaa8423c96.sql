-- Inserir proposta de exemplo para Forros Acústicos
INSERT INTO public.propostas (
  cliente_nome,
  cliente_email,
  cliente_whatsapp,
  cliente_endereco,
  tipo_proposta,
  status,
  valor_total,
  dados_extraidos,
  url_unica
) VALUES (
  'Pedro Santos',
  'pedro.santos@email.com',
  '(11) 99999-7777',
  'Av. Paulista, 456 - Bela Vista - São Paulo/SP',
  'forros',
  'enviada',
  8750.00,
  '{"tipo_forro": "OWA madeira", "area_forro_m2": 50, "absorcao_acustica_db": 35, "isolamento_termico_r": 2.5, "economia_energia_percent": 25, "durabilidade_anos": 20, "instalacao_dias": 5, "nrc_coeficiente": 0.85, "resistencia_fogo": true, "anti_alergico": true, "sustentavel": true}',
  'pedro-santos-forros-exemplo'
);