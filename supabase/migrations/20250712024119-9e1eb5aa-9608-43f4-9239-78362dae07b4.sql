-- Inserir proposta de exemplo para Energia Solar
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
  'Ana Souza',
  'ana.souza@email.com',
  '(11) 99999-8888',
  'Rua das Flores, 123 - Vila Madalena - São Paulo/SP',
  'energia-solar',
  'enviada',
  22500.00,
  '{"consumo_mensal_kwh": 450, "potencia_kwp": 5.0, "geracao_anual_kwh": 7300, "payback_anos": 4.5, "economia_percent": 85, "qtd_paineis": 9, "modelo_inversor": "Growatt 5kW Híbrido", "inclui_baterias": true, "capacidade_baterias_kwh": 10, "co2_reduzido_toneladas": 3.2, "instalacao_dias": 7, "tipo_sistema": "hibrido"}',
  'ana-souza-energia-solar-exemplo'
);