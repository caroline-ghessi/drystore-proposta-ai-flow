
-- Atualizar os itens de composição do STARTER TELHA SHINGLE (código 10471)
-- para exibir o valor correto por m² nas composições, mantendo o produto original intacto

UPDATE itens_composicao 
SET 
    consumo_por_m2 = 1.0,
    valor_unitario = 82.66,
    valor_por_m2 = 82.66,
    tipo_calculo = 'direto',
    formula_customizada = NULL,
    observacoes_calculo = 'Equivale a 7,4ml de starter por m² (1 pacote = 23ml)'
WHERE produto_id = (
    SELECT id FROM produtos_mestre WHERE codigo = '10471'
);

-- Recalcular as composições que contém o starter
UPDATE composicoes_mestre 
SET valor_total_m2 = (
    SELECT COALESCE(SUM(valor_por_m2), 0)
    FROM itens_composicao 
    WHERE composicao_id = composicoes_mestre.id
)
WHERE id IN (
    SELECT DISTINCT composicao_id 
    FROM itens_composicao ic
    JOIN produtos_mestre pm ON ic.produto_id = pm.id
    WHERE pm.codigo = '10471'
);
