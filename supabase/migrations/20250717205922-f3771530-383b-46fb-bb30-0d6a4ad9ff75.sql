-- FASE 1: Correção urgente do preço do TYVEK
-- Corrigir o preço do produto SUBCOBERTURA TYVEK PROTEC 120
UPDATE produtos_mestre 
SET preco_unitario = 45.00,
    updated_at = NOW()
WHERE codigo = 'TYVEK-PROTEC-120' OR 
      descricao ILIKE '%SUBCOBERTURA TYVEK PROTEC 120%' OR
      codigo ILIKE '%TYVEK%PROTEC%';

-- Recalcular automaticamente as composições que usam TYVEK
-- Atualizar as composições 1.16 e 1.17 (Shingle) que foram afetadas
SELECT recalcular_composicao(id) 
FROM composicoes_mestre 
WHERE codigo IN ('1.16', '1.17') OR 
      nome ILIKE '%SHINGLE%' OR 
      descricao ILIKE '%TYVEK%';

-- Criar função para auditoria de preços suspeitos
CREATE OR REPLACE FUNCTION auditar_precos_suspeitos()
RETURNS TABLE(
    produto_id UUID,
    codigo TEXT,
    descricao TEXT,
    categoria TEXT,
    preco_unitario NUMERIC,
    motivo TEXT
) AS $$
BEGIN
    -- Produtos com preços muito altos (acima de R$ 1000)
    RETURN QUERY
    SELECT 
        pm.id,
        pm.codigo,
        pm.descricao,
        pm.categoria,
        pm.preco_unitario,
        'Preço muito alto (>R$ 1000)' as motivo
    FROM produtos_mestre pm
    WHERE pm.preco_unitario > 1000 AND pm.ativo = true;
    
    -- Produtos com preços zerados
    RETURN QUERY
    SELECT 
        pm.id,
        pm.codigo,
        pm.descricao,
        pm.categoria,
        pm.preco_unitario,
        'Preço zerado' as motivo
    FROM produtos_mestre pm
    WHERE pm.preco_unitario = 0 AND pm.ativo = true;
    
    -- Produtos TYVEK com preços acima de R$ 100
    RETURN QUERY
    SELECT 
        pm.id,
        pm.codigo,
        pm.descricao,
        pm.categoria,
        pm.preco_unitario,
        'TYVEK com preço suspeito' as motivo
    FROM produtos_mestre pm
    WHERE pm.preco_unitario > 100 
    AND pm.ativo = true
    AND (pm.codigo ILIKE '%TYVEK%' OR pm.descricao ILIKE '%TYVEK%');
END;
$$ LANGUAGE plpgsql;

-- Criar função para listar composições sem itens detalhados
CREATE OR REPLACE FUNCTION composicoes_sem_itens()
RETURNS TABLE(
    composicao_id UUID,
    codigo TEXT,
    nome TEXT,
    categoria TEXT,
    valor_total_m2 NUMERIC,
    total_itens INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cm.id,
        cm.codigo,
        cm.nome,
        cm.categoria,
        cm.valor_total_m2,
        COUNT(ic.id)::INTEGER as total_itens
    FROM composicoes_mestre cm
    LEFT JOIN itens_composicao ic ON cm.id = ic.composicao_id
    WHERE cm.ativo = true
    GROUP BY cm.id, cm.codigo, cm.nome, cm.categoria, cm.valor_total_m2
    HAVING COUNT(ic.id) = 0
    ORDER BY cm.codigo;
END;
$$ LANGUAGE plpgsql;

-- Criar função para validar consistência de composições
CREATE OR REPLACE FUNCTION validar_composicoes()
RETURNS TABLE(
    composicao_id UUID,
    codigo TEXT,
    nome TEXT,
    valor_registrado NUMERIC,
    valor_calculado NUMERIC,
    diferenca NUMERIC,
    status_validacao TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH composicoes_calculadas AS (
        SELECT 
            cm.id,
            cm.codigo,
            cm.nome,
            cm.valor_total_m2 as valor_registrado,
            COALESCE(SUM(ic.valor_por_m2), 0) as valor_calculado
        FROM composicoes_mestre cm
        LEFT JOIN itens_composicao ic ON cm.id = ic.composicao_id
        WHERE cm.ativo = true
        GROUP BY cm.id, cm.codigo, cm.nome, cm.valor_total_m2
    )
    SELECT 
        cc.id,
        cc.codigo,
        cc.nome,
        cc.valor_registrado,
        cc.valor_calculado,
        ABS(cc.valor_registrado - cc.valor_calculado) as diferenca,
        CASE 
            WHEN cc.valor_calculado = 0 THEN 'SEM_ITENS'
            WHEN ABS(cc.valor_registrado - cc.valor_calculado) < 0.01 THEN 'OK'
            WHEN ABS(cc.valor_registrado - cc.valor_calculado) < 1.00 THEN 'DIFERENCA_PEQUENA'
            ELSE 'DIFERENCA_GRANDE'
        END as status_validacao
    FROM composicoes_calculadas cc
    ORDER BY diferenca DESC;
END;
$$ LANGUAGE plpgsql;