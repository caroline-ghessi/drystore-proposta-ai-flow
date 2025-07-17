-- Função universal para calcular orçamentos baseado nos mapeamentos
CREATE OR REPLACE FUNCTION public.calcular_por_mapeamento(
  p_tipo_proposta TEXT,
  p_area_base NUMERIC,
  p_dados_extras JSONB DEFAULT '{}'::jsonb
) RETURNS TABLE(
  composicao_id UUID,
  composicao_nome TEXT,
  composicao_codigo TEXT,
  categoria TEXT,
  item_id UUID,
  item_codigo TEXT,
  item_descricao TEXT,
  consumo_por_m2 NUMERIC,
  area_aplicacao NUMERIC,
  fator_aplicacao NUMERIC,
  quantidade_liquida NUMERIC,
  quantidade_com_quebra NUMERIC,
  preco_unitario NUMERIC,
  valor_total NUMERIC,
  ordem_calculo INTEGER,
  obrigatorio BOOLEAN
) LANGUAGE plpgsql AS $$
DECLARE
  v_area_calculada NUMERIC;
BEGIN
  -- Área pode ser ajustada por dados extras (ex: perimetro para rufos, altura para divisórias)
  v_area_calculada := p_area_base;
  
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
      v_area_calculada * m.fator_aplicacao as area_aplicacao,
      m.fator_aplicacao,
      (v_area_calculada * m.fator_aplicacao * ic.consumo_por_m2) as quantidade_liquida,
      (v_area_calculada * m.fator_aplicacao * ic.consumo_por_m2 * (1 + ic.quebra_aplicada/100)) as quantidade_com_quebra,
      pm.preco_unitario,
      CEIL(v_area_calculada * m.fator_aplicacao * ic.consumo_por_m2 * (1 + ic.quebra_aplicada/100)) * pm.preco_unitario as valor_total,
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
$$;

-- Função para obter resumo do orçamento por mapeamento
CREATE OR REPLACE FUNCTION public.resumo_orcamento_mapeamento(
  p_tipo_proposta TEXT,
  p_area_base NUMERIC,
  p_dados_extras JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  v_resultado JSONB;
  v_valor_total NUMERIC := 0;
  v_valor_por_m2 NUMERIC := 0;
  v_total_itens INTEGER := 0;
BEGIN
  -- Calcular totais
  SELECT 
    COALESCE(SUM(valor_total), 0),
    COUNT(*)
  INTO v_valor_total, v_total_itens
  FROM calcular_por_mapeamento(p_tipo_proposta, p_area_base, p_dados_extras);
  
  -- Calcular valor por m²
  IF p_area_base > 0 THEN
    v_valor_por_m2 := v_valor_total / p_area_base;
  END IF;
  
  -- Montar resultado
  v_resultado := jsonb_build_object(
    'tipo_proposta', p_tipo_proposta,
    'area_base', p_area_base,
    'valor_total', ROUND(v_valor_total, 2),
    'valor_por_m2', ROUND(v_valor_por_m2, 2),
    'total_itens', v_total_itens,
    'data_calculo', NOW()
  );
  
  RETURN v_resultado;
END;
$$;