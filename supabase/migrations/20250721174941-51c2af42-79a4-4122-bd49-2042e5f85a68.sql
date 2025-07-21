
-- Atualizar função calcular_por_mapeamento para incluir lógica condicional
DROP FUNCTION IF EXISTS public.calcular_por_mapeamento(text, numeric, jsonb);

CREATE OR REPLACE FUNCTION public.calcular_por_mapeamento(
  p_tipo_proposta text, 
  p_area_base numeric, 
  p_dados_extras jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(
  composicao_id uuid, 
  composicao_nome text, 
  composicao_codigo text, 
  categoria text, 
  item_id uuid, 
  item_codigo text, 
  item_descricao text, 
  consumo_por_m2 numeric, 
  area_aplicacao numeric, 
  fator_aplicacao numeric, 
  quantidade_liquida numeric, 
  quantidade_com_quebra numeric, 
  preco_unitario numeric, 
  valor_total numeric, 
  ordem_calculo integer, 
  obrigatorio boolean
)
LANGUAGE plpgsql
AS $function$
DECLARE
  v_area_calculada NUMERIC;
  v_perimetro_telhado NUMERIC;
  v_comprimento_cumeeira NUMERIC;
  v_comprimento_espigao NUMERIC;
  v_comprimento_agua_furtada NUMERIC;
BEGIN
  -- Área pode ser ajustada por dados extras
  v_area_calculada := p_area_base;
  
  -- Extrair dados extras específicos
  v_perimetro_telhado := COALESCE((p_dados_extras->>'perimetro_telhado')::numeric, 0);
  v_comprimento_cumeeira := COALESCE((p_dados_extras->>'comprimento_cumeeira')::numeric, 0);
  v_comprimento_espigao := COALESCE((p_dados_extras->>'comprimento_espigao')::numeric, 0);
  v_comprimento_agua_furtada := COALESCE((p_dados_extras->>'comprimento_agua_furtada')::numeric, 0);
  
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
        WHEN pm.categoria = 'STARTER_SHINGLE' OR (ic.tipo_calculo = 'customizado' AND pm.codigo = '10471') THEN v_perimetro_telhado
        -- Para CAP DE CUMEEIRA na cumeeira
        WHEN pm.categoria = 'ACESSORIOS_SHINGLE' AND pm.codigo = '10472' AND ic.tipo_calculo = 'customizado' AND v_comprimento_cumeeira > 0 THEN v_comprimento_cumeeira
        -- Para CAP DE CUMEEIRA no espigão
        WHEN pm.categoria = 'ACESSORIOS_SHINGLE' AND pm.codigo = '10472' AND ic.tipo_calculo = 'customizado' AND v_comprimento_espigao > 0 THEN v_comprimento_espigao
        -- Para FITA AUTOADESIVA na água furtada
        WHEN pm.categoria = 'ACESSORIOS_SHINGLE' AND pm.codigo = '15600' AND ic.tipo_calculo = 'customizado' THEN v_comprimento_agua_furtada
        -- Cálculo padrão por área
        ELSE v_area_calculada * m.fator_aplicacao
      END as area_aplicacao,
      m.fator_aplicacao,
      CASE 
        -- Cálculo customizado para STARTER baseado no perímetro
        WHEN pm.categoria = 'STARTER_SHINGLE' AND v_perimetro_telhado > 0 THEN 
          CEILING(v_perimetro_telhado / 23)
        -- Cálculo customizado para CAP DE CUMEEIRA baseado na cumeeira
        WHEN pm.categoria = 'ACESSORIOS_SHINGLE' AND pm.codigo = '10472' AND v_comprimento_cumeeira > 0 THEN 
          CEILING(v_comprimento_cumeeira / 5)
        -- Cálculo customizado para CAP DE CUMEEIRA baseado no espigão
        WHEN pm.categoria = 'ACESSORIOS_SHINGLE' AND pm.codigo = '10472' AND v_comprimento_espigao > 0 THEN 
          CEILING(v_comprimento_espigao / 5)
        -- Cálculo customizado para FITA AUTOADESIVA baseado na água furtada
        WHEN pm.categoria = 'ACESSORIOS_SHINGLE' AND pm.codigo = '15600' AND v_comprimento_agua_furtada > 0 THEN 
          CEILING(v_comprimento_agua_furtada / 0.9)
        -- Cálculo padrão por área
        ELSE (v_area_calculada * m.fator_aplicacao * ic.consumo_por_m2)
      END as quantidade_liquida,
      CASE 
        -- Para produtos customizados, não aplicar quebra adicional (já está no CEILING)
        WHEN (pm.categoria = 'STARTER_SHINGLE' AND v_perimetro_telhado > 0) OR 
             (pm.categoria = 'ACESSORIOS_SHINGLE' AND pm.codigo = '10472' AND (v_comprimento_cumeeira > 0 OR v_comprimento_espigao > 0)) OR
             (pm.categoria = 'ACESSORIOS_SHINGLE' AND pm.codigo = '15600' AND v_comprimento_agua_furtada > 0) THEN 
          CASE 
            WHEN pm.categoria = 'STARTER_SHINGLE' THEN CEILING(v_perimetro_telhado / 23)
            WHEN pm.codigo = '10472' AND v_comprimento_cumeeira > 0 THEN CEILING(v_comprimento_cumeeira / 5)
            WHEN pm.codigo = '10472' AND v_comprimento_espigao > 0 THEN CEILING(v_comprimento_espigao / 5)
            WHEN pm.codigo = '15600' THEN CEILING(v_comprimento_agua_furtada / 0.9)
            ELSE 0
          END
        -- Cálculo padrão com quebra
        ELSE (v_area_calculada * m.fator_aplicacao * ic.consumo_por_m2 * (1 + ic.quebra_aplicada/100))
      END as quantidade_com_quebra,
      pm.preco_unitario,
      CASE 
        -- Valor para STARTER
        WHEN pm.categoria = 'STARTER_SHINGLE' AND v_perimetro_telhado > 0 THEN 
          CEILING(v_perimetro_telhado / 23) * pm.preco_unitario
        -- Valor para CAP DE CUMEEIRA (cumeeira)
        WHEN pm.categoria = 'ACESSORIOS_SHINGLE' AND pm.codigo = '10472' AND v_comprimento_cumeeira > 0 THEN 
          CEILING(v_comprimento_cumeeira / 5) * pm.preco_unitario
        -- Valor para CAP DE CUMEEIRA (espigão)
        WHEN pm.categoria = 'ACESSORIOS_SHINGLE' AND pm.codigo = '10472' AND v_comprimento_espigao > 0 THEN 
          CEILING(v_comprimento_espigao / 5) * pm.preco_unitario
        -- Valor para FITA AUTOADESIVA
        WHEN pm.categoria = 'ACESSORIOS_SHINGLE' AND pm.codigo = '15600' AND v_comprimento_agua_furtada > 0 THEN 
          CEILING(v_comprimento_agua_furtada / 0.9) * pm.preco_unitario
        -- Valor padrão
        ELSE CEIL(v_area_calculada * m.fator_aplicacao * ic.consumo_por_m2 * (1 + ic.quebra_aplicada/100)) * pm.preco_unitario
      END as valor_total,
      m.ordem_calculo,
      m.obrigatorio
    FROM mapeamentos m
    JOIN itens_composicao ic ON m.composicao_id = ic.composicao_id
    JOIN produtos_mestre pm ON ic.produto_id = pm.id
    WHERE pm.ativo = true
    -- LÓGICA CONDICIONAL: Filtrar produtos baseado nas dimensões informadas
    AND (
      -- Sempre incluir produtos que não são CAP DE CUMEEIRA nem FITA AUTOADESIVA
      (pm.codigo NOT IN ('10472', '15600'))
      OR
      -- Incluir CAP DE CUMEEIRA apenas se houver cumeeira OU espigão
      (pm.codigo = '10472' AND (v_comprimento_cumeeira > 0 OR v_comprimento_espigao > 0))
      OR
      -- Incluir FITA AUTOADESIVA apenas se houver água furtada
      (pm.codigo = '15600' AND v_comprimento_agua_furtada > 0)
    )
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
