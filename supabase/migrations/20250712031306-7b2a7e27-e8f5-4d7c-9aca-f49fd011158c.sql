-- Criar proposta de exemplo para Pisos Vinílicos (Lucas Mendes)
INSERT INTO public.propostas (
  tipo_proposta,
  cliente_nome,
  cliente_email,
  cliente_whatsapp,
  cliente_endereco,
  status,
  valor_total,
  dados_extraidos,
  url_unica,
  data_vencimento
) VALUES (
  'pisos',
  'Lucas Mendes',
  'lucas.mendes@email.com',
  '11999887766',
  'Rua das Flores, 123 - São Paulo/SP',
  'enviada',
  12800.00,
  '{
    "modelo_tarkett": "iQ Optima",
    "area_piso_m2": 80,
    "tipo_impermeabilizacao": "MAPEI",
    "inclui_avaliacao_tecnica": true,
    "resistencia_umidade": "IP67",
    "absorcao_acustica_db": 28,
    "valor_total": 12800,
    "economia_manutencao_percent": 30,
    "durabilidade_anos": 25,
    "instalacao_dias": "4-7 dias"
  }',
  'pisos-lucas-mendes-2025',
  NOW() + INTERVAL '30 days'
);