
-- Adicionar campos para gerenciamento de fórmulas de cálculo
ALTER TABLE itens_composicao 
ADD COLUMN tipo_calculo TEXT DEFAULT 'direto' CHECK (tipo_calculo IN ('direto', 'rendimento', 'customizado')),
ADD COLUMN formula_customizada TEXT,
ADD COLUMN observacoes_calculo TEXT;

-- Comentar as colunas para documentação
COMMENT ON COLUMN itens_composicao.tipo_calculo IS 'Tipo de cálculo: direto (consumo*preço), rendimento (preço/rendimento), customizado (fórmula própria)';
COMMENT ON COLUMN itens_composicao.formula_customizada IS 'Fórmula customizada usando variáveis: {preco}, {consumo}, {quebra}, {fator}, {rendimento}';
COMMENT ON COLUMN itens_composicao.observacoes_calculo IS 'Observações sobre o cálculo específico deste item';

-- Corrigir o item específico do Shingle Supreme (produto 10420) se existir
UPDATE itens_composicao 
SET 
  consumo_por_m2 = 1.0,
  tipo_calculo = 'rendimento',
  observacoes_calculo = 'Produto vendido por pacote com rendimento de 3.1m² - corrigido automaticamente'
WHERE produto_id IN (
  SELECT id FROM produtos_mestre 
  WHERE codigo = '10420' AND descricao ILIKE '%SHINGLE%SUPREME%'
);
