-- Corrigir a função RPC calcular_orcamento_shingle_completo_v2
-- Problema: referência incorreta a p_cor_acessorios
DROP FUNCTION IF EXISTS public.calcular_orcamento_shingle_completo_v2(numeric, numeric, numeric, numeric, text, text, boolean, boolean);

CREATE OR REPLACE FUNCTION public.calcular_orcamento_shingle_completo_v2(
    p_area_telhado numeric, 
    p_comprimento_cumeeira numeric DEFAULT 0, 
    p_perimetro_telhado numeric DEFAULT 0, 
    p_comprimento_calha numeric DEFAULT 0, 
    p_telha_codigo text DEFAULT '10420'::text, 
    p_cor_acessorios text DEFAULT 'CINZA'::text, 
    p_incluir_manta boolean DEFAULT true, 
    p_incluir_calha boolean DEFAULT true
)
RETURNS TABLE(
    tipo_item text, 
    codigo text, 
    descricao text, 
    dimensao_base numeric, 
    unidade_dimensao text, 
    fator_conversao numeric, 
    quebra_percentual numeric, 
    quantidade_calculada numeric, 
    quantidade_final integer, 
    unidade_venda text, 
    preco_unitario numeric, 
    valor_total numeric, 
    categoria text, 
    ordem integer
)
LANGUAGE plpgsql
AS $function$
DECLARE
    v_comprimento_rufo_lateral DECIMAL;
    v_comprimento_rufo_capa DECIMAL;
    v_total_metros_lineares DECIMAL;
    v_consumo_pregos DECIMAL;
    v_consumo_grampos DECIMAL;
    v_area_manta DECIMAL;
BEGIN
    -- Calcular dimensões automáticas
    v_comprimento_rufo_lateral := p_perimetro_telhado * 0.6;
    v_comprimento_rufo_capa := p_perimetro_telhado * 0.4;
    v_total_metros_lineares := p_comprimento_cumeeira + p_perimetro_telhado + p_comprimento_calha;
    v_consumo_pregos := (p_area_telhado * 0.15) + (v_total_metros_lineares * 0.1);
    v_consumo_grampos := p_area_telhado * 0.01;
    v_area_manta := p_perimetro_telhado * 0.25;
    
    -- 1. Base Estrutural (OSB) - OBRIGATÓRIO
    RETURN QUERY
    SELECT 
        'OSB'::TEXT,
        p.codigo,
        p.descricao,
        p_area_telhado,
        'm²'::TEXT,
        1.0::DECIMAL,
        p.quebra_padrao,
        p_area_telhado * (1 + p.quebra_padrao / 100),
        CEIL(p_area_telhado * (1 + p.quebra_padrao / 100))::INTEGER,
        p.unidade_medida,
        p.preco_unitario,
        CEIL(p_area_telhado * (1 + p.quebra_padrao / 100)) * p.preco_unitario,
        'Base Estrutural'::TEXT,
        1::INTEGER
    FROM produtos_shingle_novo p
    WHERE p.tipo_componente = 'OSB' AND p.ativo = true
    LIMIT 1;
    
    -- 2. Subcobertura - OBRIGATÓRIO
    RETURN QUERY
    SELECT 
        'SUBCOBERTURA'::TEXT,
        p.codigo,
        p.descricao,
        p_area_telhado,
        'm²'::TEXT,
        (1.0 / p.conteudo_unidade),
        p.quebra_padrao,
        p_area_telhado * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100),
        CEIL(p_area_telhado * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100))::INTEGER,
        p.unidade_medida,
        p.preco_unitario,
        CEIL(p_area_telhado * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100)) * p.preco_unitario,
        'Impermeabilização'::TEXT,
        2::INTEGER
    FROM produtos_shingle_novo p
    WHERE p.tipo_componente = 'SUBCOBERTURA' AND p.ativo = true
    LIMIT 1;
    
    -- 3. Manta Starter
    IF p_incluir_manta AND p_perimetro_telhado > 0 THEN
        RETURN QUERY
        SELECT 
            'MANTA_STARTER'::TEXT,
            p.codigo,
            p.descricao,
            v_area_manta,
            'm²'::TEXT,
            1.0::DECIMAL,
            p.quebra_padrao,
            v_area_manta * (1 + p.quebra_padrao / 100),
            CEIL(v_area_manta * (1 + p.quebra_padrao / 100))::INTEGER,
            p.unidade_medida,
            p.preco_unitario,
            CEIL(v_area_manta * (1 + p.quebra_padrao / 100)) * p.preco_unitario,
            'Impermeabilização'::TEXT,
            3::INTEGER
        FROM produtos_shingle_novo p
        WHERE p.tipo_componente = 'MANTA_STARTER' AND p.ativo = true
        LIMIT 1;
    END IF;
    
    -- 4. Telhas
    IF p_area_telhado > 0 THEN
        RETURN QUERY
        SELECT 
            'TELHA'::TEXT,
            p.codigo,
            p.descricao,
            p_area_telhado,
            'm²'::TEXT,
            (1.0 / p.conteudo_unidade),
            p.quebra_padrao,
            p_area_telhado * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100),
            CEIL(p_area_telhado * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100))::INTEGER,
            p.unidade_medida,
            p.preco_unitario,
            CEIL(p_area_telhado * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100)) * p.preco_unitario,
            'Cobertura'::TEXT,
            5::INTEGER
        FROM produtos_shingle_novo p
        WHERE p.codigo = p_telha_codigo AND p.ativo = true
        LIMIT 1;
    END IF;
    
    -- 5. Cumeeiras (CORRIGIDO: removida referência incorreta a p_cor)
    IF p_comprimento_cumeeira > 0 THEN
        RETURN QUERY
        SELECT 
            'CUMEEIRA'::TEXT,
            p.codigo,
            p.descricao,
            p_comprimento_cumeeira,
            'm'::TEXT,
            (1.0 / p.conteudo_unidade),
            p.quebra_padrao,
            p_comprimento_cumeeira * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100),
            CEIL(p_comprimento_cumeeira * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100))::INTEGER,
            p.unidade_medida,
            p.preco_unitario,
            CEIL(p_comprimento_cumeeira * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100)) * p.preco_unitario,
            'Acabamento'::TEXT,
            6::INTEGER
        FROM produtos_shingle_novo p
        WHERE p.tipo_componente = 'CUMEEIRA' 
        AND (p.cor = p_cor_acessorios OR p_cor_acessorios IS NULL)
        AND p.ativo = true
        LIMIT 1;
    END IF;
    
    -- 6. Rufos
    IF v_comprimento_rufo_lateral > 0 THEN
        RETURN QUERY
        SELECT 
            'RUFO_LATERAL'::TEXT,
            p.codigo,
            p.descricao,
            v_comprimento_rufo_lateral,
            'm'::TEXT,
            (1.0 / p.conteudo_unidade),
            p.quebra_padrao,
            v_comprimento_rufo_lateral * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100),
            CEIL(v_comprimento_rufo_lateral * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100))::INTEGER,
            p.unidade_medida,
            p.preco_unitario,
            CEIL(v_comprimento_rufo_lateral * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100)) * p.preco_unitario,
            'Acabamento'::TEXT,
            7::INTEGER
        FROM produtos_shingle_novo p
        WHERE p.tipo_componente = 'RUFO_LATERAL' AND p.ativo = true
        LIMIT 1;
    END IF;
    
    IF v_comprimento_rufo_capa > 0 THEN
        RETURN QUERY
        SELECT 
            'RUFO_CAPA'::TEXT,
            p.codigo,
            p.descricao,
            v_comprimento_rufo_capa,
            'm'::TEXT,
            (1.0 / p.conteudo_unidade),
            p.quebra_padrao,
            v_comprimento_rufo_capa * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100),
            CEIL(v_comprimento_rufo_capa * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100))::INTEGER,
            p.unidade_medida,
            p.preco_unitario,
            CEIL(v_comprimento_rufo_capa * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100)) * p.preco_unitario,
            'Acabamento'::TEXT,
            8::INTEGER
        FROM produtos_shingle_novo p
        WHERE p.tipo_componente = 'RUFO_CAPA' AND p.ativo = true
        LIMIT 1;
    END IF;
    
    -- 7. Calhas
    IF p_incluir_calha AND p_comprimento_calha > 0 THEN
        RETURN QUERY
        SELECT 
            'CALHA'::TEXT,
            p.codigo,
            p.descricao,
            p_comprimento_calha,
            'm'::TEXT,
            (1.0 / p.conteudo_unidade),
            p.quebra_padrao,
            p_comprimento_calha * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100),
            CEIL(p_comprimento_calha * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100))::INTEGER,
            p.unidade_medida,
            p.preco_unitario,
            CEIL(p_comprimento_calha * (1.0 / p.conteudo_unidade) * (1 + p.quebra_padrao / 100)) * p.preco_unitario,
            'Sistema de Águas'::TEXT,
            9::INTEGER
        FROM produtos_shingle_novo p
        WHERE p.tipo_componente = 'CALHA' AND p.ativo = true
        LIMIT 1;
    END IF;
    
    -- 8. Fixação - Pregos
    RETURN QUERY
    SELECT 
        'PREGO'::TEXT,
        p.codigo,
        p.descricao,
        v_consumo_pregos,
        'kg'::TEXT,
        1.0::DECIMAL,
        p.quebra_padrao,
        v_consumo_pregos * (1 + p.quebra_padrao / 100),
        CEIL(v_consumo_pregos * (1 + p.quebra_padrao / 100) / p.conteudo_unidade)::INTEGER,
        p.unidade_medida,
        p.preco_unitario,
        CEIL(v_consumo_pregos * (1 + p.quebra_padrao / 100) / p.conteudo_unidade) * p.preco_unitario,
        'Fixação'::TEXT,
        10::INTEGER
    FROM produtos_shingle_novo p
    WHERE p.tipo_componente = 'PREGO' AND p.ativo = true
    LIMIT 1;
    
    -- 9. Fixação - Grampos
    RETURN QUERY
    SELECT 
        'GRAMPO'::TEXT,
        p.codigo,
        p.descricao,
        v_consumo_grampos,
        'kg'::TEXT,
        1.0::DECIMAL,
        p.quebra_padrao,
        v_consumo_grampos * (1 + p.quebra_padrao / 100),
        CEIL(v_consumo_grampos * (1 + p.quebra_padrao / 100) / p.conteudo_unidade)::INTEGER,
        p.unidade_medida,
        p.preco_unitario,
        CEIL(v_consumo_grampos * (1 + p.quebra_padrao / 100) / p.conteudo_unidade) * p.preco_unitario,
        'Fixação'::TEXT,
        11::INTEGER
    FROM produtos_shingle_novo p
    WHERE p.tipo_componente = 'GRAMPO' AND p.ativo = true
    LIMIT 1;
    
END;
$function$;