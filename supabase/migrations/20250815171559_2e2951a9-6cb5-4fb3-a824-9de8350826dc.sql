-- Inserir as 3 novas placas de drywall na tabela produtos_drywall_mestre

INSERT INTO produtos_drywall_mestre (
  codigo_funcao,
  categoria_funcao,
  descricao,
  especificacao,
  unidade_comercial,
  preco_unitario,
  peso_unitario,
  ativo
) VALUES 
-- Placa Antiumidade (RU) - Verde
(
  'DRY-RU-12.5',
  'VEDAÇÃO',
  'Placa Drywall Antiumidade RU 12,5mm',
  'Placa verde resistente à umidade, 120x240cm (2,88m²), espessura 12,5mm. Ideal para áreas úmidas como banheiros e cozinhas.',
  'placa',
  78.50,
  35.0,
  true
),
-- Placa Antifogo (RF) - Rosa
(
  'DRY-RF-12.5',
  'VEDAÇÃO',
  'Placa Drywall Antifogo RF 12,5mm',
  'Placa rosa resistente ao fogo, 120x240cm (2,88m²), espessura 12,5mm. Proporciona resistência ao fogo conforme NBR.',
  'placa',
  82.00,
  35.0,
  true
),
-- Placa Performa - Alta Resistência
(
  'DRY-PERF-12.5',
  'VEDAÇÃO',
  'Placa Drywall Performa 12,5mm',
  'Placa de alta performance, 120x240cm (2,88m²), espessura 12,5mm. Suporta até 50kg por fixação, isolamento acústico +3dB.',
  'placa',
  95.00,
  35.0,
  true
);