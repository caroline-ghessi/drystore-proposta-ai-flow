-- Inserir proposta mockada de Verga Fibra para visualização do layout
INSERT INTO public.propostas (
  cliente_nome,
  cliente_email,
  cliente_whatsapp,
  cliente_endereco,
  tipo_proposta,
  status,
  valor_total,
  forma_pagamento,
  observacoes,
  data_vencimento,
  dados_extraidos
) VALUES (
  'Fernanda Lima',
  'fernanda.lima@email.com',
  '(51) 99999-8888',
  'Rua das Flores, 123 - Porto Alegre/RS',
  'verga-fibra',
  'enviada',
  8500.00,
  'À vista com 10% desconto ou 12x sem juros',
  'Projeto inclui sinergia com SilentFloor para desempenho acústico superior',
  CURRENT_DATE + INTERVAL '30 days',
  '{
    "comprimento_total_m": 200,
    "diametro_barras_mm": 10,
    "qtd_barras": 50,
    "espacamento_cm": 20,
    "valor_total": 8500.00,
    "economia_vs_aco_percent": 40,
    "durabilidade_anos": 50,
    "reducao_co2_toneladas": 2.5,
    "instalacao_dias": "3-5",
    "inclui_sinergia_silentfloor": true,
    "especificacoes_tecnicas": {
      "resistencia_tracao": "550 MPa",
      "modulo_elasticidade": "41 GPa",
      "densidade": "1.9 g/cm³",
      "coeficiente_expansao": "8.6 x 10^-6 /°C"
    },
    "certificacoes": ["ISO 9001:2015", "ACI 440R-15", "CAN/CSA-S806", "ABNT NBR 14715"]
  }'::jsonb
);