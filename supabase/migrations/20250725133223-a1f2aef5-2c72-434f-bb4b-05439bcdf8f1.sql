-- 1. DESATIVAR TABELAS OBSOLETAS
-- Marcar produtos nas tabelas obsoletas como inativos
UPDATE telhas_shingle SET ativo = false WHERE ativo = true;
UPDATE produtos_shingle_completos SET ativo = false WHERE ativo = true;
UPDATE produtos_shingle_novo SET ativo = false WHERE ativo = true;

-- 2. CORRIGIR FUNÇÃO calcular_por_mapeamento 
-- A função já está com a lógica correta, mas vamos revisar os consumos na tabela itens_composicao

-- 3. CORRIGIR CONSUMOS EXCESSIVOS NA COMPOSIÇÃO
-- Verificar e corrigir produtos com consumo_por_m2 incorreto

-- STARTER SHINGLE (10471): Deve ser calculado por perímetro, não área
-- O consumo deve ser 1 para que o cálculo perímetro/23 funcione corretamente
UPDATE itens_composicao 
SET consumo_por_m2 = 1.0
WHERE produto_id IN (
  SELECT id FROM produtos_mestre 
  WHERE codigo = '10471'
) AND consumo_por_m2 != 1.0;

-- PREGO ROLO: Reduzir consumo excessivo (estava causando 4000+ unidades)
-- Assumindo 1 rolo por 100m² de telhado
UPDATE itens_composicao 
SET consumo_por_m2 = 0.01 
WHERE produto_id IN (
  SELECT id FROM produtos_mestre 
  WHERE codigo LIKE '%PREGO%' AND descricao ILIKE '%ROLO%'
) AND consumo_por_m2 > 0.1;

-- GRAMPO MAKITA: Reduzir consumo excessivo 
-- Assumindo consumo razoável para grampos
UPDATE itens_composicao 
SET consumo_por_m2 = 0.1
WHERE produto_id IN (
  SELECT id FROM produtos_mestre 
  WHERE descricao ILIKE '%GRAMPO%MAKITA%'
) AND consumo_por_m2 > 1.0;

-- TYVEK: Verificar se consumo 1.0 está correto (parece razoável para manta por m²)
-- Mantendo como está por enquanto

-- 4. ADICIONAR FITA AUTOADESIVA (15600) na lista de produtos customizados se necessário
-- Verificar se existe o produto
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM produtos_mestre WHERE codigo = '15600') THEN
    -- Garantir que o consumo está correto para fita autoadesiva
    UPDATE itens_composicao 
    SET consumo_por_m2 = 1.0
    WHERE produto_id IN (
      SELECT id FROM produtos_mestre WHERE codigo = '15600'
    ) AND consumo_por_m2 != 1.0;
  END IF;
END $$;

-- 5. VERIFICAR E CORRIGIR QUEBRAS PADRÃO
-- Garantir quebras razoáveis (5-15%)
UPDATE itens_composicao 
SET quebra_aplicada = 10.0 
WHERE quebra_aplicada > 50.0;

-- 6. CRIAR ÍNDICES PARA PERFORMANCE (se não existirem)
CREATE INDEX IF NOT EXISTS idx_produtos_mestre_codigo ON produtos_mestre(codigo);
CREATE INDEX IF NOT EXISTS idx_itens_composicao_produto_id ON itens_composicao(produto_id);

-- 7. VERIFICAR DADOS INCONSISTENTES
-- Listar produtos com consumo muito alto para revisão
SELECT 
  pm.codigo,
  pm.descricao,
  ic.consumo_por_m2,
  ic.quebra_aplicada,
  cm.nome as composicao
FROM itens_composicao ic
JOIN produtos_mestre pm ON ic.produto_id = pm.id
JOIN composicoes_mestre cm ON ic.composicao_id = cm.id
WHERE ic.consumo_por_m2 > 5.0 
ORDER BY ic.consumo_por_m2 DESC;