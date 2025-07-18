
-- CORREÇÃO COMPLETA E FORÇADA DOS VALORES UNITÁRIOS
-- Baseado na análise do manual e identificação de erros críticos

-- 1. CORREÇÃO FORÇADA: Atualizar TODOS os valor_unitario incorretos
UPDATE itens_composicao 
SET valor_unitario = pm.preco_unitario / pm.quantidade_embalagem,
    valor_por_m2 = consumo_por_m2 * (pm.preco_unitario / pm.quantidade_embalagem) * (1 + quebra_aplicada/100) * fator_correcao,
    updated_at = NOW()
FROM produtos_mestre pm
WHERE itens_composicao.produto_id = pm.id
AND ABS(itens_composicao.valor_unitario - (pm.preco_unitario / pm.quantidade_embalagem)) > 0.01;

-- 2. CORREÇÃO ESPECÍFICA: OSB 11,1mm (produto crítico para Shingle)
UPDATE itens_composicao 
SET valor_unitario = CASE 
    WHEN pm.quantidade_embalagem > 0 THEN pm.preco_unitario / pm.quantidade_embalagem
    ELSE pm.preco_unitario
END,
valor_por_m2 = consumo_por_m2 * 
    CASE 
        WHEN pm.quantidade_embalagem > 0 THEN pm.preco_unitario / pm.quantidade_embalagem
        ELSE pm.preco_unitario
    END * (1 + quebra_aplicada/100) * fator_correcao,
updated_at = NOW()
FROM produtos_mestre pm
WHERE itens_composicao.produto_id = pm.id
AND (pm.codigo ILIKE '%OSB%' OR pm.descricao ILIKE '%OSB%');

-- 3. CORREÇÃO ESPECÍFICA: Telhas Shingle
UPDATE itens_composicao 
SET valor_unitario = CASE 
    WHEN pm.quantidade_embalagem > 0 THEN pm.preco_unitario / pm.quantidade_embalagem
    ELSE pm.preco_unitario
END,
valor_por_m2 = consumo_por_m2 * 
    CASE 
        WHEN pm.quantidade_embalagem > 0 THEN pm.preco_unitario / pm.quantidade_embalagem
        ELSE pm.preco_unitario
    END * (1 + quebra_aplicada/100) * fator_correcao,
updated_at = NOW()
FROM produtos_mestre pm
WHERE itens_composicao.produto_id = pm.id
AND (pm.codigo ILIKE '%SHINGLE%' OR pm.descricao ILIKE '%SHINGLE%' OR pm.descricao ILIKE '%TELHA%');

-- 4. RECALCULAR TODAS AS COMPOSIÇÕES SHINGLE
SELECT recalcular_composicao(id) 
FROM composicoes_mestre 
WHERE codigo IN ('1.16', '1.17') 
   OR nome ILIKE '%SHINGLE%' 
   OR descricao ILIKE '%SHINGLE%'
   OR categoria = 'COBERTURAS';

-- 5. CRIAR FUNÇÃO DE VALIDAÇÃO AUTOMÁTICA
CREATE OR REPLACE FUNCTION validar_valores_unitarios()
RETURNS TABLE(
    produto_codigo TEXT,
    produto_descricao TEXT,
    valor_unitario_atual NUMERIC,
    valor_unitario_correto NUMERIC,
    diferenca_percentual NUMERIC,
    status_validacao TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pm.codigo,
        pm.descricao,
        ic.valor_unitario,
        CASE 
            WHEN pm.quantidade_embalagem > 0 THEN pm.preco_unitario / pm.quantidade_embalagem
            ELSE pm.preco_unitario
        END as valor_correto,
        CASE 
            WHEN pm.quantidade_embalagem > 0 AND pm.preco_unitario > 0 THEN 
                ABS((ic.valor_unitario - (pm.preco_unitario / pm.quantidade_embalagem)) / (pm.preco_unitario / pm.quantidade_embalagem)) * 100
            ELSE 0
        END as diferenca_percentual,
        CASE 
            WHEN pm.quantidade_embalagem = 0 THEN 'SEM_EMBALAGEM'
            WHEN ABS(ic.valor_unitario - (pm.preco_unitario / pm.quantidade_embalagem)) < 0.01 THEN 'OK'
            WHEN ABS(ic.valor_unitario - (pm.preco_unitario / pm.quantidade_embalagem)) < 1.00 THEN 'DIFERENCA_PEQUENA'
            ELSE 'DIFERENCA_CRITICA'
        END as status_validacao
    FROM itens_composicao ic
    JOIN produtos_mestre pm ON ic.produto_id = pm.id
    WHERE pm.ativo = true
    ORDER BY diferenca_percentual DESC;
END;
$$ LANGUAGE plpgsql;

-- 6. CRIAR FUNÇÃO DE VALIDAÇÃO DE COMPOSIÇÕES vs MANUAL
CREATE OR REPLACE FUNCTION validar_composicoes_vs_manual()
RETURNS TABLE(
    codigo_composicao TEXT,
    nome_composicao TEXT,
    valor_atual NUMERIC,
    valor_esperado_manual NUMERIC,
    diferenca_percentual NUMERIC,
    status_conformidade TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cm.codigo,
        cm.nome,
        cm.valor_total_m2,
        CASE 
            WHEN cm.codigo = '1.16' THEN 215.53  -- Shingle Supreme conforme manual
            WHEN cm.codigo = '1.17' THEN 185.00  -- Estimativa Oakridge
            WHEN cm.codigo = '1.01' THEN 90.91   -- OSB conforme manual
            WHEN cm.codigo = '1.10' THEN 29.87   -- Drywall ST conforme manual
            WHEN cm.codigo = '1.20' THEN 52.70   -- Impermeabilização conforme manual
            ELSE cm.valor_total_m2
        END as valor_manual,
        CASE 
            WHEN cm.codigo IN ('1.16', '1.17', '1.01', '1.10', '1.20') THEN
                ABS((cm.valor_total_m2 - 
                    CASE 
                        WHEN cm.codigo = '1.16' THEN 215.53
                        WHEN cm.codigo = '1.17' THEN 185.00
                        WHEN cm.codigo = '1.01' THEN 90.91
                        WHEN cm.codigo = '1.10' THEN 29.87
                        WHEN cm.codigo = '1.20' THEN 52.70
                    END) / 
                    CASE 
                        WHEN cm.codigo = '1.16' THEN 215.53
                        WHEN cm.codigo = '1.17' THEN 185.00
                        WHEN cm.codigo = '1.01' THEN 90.91
                        WHEN cm.codigo = '1.10' THEN 29.87
                        WHEN cm.codigo = '1.20' THEN 52.70
                    END) * 100
            ELSE 0
        END as diferenca_percentual,
        CASE 
            WHEN cm.codigo NOT IN ('1.16', '1.17', '1.01', '1.10', '1.20') THEN 'NAO_VERIFICADO'
            WHEN cm.codigo IN ('1.16', '1.17', '1.01', '1.10', '1.20') AND
                 ABS(cm.valor_total_m2 - 
                    CASE 
                        WHEN cm.codigo = '1.16' THEN 215.53
                        WHEN cm.codigo = '1.17' THEN 185.00
                        WHEN cm.codigo = '1.01' THEN 90.91
                        WHEN cm.codigo = '1.10' THEN 29.87
                        WHEN cm.codigo = '1.20' THEN 52.70
                    END) < 5.00 THEN 'CONFORME'
            WHEN cm.codigo IN ('1.16', '1.17', '1.01', '1.10', '1.20') AND
                 ABS(cm.valor_total_m2 - 
                    CASE 
                        WHEN cm.codigo = '1.16' THEN 215.53
                        WHEN cm.codigo = '1.17' THEN 185.00
                        WHEN cm.codigo = '1.01' THEN 90.91
                        WHEN cm.codigo = '1.10' THEN 29.87
                        WHEN cm.codigo = '1.20' THEN 52.70
                    END) < 20.00 THEN 'DIVERGENCIA_PEQUENA'
            ELSE 'DIVERGENCIA_CRITICA'
        END as status_conformidade
    FROM composicoes_mestre cm
    WHERE cm.ativo = true
    ORDER BY diferenca_percentual DESC;
END;
$$ LANGUAGE plpgsql;

-- 7. EXECUTAR RECÁLCULO GERAL DE TODAS AS COMPOSIÇÕES ATIVAS
UPDATE composicoes_mestre 
SET valor_total_m2 = (
    SELECT COALESCE(SUM(ic.valor_por_m2), 0)
    FROM itens_composicao ic 
    WHERE ic.composicao_id = composicoes_mestre.id
),
updated_at = NOW()
WHERE ativo = true;

-- 8. CRIAR TRIGGER MELHORADO PARA SINCRONIZAÇÃO AUTOMÁTICA
CREATE OR REPLACE FUNCTION sincronizar_valores_composicao()
RETURNS TRIGGER AS $$
BEGIN
    -- Se mudou preço ou quantidade de embalagem, recalcular valor_unitario
    IF TG_OP = 'UPDATE' AND (NEW.preco_unitario != OLD.preco_unitario OR NEW.quantidade_embalagem != OLD.quantidade_embalagem) THEN
        UPDATE itens_composicao 
        SET valor_unitario = CASE 
                WHEN NEW.quantidade_embalagem > 0 THEN NEW.preco_unitario / NEW.quantidade_embalagem
                ELSE NEW.preco_unitario
            END,
            valor_por_m2 = consumo_por_m2 * 
                CASE 
                    WHEN NEW.quantidade_embalagem > 0 THEN NEW.preco_unitario / NEW.quantidade_embalagem
                    ELSE NEW.preco_unitario
                END * (1 + quebra_aplicada/100) * fator_correcao,
            updated_at = NOW()
        WHERE produto_id = NEW.id;
        
        -- Recalcular todas as composições que usam este produto
        PERFORM recalcular_composicao(composicao_id)
        FROM itens_composicao 
        WHERE produto_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger antigo e aplicar o melhorado
DROP TRIGGER IF EXISTS trigger_sincronizar_precos ON produtos_mestre;
CREATE TRIGGER trigger_sincronizar_valores
    AFTER UPDATE ON produtos_mestre
    FOR EACH ROW
    EXECUTE FUNCTION sincronizar_valores_composicao();
