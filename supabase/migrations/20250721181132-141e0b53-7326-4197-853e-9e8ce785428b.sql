
-- Verificar os valores atuais da Fita Autoadesiva
SELECT 
    pm.codigo,
    pm.descricao,
    pm.preco_unitario,
    ic.consumo_por_m2,
    ic.valor_por_m2,
    cm.nome as composicao_nome
FROM produtos_mestre pm
JOIN itens_composicao ic ON pm.id = ic.produto_id
JOIN composicoes_mestre cm ON ic.composicao_id = cm.id
WHERE pm.codigo = '15600'
ORDER BY cm.nome;

-- Corrigir o preço da Fita Autoadesiva para Água Furtada (valor muito alto)
UPDATE produtos_mestre 
SET preco_unitario = 45.80
WHERE codigo = '15600' AND preco_unitario > 100;

-- Recalcular as composições que usam este produto
UPDATE composicoes_mestre 
SET valor_total_m2 = (
    SELECT COALESCE(SUM(ic.valor_por_m2), 0)
    FROM itens_composicao ic 
    WHERE ic.composicao_id = composicoes_mestre.id
)
WHERE id IN (
    SELECT DISTINCT composicao_id 
    FROM itens_composicao ic
    JOIN produtos_mestre pm ON ic.produto_id = pm.id
    WHERE pm.codigo = '15600'
);

-- Verificar se há outros produtos com preços suspeitos
SELECT * FROM auditar_precos_suspeitos();
