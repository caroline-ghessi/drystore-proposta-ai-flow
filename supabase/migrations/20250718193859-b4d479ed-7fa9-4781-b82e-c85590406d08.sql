
-- 1. Cadastrar o produto STARTER TELHA SHINGLE na tabela produtos_mestre
INSERT INTO produtos_mestre (
    codigo,
    descricao,
    categoria,
    aplicacao,
    unidade_medida,
    quantidade_embalagem,
    preco_unitario,
    quebra_padrao,
    ativo
) VALUES (
    '10471',
    'STARTER TELHA SHINGLE',
    'STARTER_SHINGLE',
    'Primeira linha de telhas shingle para vedação do perímetro',
    'm',
    23.0,
    256.90,
    0.0,
    true
);

-- 2. Cadastrar o mesmo produto na tabela produtos_shingle_completos
INSERT INTO produtos_shingle_completos (
    tipo_componente,
    codigo,
    linha,
    descricao,
    cor,
    unidade_medida,
    conteudo_unidade,
    quebra_padrao,
    preco_unitario,
    peso_unitario,
    especificacoes_tecnicas,
    ativo
) VALUES (
    'STARTER',
    '10471',
    'UNIVERSAL',
    'STARTER TELHA SHINGLE',
    NULL,
    'm',
    23.0,
    0.0,
    256.90,
    15.0,
    '{"rendimento_ml": 23, "aplicacao": "perimetro_telhado", "tipo_calculo": "perimetro"}',
    true
);

-- 3. Buscar os IDs das composições de telhas shingle para adicionar o starter
-- Primeiro vamos adicionar o starter na composição Supreme (1.16)
INSERT INTO itens_composicao (
    composicao_id,
    produto_id,
    consumo_por_m2,
    quebra_aplicada,
    fator_correcao,
    valor_unitario,
    valor_por_m2,
    ordem,
    tipo_calculo,
    formula_customizada,
    observacoes_calculo
) 
SELECT 
    cm.id as composicao_id,
    pm.id as produto_id,
    0.0 as consumo_por_m2,
    0.0 as quebra_aplicada,
    1.0 as fator_correcao,
    256.90 as valor_unitario,
    0.0 as valor_por_m2,
    2 as ordem,
    'customizado' as tipo_calculo,
    'CEILING({perimetro_telhado} / 23) * {preco_unitario}' as formula_customizada,
    'Produto calculado por perímetro do telhado (23ml/pacote)' as observacoes_calculo
FROM composicoes_mestre cm, produtos_mestre pm
WHERE cm.codigo = '1.16' 
AND pm.codigo = '10471'
AND NOT EXISTS (
    SELECT 1 FROM itens_composicao ic 
    WHERE ic.composicao_id = cm.id AND ic.produto_id = pm.id
);

-- 4. Adicionar o starter na composição Oakridge (1.17)
INSERT INTO itens_composicao (
    composicao_id,
    produto_id,
    consumo_por_m2,
    quebra_aplicada,
    fator_correcao,
    valor_unitario,
    valor_por_m2,
    ordem,
    tipo_calculo,
    formula_customizada,
    observacoes_calculo
) 
SELECT 
    cm.id as composicao_id,
    pm.id as produto_id,
    0.0 as consumo_por_m2,
    0.0 as quebra_aplicada,
    1.0 as fator_correcao,
    256.90 as valor_unitario,
    0.0 as valor_por_m2,
    2 as ordem,
    'customizado' as tipo_calculo,
    'CEILING({perimetro_telhado} / 23) * {preco_unitario}' as formula_customizada,
    'Produto calculado por perímetro do telhado (23ml/pacote)' as observacoes_calculo
FROM composicoes_mestre cm, produtos_mestre pm
WHERE cm.codigo = '1.17' 
AND pm.codigo = '10471'
AND NOT EXISTS (
    SELECT 1 FROM itens_composicao ic 
    WHERE ic.composicao_id = cm.id AND ic.produto_id = pm.id
);

-- 5. Atualizar a função calcular_por_mapeamento para suportar cálculo por perímetro
CREATE OR REPLACE FUNCTION public.calcular_por_mapeamento(p_tipo_proposta text, p_area_base numeric, p_dados_extras jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(composicao_id uuid, composicao_nome text, composicao_codigo text, categoria text, item_id uuid, item_codigo text, item_descricao text, consumo_por_m2 numeric, area_aplicacao numeric, fator_aplicacao numeric, quantidade_liquida numeric, quantidade_com_quebra numeric, preco_unitario numeric, valor_total numeric, ordem_calculo integer, obrigatorio boolean)
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_area_calculada NUMERIC;
  v_perimetro_telhado NUMERIC;
BEGIN
  -- Área pode ser ajustada por dados extras
  v_area_calculada := p_area_base;
  
  -- Extrair perímetro do telhado dos dados extras
  v_perimetro_telhado := COALESCE((p_dados_extras->>'perimetro_telhado')::numeric, 0);
  
  RETURN QUERY
  WITH mapeamentos AS (
    SELECT 
      tpc.composicao_id,
      tpc.fator_aplicacao,
      tpc.ordem_calculo,
      tpc.obrigatorio,
      cm.nome as composicao_nome,
      cm.codigo as composicao_codigo,
      cm.categoria
    FROM tipo_proposta_composicoes tpc
    JOIN composicoes_mestre cm ON tpc.composicao_id = cm.id
    WHERE tpc.tipo_proposta = p_tipo_proposta 
    AND tpc.ativo = true
    AND cm.ativo = true
    ORDER BY tpc.ordem_calculo
  ),
  calculos AS (
    SELECT 
      m.composicao_id,
      m.composicao_nome,
      m.composicao_codigo,
      m.categoria,
      ic.produto_id as item_id,
      pm.codigo as item_codigo,
      pm.descricao as item_descricao,
      ic.consumo_por_m2,
      CASE 
        -- Para produtos STARTER, usar perímetro
        WHEN pm.categoria = 'STARTER_SHINGLE' OR ic.tipo_calculo = 'customizado' THEN v_perimetro_telhado
        ELSE v_area_calculada * m.fator_aplicacao
      END as area_aplicacao,
      m.fator_aplicacao,
      CASE 
        -- Cálculo customizado para STARTER baseado no perímetro
        WHEN pm.categoria = 'STARTER_SHINGLE' AND v_perimetro_telhado > 0 THEN 
          CEILING(v_perimetro_telhado / 23)
        -- Cálculo padrão por área
        ELSE (v_area_calculada * m.fator_aplicacao * ic.consumo_por_m2)
      END as quantidade_liquida,
      CASE 
        -- Para STARTER, não aplicar quebra adicional (já está no CEILING)
        WHEN pm.categoria = 'STARTER_SHINGLE' AND v_perimetro_telhado > 0 THEN 
          CEILING(v_perimetro_telhado / 23)
        -- Cálculo padrão com quebra
        ELSE (v_area_calculada * m.fator_aplicacao * ic.consumo_por_m2 * (1 + ic.quebra_aplicada/100))
      END as quantidade_com_quebra,
      pm.preco_unitario,
      CASE 
        -- Valor para STARTER
        WHEN pm.categoria = 'STARTER_SHINGLE' AND v_perimetro_telhado > 0 THEN 
          CEILING(v_perimetro_telhado / 23) * pm.preco_unitario
        -- Valor padrão
        ELSE CEIL(v_area_calculada * m.fator_aplicacao * ic.consumo_por_m2 * (1 + ic.quebra_aplicada/100)) * pm.preco_unitario
      END as valor_total,
      m.ordem_calculo,
      m.obrigatorio
    FROM mapeamentos m
    JOIN itens_composicao ic ON m.composicao_id = ic.composicao_id
    JOIN produtos_mestre pm ON ic.produto_id = pm.id
    WHERE pm.ativo = true
  )
  SELECT 
    c.composicao_id,
    c.composicao_nome,
    c.composicao_codigo,
    c.categoria,
    c.item_id,
    c.item_codigo,
    c.item_descricao,
    c.consumo_por_m2,
    c.area_aplicacao,
    c.fator_aplicacao,
    c.quantidade_liquida,
    c.quantidade_com_quebra,
    c.preco_unitario,
    c.valor_total,
    c.ordem_calculo,
    c.obrigatorio
  FROM calculos c
  ORDER BY c.ordem_calculo, c.composicao_nome;
END;
$function$;
