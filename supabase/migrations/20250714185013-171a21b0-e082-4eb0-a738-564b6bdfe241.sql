-- Inserir produtos de ventilação na tabela produtos_shingle_novo
INSERT INTO produtos_shingle_novo (
  codigo, 
  descricao, 
  tipo_componente, 
  linha, 
  cor, 
  conteudo_unidade, 
  unidade_medida, 
  preco_unitario, 
  peso_unitario, 
  quebra_padrao, 
  ativo,
  especificacoes_tecnicas
) VALUES 
-- Produtos de Intake (Entrada)
('INFLOW-OC-122', 'Inflow Owens Corning 1,22m', 'VENTILACAO', 'UNIVERSAL', 'NATURAL', 1.22, 'peça', 89.90, 1.5, 5.0, true, '{"nfva_m2": 0.0265, "comprimento_m": 1.22, "tipo_ventilacao": "intake", "instalacao": "beiral", "subtipo": "inflow"}'),

('GRELHA-BEIRAL', 'Grelha de Beiral Ventilado', 'VENTILACAO', 'UNIVERSAL', 'BRANCO', 1.0, 'peça', 45.50, 0.8, 5.0, true, '{"nfva_m2": 0.0312, "tipo_ventilacao": "intake", "instalacao": "beiral", "subtipo": "grelha_beiral"}'),

('BEIRAL-LP', 'Beiral Ventilado LP (consultar fabricante)', 'VENTILACAO', 'UNIVERSAL', 'NATURAL', 1.0, 'peça', 0.00, 0.0, 0.0, false, '{"nfva_m2": null, "tipo_ventilacao": "intake", "instalacao": "beiral", "observacao": "NFVA não disponível - consultar fabricante", "subtipo": "beiral_lp"}'),

-- Produtos de Exhaust (Saída)
('AERADOR-DS', 'Aerador Fabricação DryStore', 'VENTILACAO', 'UNIVERSAL', 'PRETO', 1.0, 'peça', 125.00, 2.2, 5.0, true, '{"nfva_m2": 0.0072, "tipo_ventilacao": "exhaust", "instalacao": "telhado", "subtipo": "aerador"}'),

('CUMEEIRA-VENT-DS', 'Cumeeira Ventilada Fabricação DryStore', 'VENTILACAO', 'UNIVERSAL', 'CINZA', 1.0, 'm', 68.50, 1.8, 5.0, true, '{"nfva_m2": 0.0142, "tipo_ventilacao": "exhaust", "instalacao": "cumeeira", "unidade_calculo": "metro_linear", "subtipo": "cumeeira_ventilada"}');

-- Comentário sobre os produtos inseridos
COMMENT ON TABLE produtos_shingle_novo IS 'Tabela de produtos shingle incluindo acessórios de ventilação com dados de NFVA (Net Free Ventilating Area)';

-- Adicionar índice para facilitar consultas por tipo de ventilação
CREATE INDEX IF NOT EXISTS idx_produtos_shingle_ventilacao_subtipo 
ON produtos_shingle_novo ((especificacoes_tecnicas->>'subtipo'))
WHERE tipo_componente = 'VENTILACAO';