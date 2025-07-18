
-- CORREÇÃO URGENTE DOS PREÇOS DAS COMPOSIÇÕES SHINGLE
-- Problema identificado: valor_unitario do TYVEK está R$ 1.533,60 em vez de R$ 0,489

-- 1. Corrigir o valor_unitario do TYVEK nos itens_composicao
UPDATE itens_composicao 
SET valor_unitario = 0.489,
    valor_por_m2 = consumo_por_m2 * 0.489 * (1 + quebra_aplicada/100) * fator_correcao,
    updated_at = NOW()
WHERE produto_id = (
    SELECT id FROM produtos_mestre 
    WHERE codigo = 'TYVEK-PROTEC-120' OR 
          descricao ILIKE '%SUBCOBERTURA TYVEK PROTEC 120%'
    LIMIT 1
);

-- 2. Recalcular automaticamente as composições afetadas
SELECT recalcular_composicao(id) 
FROM composicoes_mestre 
WHERE codigo IN ('1.16', '1.17') OR 
      nome ILIKE '%SHINGLE%';

-- 3. Criar trigger para calcular valor_unitario automaticamente baseado no produto_mestre
CREATE OR REPLACE FUNCTION calcular_valor_unitario_automatico()
RETURNS TRIGGER AS $$
BEGIN
    -- Buscar o preço unitário do produto mestre
    SELECT preco_unitario / quantidade_embalagem INTO NEW.valor_unitario
    FROM produtos_mestre 
    WHERE id = NEW.produto_id;
    
    -- Recalcular valor_por_m2
    NEW.valor_por_m2 := NEW.consumo_por_m2 * NEW.valor_unitario * (1 + NEW.quebra_aplicada/100) * NEW.fator_correcao;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nos itens_composicao
DROP TRIGGER IF EXISTS trigger_calcular_valor_unitario ON itens_composicao;
CREATE TRIGGER trigger_calcular_valor_unitario
    BEFORE INSERT OR UPDATE ON itens_composicao
    FOR EACH ROW
    EXECUTE FUNCTION calcular_valor_unitario_automatico();

-- 4. Criar função para sincronizar alterações do produtos_mestre
CREATE OR REPLACE FUNCTION sincronizar_precos_composicao()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar valor_unitario em itens_composicao quando produto_mestre mudar
    UPDATE itens_composicao 
    SET valor_unitario = NEW.preco_unitario / NEW.quantidade_embalagem,
        valor_por_m2 = consumo_por_m2 * (NEW.preco_unitario / NEW.quantidade_embalagem) * (1 + quebra_aplicada/100) * fator_correcao,
        updated_at = NOW()
    WHERE produto_id = NEW.id;
    
    -- Recalcular todas as composições que usam este produto
    PERFORM recalcular_composicao(composicao_id)
    FROM itens_composicao 
    WHERE produto_id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger no produtos_mestre
DROP TRIGGER IF EXISTS trigger_sincronizar_precos ON produtos_mestre;
CREATE TRIGGER trigger_sincronizar_precos
    AFTER UPDATE OF preco_unitario, quantidade_embalagem ON produtos_mestre
    FOR EACH ROW
    EXECUTE FUNCTION sincronizar_precos_composicao();

-- 5. Executar auditoria para verificar outros problemas
CREATE OR REPLACE FUNCTION relatorio_precos_composicoes()
RETURNS TABLE(
    composicao_codigo TEXT,
    composicao_nome TEXT,
    produto_codigo TEXT,
    produto_descricao TEXT,
    preco_produto NUMERIC,
    valor_unitario_composicao NUMERIC,
    diferenca_percentual NUMERIC,
    status_validacao TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cm.codigo,
        cm.nome,
        pm.codigo,
        pm.descricao,
        pm.preco_unitario,
        ic.valor_unitario,
        CASE 
            WHEN pm.preco_unitario > 0 THEN 
                ABS((ic.valor_unitario - (pm.preco_unitario / pm.quantidade_embalagem)) / (pm.preco_unitario / pm.quantidade_embalagem)) * 100
            ELSE 0
        END as diferenca_percentual,
        CASE 
            WHEN ABS(ic.valor_unitario - (pm.preco_unitario / pm.quantidade_embalagem)) < 0.01 THEN 'OK'
            WHEN ABS(ic.valor_unitario - (pm.preco_unitario / pm.quantidade_embalagem)) < 1.00 THEN 'DIFERENCA_PEQUENA'
            ELSE 'DIFERENCA_GRANDE'
        END as status_validacao
    FROM itens_composicao ic
    JOIN composicoes_mestre cm ON ic.composicao_id = cm.id
    JOIN produtos_mestre pm ON ic.produto_id = pm.id
    WHERE cm.ativo = true AND pm.ativo = true
    ORDER BY diferenca_percentual DESC;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar função para detectar composições com preços muito altos
CREATE OR REPLACE FUNCTION composicoes_precos_suspeitos()
RETURNS TABLE(
    codigo TEXT,
    nome TEXT,
    valor_total_m2 NUMERIC,
    categoria TEXT,
    motivo TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cm.codigo,
        cm.nome,
        cm.valor_total_m2,
        cm.categoria,
        CASE 
            WHEN cm.valor_total_m2 > 500 THEN 'Valor muito alto (>R$ 500/m²)'
            WHEN cm.valor_total_m2 > 300 AND cm.categoria = 'COBERTURAS' THEN 'Cobertura cara (>R$ 300/m²)'
            ELSE 'Outros'
        END as motivo
    FROM composicoes_mestre cm
    WHERE cm.ativo = true 
    AND (cm.valor_total_m2 > 500 OR (cm.valor_total_m2 > 300 AND cm.categoria = 'COBERTURAS'))
    ORDER BY cm.valor_total_m2 DESC;
END;
$$ LANGUAGE plpgsql;

-- 7. Executar correção final e validação
-- Forçar recálculo de todas as composições para garantir consistência
UPDATE composicoes_mestre 
SET valor_total_m2 = (
    SELECT COALESCE(SUM(ic.valor_por_m2), 0)
    FROM itens_composicao ic 
    WHERE ic.composicao_id = composicoes_mestre.id
),
updated_at = NOW()
WHERE ativo = true;
