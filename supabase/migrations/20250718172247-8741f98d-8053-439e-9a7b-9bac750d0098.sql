
-- PLANO DE CORREÇÃO DAS MÚLTIPLAS TABELAS DE COMPOSIÇÕES
-- Objetivo: Padronizar para usar apenas composicoes_mestre

-- 1. CORREÇÃO CRÍTICA: Valores unitários incorretos na composicoes_mestre
-- Problema identificado: valores unitários usando preços de embalagem em vez de preços por unidade

-- Forçar recálculo correto dos valores unitários baseado na fórmula:
-- valor_unitario = preco_unitario / quantidade_embalagem
UPDATE itens_composicao 
SET valor_unitario = CASE 
    WHEN pm.quantidade_embalagem > 0 THEN pm.preco_unitario / pm.quantidade_embalagem
    ELSE pm.preco_unitario
END,
valor_por_m2 = consumo_por_m2 * 
    CASE 
        WHEN pm.quantidade_embalagem > 0 THEN pm.preco_unitario / pm.quantidade_embalagem
        ELSE pm.preco_unitario
    END * (1 + quebra_aplicada/100) * fator_correcao
FROM produtos_mestre pm
WHERE itens_composicao.produto_id = pm.id;

-- 2. Recalcular todas as composições baseadas nos novos valores unitários
UPDATE composicoes_mestre 
SET valor_total_m2 = (
    SELECT COALESCE(SUM(ic.valor_por_m2), 0)
    FROM itens_composicao ic 
    WHERE ic.composicao_id = composicoes_mestre.id
);

-- 3. ELIMINAR TABELAS REDUNDANTES
-- Excluir composicoes_shingle (15 registros não utilizados)
DROP TABLE IF EXISTS composicoes_shingle CASCADE;

-- 4. REMOVER FUNÇÕES REDUNDANTES QUE CAUSAM CONFLITO
-- Remover função que usa produtos_shingle_novo (causando preços errados)
DROP FUNCTION IF EXISTS calcular_orcamento_shingle_completo_v2(numeric, numeric, numeric, numeric, text, text, boolean, boolean);

-- Remover função antiga de shingle simples
DROP FUNCTION IF EXISTS calcular_orcamento_shingle_completo(numeric, numeric, numeric, numeric, text, text, boolean);

-- 5. GARANTIR QUE APENAS calcular_por_mapeamento seja usado
-- Esta função já existe e está correta, usar exclusivamente ela

-- 6. CRIAR TRIGGER PARA SINCRONIZAÇÃO AUTOMÁTICA (sem referenciar updated_at inexistente)
CREATE OR REPLACE FUNCTION sincronizar_composicoes_mestre()
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
                END * (1 + quebra_aplicada/100) * fator_correcao
        WHERE produto_id = NEW.id;
        
        -- Recalcular todas as composições que usam este produto
        UPDATE composicoes_mestre 
        SET valor_total_m2 = (
            SELECT COALESCE(SUM(ic.valor_por_m2), 0)
            FROM itens_composicao ic 
            WHERE ic.composicao_id = composicoes_mestre.id
        )
        WHERE id IN (
            SELECT DISTINCT composicao_id 
            FROM itens_composicao 
            WHERE produto_id = NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
DROP TRIGGER IF EXISTS trigger_sincronizar_composicoes ON produtos_mestre;
CREATE TRIGGER trigger_sincronizar_composicoes
    AFTER UPDATE ON produtos_mestre
    FOR EACH ROW
    EXECUTE FUNCTION sincronizar_composicoes_mestre();

-- 7. VALIDAÇÃO FINAL: Verificar se os valores do Shingle estão corretos
-- Esperado: Supreme (1.16) ~R$ 215/m², Oakridge (1.17) ~R$ 185/m²
SELECT 
    codigo,
    nome,
    valor_total_m2,
    CASE 
        WHEN codigo = '1.16' AND ABS(valor_total_m2 - 215.53) < 10 THEN 'CONFORME'
        WHEN codigo = '1.17' AND ABS(valor_total_m2 - 185.00) < 10 THEN 'CONFORME'
        ELSE 'DIVERGENTE'
    END as status_validacao
FROM composicoes_mestre 
WHERE codigo IN ('1.16', '1.17')
ORDER BY codigo;
