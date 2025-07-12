-- Atualizar função calcular_orcamento para incluir discriminação detalhada dos equipamentos
CREATE OR REPLACE FUNCTION public.calcular_orcamento(
  p_painel_id uuid, 
  p_quantidade_paineis integer, 
  p_inversor_id uuid, 
  p_potencia_sistema numeric
)
RETURNS jsonb
LANGUAGE plpgsql
AS $function$
DECLARE
  v_painel RECORD;
  v_inversor RECORD;
  v_preco_paineis DECIMAL;
  v_preco_inversor DECIMAL;
  v_custo_instalacao DECIMAL;
  v_custo_estrutura DECIMAL;
  v_custo_protecoes DECIMAL;
  v_custo_cabos DECIMAL;
  v_margem DECIMAL;
  v_subtotal_equipamentos DECIMAL;
  v_subtotal_instalacao DECIMAL;
  v_valor_total DECIMAL;
  v_resultado JSONB;
BEGIN
  -- Buscar dados dos equipamentos
  SELECT * INTO v_painel FROM produtos WHERE id = p_painel_id;
  SELECT * INTO v_inversor FROM produtos WHERE id = p_inversor_id;
  
  -- Calcular custos dos equipamentos principais
  v_preco_paineis := v_painel.preco_unitario * p_quantidade_paineis;
  v_preco_inversor := v_inversor.preco_unitario;
  
  -- Calcular custos de estrutura e acessórios baseados na quantidade de painéis
  v_custo_estrutura := p_quantidade_paineis * 120.00; -- R$ 120 por painel (trilhos, ganchos, fixadores)
  v_custo_protecoes := p_potencia_sistema * 150.00; -- R$ 150/kWp (string box, DPS, disjuntores)
  v_custo_cabos := p_quantidade_paineis * 25.00; -- R$ 25 por painel em cabos DC/CA
  
  -- Buscar configurações
  SELECT custo_instalacao_wp, margem_comercial INTO v_custo_instalacao, v_margem
  FROM energia_solar_configuracoes
  WHERE ativo = true
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Valores padrão
  v_custo_instalacao := COALESCE(v_custo_instalacao, 1.5); -- R$ 1,50/Wp
  v_margem := COALESCE(v_margem, 0.3); -- 30%
  
  -- Calcular custos de instalação
  v_custo_instalacao := v_custo_instalacao * p_potencia_sistema * 1000;
  
  -- Calcular subtotais
  v_subtotal_equipamentos := v_preco_paineis + v_preco_inversor + v_custo_estrutura + v_custo_protecoes + v_custo_cabos;
  v_subtotal_instalacao := v_custo_instalacao;
  v_valor_total := (v_subtotal_equipamentos + v_subtotal_instalacao) * (1 + v_margem);
  
  -- Montar resultado detalhado
  v_resultado := jsonb_build_object(
    'equipamentos_dc', jsonb_build_object(
      'paineis', jsonb_build_object(
        'descricao', v_painel.nome,
        'quantidade', p_quantidade_paineis,
        'preco_unitario', v_painel.preco_unitario,
        'preco_total', v_preco_paineis
      ),
      'protecoes_dc', jsonb_build_object(
        'descricao', 'String Box, DPS DC, Fusíveis',
        'preco_total', v_custo_protecoes
      ),
      'cabos_dc', jsonb_build_object(
        'descricao', 'Cabos DC, Conectores MC4',
        'preco_total', v_custo_cabos * 0.6
      ),
      'subtotal', v_preco_paineis + v_custo_protecoes + (v_custo_cabos * 0.6)
    ),
    'equipamentos_ca', jsonb_build_object(
      'inversor', jsonb_build_object(
        'descricao', v_inversor.nome,
        'quantidade', 1,
        'preco_unitario', v_preco_inversor,
        'preco_total', v_preco_inversor
      ),
      'protecoes_ca', jsonb_build_object(
        'descricao', 'DPS CA, Disjuntor, Medidor',
        'preco_total', 450.00
      ),
      'cabos_ca', jsonb_build_object(
        'descricao', 'Cabos CA, Eletrodutos',
        'preco_total', v_custo_cabos * 0.4
      ),
      'subtotal', v_preco_inversor + 450.00 + (v_custo_cabos * 0.4)
    ),
    'estrutura_fixacao', jsonb_build_object(
      'trilhos', jsonb_build_object(
        'descricao', 'Trilhos de Alumínio',
        'preco_total', v_custo_estrutura * 0.6
      ),
      'ganchos_fixadores', jsonb_build_object(
        'descricao', 'Ganchos, Parafusos, End-clamps',
        'preco_total', v_custo_estrutura * 0.4
      ),
      'subtotal', v_custo_estrutura
    ),
    'instalacao', jsonb_build_object(
      'mao_de_obra', jsonb_build_object(
        'descricao', 'Instalação e Comissionamento',
        'preco_total', v_custo_instalacao
      ),
      'subtotal', v_custo_instalacao
    ),
    'resumo_financeiro', jsonb_build_object(
      'subtotal_equipamentos', v_subtotal_equipamentos,
      'subtotal_instalacao', v_subtotal_instalacao,
      'subtotal_geral', v_subtotal_equipamentos + v_subtotal_instalacao,
      'margem_percentual', v_margem * 100,
      'valor_margem', (v_subtotal_equipamentos + v_subtotal_instalacao) * v_margem,
      'valor_total', ROUND(v_valor_total, 2),
      'valor_kwp_instalado', ROUND(v_valor_total / p_potencia_sistema, 2)
    ),
    -- Manter compatibilidade com código existente
    'equipamentos', jsonb_build_object(
      'paineis', v_preco_paineis,
      'inversor', v_preco_inversor
    ),
    'instalacao', v_custo_instalacao,
    'subtotal', v_subtotal_equipamentos + v_subtotal_instalacao,
    'margem_aplicada', v_margem * 100,
    'valor_total', ROUND(v_valor_total, 2),
    'valor_kwp_instalado', ROUND(v_valor_total / p_potencia_sistema, 2)
  );
  
  RETURN v_resultado;
END;
$function$;