-- Corrigir função calcular_por_mapeamento para incluir produto 5298 (Cumeeira Ventilada)
-- Esta correção resolve o problema de quantidades absurdas na proposta shingle

CREATE OR REPLACE FUNCTION public.calcular_por_mapeamento(p_tipo_proposta text, p_area_base numeric, p_dados_extras jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(composicao_id uuid, composicao_nome text, composicao_codigo text, categoria text, item_id uuid, item_codigo text, item_descricao text, consumo_por_m2 numeric, area_aplicacao numeric, fator_aplicacao numeric, quantidade_liquida numeric, quantidade_com_quebra numeric, preco_unitario numeric, valor_total numeric, ordem_calculo integer, obrigatorio boolean)
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
    SELECT DISTINCT ON (cm.codigo) -- DEDUPLICAÇÃO POR CÓDIGO DA COMPOSIÇÃO
      tpc.composicao_id,
      tpc.fator_aplicacao,
      tpc.ordem_calculo,
      tpc.obrigatorio,
      cm.nome as composicao_nome,
      cm.codigo as composicao_codigo,
      -- PADRONIZAR CATEGORIA (sempre singular, maiúscula)
      CASE 
        WHEN cm.categoria ILIKE '%COBERTURA%' THEN 'COBERTURA'
        WHEN cm.categoria ILIKE '%TELHA%' THEN 'COBERTURA'
        WHEN cm.categoria ILIKE '%ESTRUTURA%' THEN 'ESTRUTURA'
        WHEN cm.categoria ILIKE '%VEDACAO%' THEN 'VEDACAO'
        WHEN cm.categoria ILIKE '%FIXACAO%' THEN 'FIXACAO'
        ELSE UPPER(TRIM(cm.categoria))
      END as categoria
    FROM tipo_proposta_composicoes tpc
    JOIN composicoes_mestre cm ON tpc.composicao_id = cm.id
    WHERE tpc.tipo_proposta = p_tipo_proposta 
    AND tpc.ativo = true
    AND cm.ativo = true
    ORDER BY cm.codigo, tpc.ordem_calculo -- Manter o primeiro por ordem de cálculo
  ),
  produtos_unicos AS (
    SELECT DISTINCT ON (pm.codigo) -- DEDUPLICAÇÃO POR CÓDIGO DO PRODUTO
      m.composicao_id,
      m.composicao_nome,
      m.composicao_codigo,
      m.categoria,
      ic.produto_id as item_id,
      pm.codigo as item_codigo,
      pm.descricao as item_descricao,
      ic.consumo_por_m2,
      m.fator_aplicacao,
      m.ordem_calculo,
      m.obrigatorio,
      ic.quebra_aplicada,
      pm.preco_unitario,
      pm.categoria as produto_categoria,
      ic.tipo_calculo
    FROM mapeamentos m
    JOIN itens_composicao ic ON m.composicao_id = ic.composicao_id
    JOIN produtos_mestre pm ON ic.produto_id = pm.id
    WHERE pm.ativo = true
    -- LÓGICA CONDICIONAL: Filtrar produtos baseado nas dimensões informadas
    AND (
      -- Sempre incluir produtos que não são CAP DE CUMEEIRA, CUMEEIRA VENTILADA nem FITA AUTOADESIVA
      (pm.codigo NOT IN ('10472', '5298', '15600'))
      OR
      -- Incluir CAP DE CUMEEIRA apenas se houver cumeeira OU espigão
      (pm.codigo = '10472' AND (v_comprimento_cumeeira > 0 OR v_comprimento_espigao > 0))
      OR
      -- Incluir CUMEEIRA VENTILADA apenas se houver cumeeira OU espigão
      (pm.codigo = '5298' AND (v_comprimento_cumeeira > 0 OR v_comprimento_espigao > 0))
      OR
      -- Incluir FITA AUTOADESIVA apenas se houver água furtada
      (pm.codigo = '15600' AND v_comprimento_agua_furtada > 0)
    )
    ORDER BY pm.codigo, ic.ordem -- Manter o primeiro por ordem
  ),
  calculos AS (
    SELECT 
      pu.composicao_id,
      pu.composicao_nome,
      pu.composicao_codigo,
      pu.categoria,
      pu.item_id,
      pu.item_codigo,
      pu.item_descricao,
      pu.consumo_por_m2,
      CASE 
        -- Para STARTER SHINGLE (código 10471), usar perímetro
        WHEN pu.item_codigo = '10471' THEN v_perimetro_telhado
        -- Para CAP DE CUMEEIRA na cumeeira
        WHEN pu.item_codigo = '10472' AND v_comprimento_cumeeira > 0 THEN v_comprimento_cumeeira
        -- Para CAP DE CUMEEIRA no espigão
        WHEN pu.item_codigo = '10472' AND v_comprimento_espigao > 0 THEN v_comprimento_espigao
        -- Para CUMEEIRA VENTILADA na cumeeira
        WHEN pu.item_codigo = '5298' AND v_comprimento_cumeeira > 0 THEN v_comprimento_cumeeira
        -- Para CUMEEIRA VENTILADA no espigão
        WHEN pu.item_codigo = '5298' AND v_comprimento_espigao > 0 THEN v_comprimento_espigao
        -- Para FITA AUTOADESIVA na água furtada
        WHEN pu.item_codigo = '15600' THEN v_comprimento_agua_furtada
        -- Cálculo padrão por área
        ELSE v_area_calculada * pu.fator_aplicacao
      END as area_aplicacao,
      pu.fator_aplicacao,
      CASE 
        -- CORREÇÃO: Cálculo do STARTER baseado no perímetro (23m por pacote)
        WHEN pu.item_codigo = '10471' AND v_perimetro_telhado > 0 THEN 
          CEILING(v_perimetro_telhado / 23)
        -- CORREÇÃO: Cálculo da CAP DE CUMEEIRA baseado no comprimento (1m por peça)
        WHEN pu.item_codigo = '10472' AND v_comprimento_cumeeira > 0 THEN 
          CEILING(v_comprimento_cumeeira / 1)
        -- Cálculo da CAP DE CUMEEIRA baseado no espigão (1m por peça)
        WHEN pu.item_codigo = '10472' AND v_comprimento_espigao > 0 THEN 
          CEILING(v_comprimento_espigao / 1)
        -- CORREÇÃO: Cálculo da CUMEEIRA VENTILADA baseado no comprimento (1m por peça)
        WHEN pu.item_codigo = '5298' AND v_comprimento_cumeeira > 0 THEN 
          CEILING(v_comprimento_cumeeira / 1)
        -- Cálculo da CUMEEIRA VENTILADA baseado no espigão (1m por peça)
        WHEN pu.item_codigo = '5298' AND v_comprimento_espigao > 0 THEN 
          CEILING(v_comprimento_espigao / 1)
        -- Cálculo da FITA AUTOADESIVA baseado na água furtada
        WHEN pu.item_codigo = '15600' AND v_comprimento_agua_furtada > 0 THEN 
          CEILING(v_comprimento_agua_furtada / 0.9)
        -- Cálculo padrão por área
        ELSE (v_area_calculada * pu.fator_aplicacao * pu.consumo_por_m2)
      END as quantidade_liquida,
      CASE 
        -- Para produtos customizados, não aplicar quebra adicional (já está no CEILING)
        WHEN (pu.item_codigo = '10471' AND v_perimetro_telhado > 0) OR 
             (pu.item_codigo = '10472' AND (v_comprimento_cumeeira > 0 OR v_comprimento_espigao > 0)) OR
             (pu.item_codigo = '5298' AND (v_comprimento_cumeeira > 0 OR v_comprimento_espigao > 0)) OR
             (pu.item_codigo = '15600' AND v_comprimento_agua_furtada > 0) THEN 
          CASE 
            WHEN pu.item_codigo = '10471' THEN CEILING(v_perimetro_telhado / 23)
            WHEN pu.item_codigo = '10472' AND v_comprimento_cumeeira > 0 THEN CEILING(v_comprimento_cumeeira / 1)
            WHEN pu.item_codigo = '10472' AND v_comprimento_espigao > 0 THEN CEILING(v_comprimento_espigao / 1)
            WHEN pu.item_codigo = '5298' AND v_comprimento_cumeeira > 0 THEN CEILING(v_comprimento_cumeeira / 1)
            WHEN pu.item_codigo = '5298' AND v_comprimento_espigao > 0 THEN CEILING(v_comprimento_espigao / 1)
            WHEN pu.item_codigo = '15600' THEN CEILING(v_comprimento_agua_furtada / 0.9)
            ELSE 0
          END
        -- Cálculo padrão com quebra
        ELSE (v_area_calculada * pu.fator_aplicacao * pu.consumo_por_m2 * (1 + pu.quebra_aplicada/100))
      END as quantidade_com_quebra,
      pu.preco_unitario,
      CASE 
        -- Valor para STARTER
        WHEN pu.item_codigo = '10471' AND v_perimetro_telhado > 0 THEN 
          CEILING(v_perimetro_telhado / 23) * pu.preco_unitario
        -- Valor para CAP DE CUMEEIRA (cumeeira)
        WHEN pu.item_codigo = '10472' AND v_comprimento_cumeeira > 0 THEN 
          CEILING(v_comprimento_cumeeira / 1) * pu.preco_unitario
        -- Valor para CAP DE CUMEEIRA (espigão)
        WHEN pu.item_codigo = '10472' AND v_comprimento_espigao > 0 THEN 
          CEILING(v_comprimento_espigao / 1) * pu.preco_unitario
        -- Valor para CUMEEIRA VENTILADA (cumeeira)
        WHEN pu.item_codigo = '5298' AND v_comprimento_cumeeira > 0 THEN 
          CEILING(v_comprimento_cumeeira / 1) * pu.preco_unitario
        -- Valor para CUMEEIRA VENTILADA (espigão)
        WHEN pu.item_codigo = '5298' AND v_comprimento_espigao > 0 THEN 
          CEILING(v_comprimento_espigao / 1) * pu.preco_unitario
        -- Valor para FITA AUTOADESIVA
        WHEN pu.item_codigo = '15600' AND v_comprimento_agua_furtada > 0 THEN 
          CEILING(v_comprimento_agua_furtada / 0.9) * pu.preco_unitario
        -- Valor padrão
        ELSE CEIL(v_area_calculada * pu.fator_aplicacao * pu.consumo_por_m2 * (1 + pu.quebra_aplicada/100)) * pu.preco_unitario
      END as valor_total,
      pu.ordem_calculo,
      pu.obrigatorio
    FROM produtos_unicos pu
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
  ORDER BY c.ordem_calculo, c.categoria, c.item_codigo;
END;
$function$;