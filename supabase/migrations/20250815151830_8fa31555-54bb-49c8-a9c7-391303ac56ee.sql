-- Refatorar função calcular_orcamento_drywall_completo para usar produtos_drywall_mestre
CREATE OR REPLACE FUNCTION public.calcular_orcamento_drywall_completo(
    p_largura numeric, 
    p_altura numeric, 
    p_tipo_parede text DEFAULT 'Parede Simples ST 73mm'::text, 
    p_incluir_portas boolean DEFAULT false, 
    p_quantidade_portas integer DEFAULT 0, 
    p_incluir_janelas boolean DEFAULT false, 
    p_quantidade_janelas integer DEFAULT 0, 
    p_largura_porta numeric DEFAULT 0.80, 
    p_altura_porta numeric DEFAULT 2.10, 
    p_largura_janela numeric DEFAULT 1.20, 
    p_altura_janela numeric DEFAULT 1.20, 
    p_espessura_isolamento numeric DEFAULT 50, 
    p_espacamento_montantes numeric DEFAULT 0.60, 
    p_com_isolamento boolean DEFAULT true, 
    p_quebra_customizada numeric DEFAULT NULL::numeric
)
RETURNS TABLE(
    categoria text, 
    item_codigo text, 
    item_descricao text, 
    especificacao text, 
    quantidade_liquida numeric, 
    quebra_percentual numeric, 
    quantidade_com_quebra numeric, 
    quantidade_comercial integer, 
    unidade_comercial text, 
    preco_unitario numeric, 
    valor_total numeric, 
    peso_total_kg numeric, 
    observacoes text, 
    ordem_categoria integer
)
LANGUAGE plpgsql
AS $function$
DECLARE
    v_area_bruta numeric;
    v_area_esquadrias numeric;
    v_desconto_esquadrias numeric;
    v_area_liquida numeric;
    v_area_total_placas numeric;
    v_montantes_base integer;
    v_montantes_reforco integer;
    v_total_montantes integer;
    v_metros_montantes numeric;
    v_barras_montantes integer;
    v_metros_guias numeric;
    v_barras_guias integer;
    v_parafusos_metal_metal integer;
    v_parafusos_metal_drywall integer;
    v_buchas_fixacao integer;
    v_metros_fita numeric;
    v_kg_massa_juntas numeric;
    v_kg_massa_acabamento numeric;
    v_area_isolamento numeric;
    v_quebra_placas numeric;
    v_quebra_perfis numeric;
    v_quebra_parafusos numeric;
    v_quebra_fita numeric;
    v_quebra_massa numeric;
    v_quebra_isolamento numeric;
    v_placas_necessarias integer;
    
    -- Variáveis para produtos
    r_placa RECORD;
    r_guia RECORD;
    r_montante RECORD;
    r_par_metal RECORD;
    r_par_drywall RECORD;
    r_bucha RECORD;
    r_fita RECORD;
    r_massa_junta RECORD;
    r_massa_acab RECORD;
    r_cant_perf RECORD;
    r_isolamento RECORD;
BEGIN
    -- Buscar produtos na tabela mestre
    SELECT * INTO r_placa FROM produtos_drywall_mestre WHERE codigo_funcao = 'DRY-ST-12.5' AND ativo = true;
    SELECT * INTO r_guia FROM produtos_drywall_mestre WHERE codigo_funcao = 'GUIA-70' AND ativo = true;
    SELECT * INTO r_montante FROM produtos_drywall_mestre WHERE codigo_funcao = 'MONT-70' AND ativo = true;
    SELECT * INTO r_par_metal FROM produtos_drywall_mestre WHERE codigo_funcao = 'PAR-13MM' AND ativo = true;
    SELECT * INTO r_par_drywall FROM produtos_drywall_mestre WHERE codigo_funcao = 'PAR-25MM' AND ativo = true;
    SELECT * INTO r_bucha FROM produtos_drywall_mestre WHERE codigo_funcao = 'BUCHA-S6' AND ativo = true;
    SELECT * INTO r_fita FROM produtos_drywall_mestre WHERE codigo_funcao = 'FITA-50MM' AND ativo = true;
    SELECT * INTO r_massa_junta FROM produtos_drywall_mestre WHERE codigo_funcao = 'MASSA-JUNTA' AND ativo = true;
    SELECT * INTO r_massa_acab FROM produtos_drywall_mestre WHERE codigo_funcao = 'MASSA-ACAB' AND ativo = true;
    SELECT * INTO r_cant_perf FROM produtos_drywall_mestre WHERE codigo_funcao = 'CANT-PERF' AND ativo = true;
    SELECT * INTO r_isolamento FROM produtos_drywall_mestre WHERE codigo_funcao = 'LA-VIDRO-' || p_espessura_isolamento::text || 'MM' AND ativo = true;
    
    -- Se não encontrar isolamento específico, usar padrão 50mm
    IF r_isolamento.id IS NULL THEN
        SELECT * INTO r_isolamento FROM produtos_drywall_mestre WHERE codigo_funcao = 'LA-VIDRO-50MM' AND ativo = true;
    END IF;

    -- Calcular área bruta
    v_area_bruta := p_largura * p_altura;
    
    -- Calcular área das esquadrias
    v_area_esquadrias := 0;
    IF p_incluir_portas THEN
        v_area_esquadrias := v_area_esquadrias + (p_quantidade_portas * p_largura_porta * p_altura_porta);
    END IF;
    IF p_incluir_janelas THEN
        v_area_esquadrias := v_area_esquadrias + (p_quantidade_janelas * p_largura_janela * p_altura_janela);
    END IF;
    
    -- Aplicar desconto de 50% nas esquadrias (conforme guia)
    v_desconto_esquadrias := v_area_esquadrias * 0.5;
    v_area_liquida := v_area_bruta - v_desconto_esquadrias;
    
    -- Área total para placas (2 faces)
    v_area_total_placas := v_area_liquida * 2;
    
    -- Definir perdas por tipo de material (conforme tabela do guia)
    v_quebra_placas := COALESCE(p_quebra_customizada, 15.0); -- 15% padrão
    v_quebra_perfis := 5.0;
    v_quebra_parafusos := 10.0;
    v_quebra_fita := 10.0;
    v_quebra_massa := 10.0;
    v_quebra_isolamento := 5.0;
    
    -- CÁLCULO DE PLACAS DE DRYWALL
    -- Usando placa padrão 1,20m × 2,40m = 2,88 m²
    v_placas_necessarias := CEIL(v_area_total_placas / 2.88 * (1 + v_quebra_placas/100));
    
    -- CÁLCULO DE PERFIS METÁLICOS
    -- Guias (superior e inferior): (L × 2) ÷ 3 × 1,05
    v_metros_guias := p_largura * 2;
    v_barras_guias := CEIL(v_metros_guias / 3.0 * (1 + v_quebra_perfis/100));
    
    -- Montantes: (L ÷ espaçamento) + 1 + reforços
    v_montantes_base := FLOOR(p_largura / p_espacamento_montantes) + 1;
    v_montantes_reforco := 0;
    IF p_incluir_portas THEN
        v_montantes_reforco := v_montantes_reforco + (p_quantidade_portas * 4); -- 4 por porta
    END IF;
    IF p_incluir_janelas THEN
        v_montantes_reforco := v_montantes_reforco + (p_quantidade_janelas * 6); -- 6 por janela
    END IF;
    
    v_total_montantes := v_montantes_base + v_montantes_reforco;
    v_metros_montantes := v_total_montantes * (p_altura - 0.01); -- Altura - 1cm de folga
    v_barras_montantes := CEIL(v_metros_montantes / 3.0 * (1 + v_quebra_perfis/100));
    
    -- CÁLCULO DE PARAFUSOS
    -- Metal-metal: 6 parafusos por montante
    v_parafusos_metal_metal := CEIL(v_total_montantes * 6 * (1 + v_quebra_parafusos/100));
    
    -- Metal-drywall: Área ÷ 0,30 × 1,10 (conforme guia)
    v_parafusos_metal_drywall := CEIL(v_area_total_placas / 0.30 * (1 + v_quebra_parafusos/100));
    
    -- Buchas para fixação: (L ÷ 0,60) × 2
    v_buchas_fixacao := CEIL((p_largura / 0.60) * 2);
    
    -- CÁLCULO DE TRATAMENTO DE JUNTAS
    -- Fita: Perímetro + juntas × 1,10
    v_metros_fita := (2 * (p_largura + p_altura)) + (p_largura * 2) + (p_altura * 2);
    IF p_incluir_portas THEN
        v_metros_fita := v_metros_fita + (p_quantidade_portas * 2 * (p_largura_porta + p_altura_porta));
    END IF;
    IF p_incluir_janelas THEN
        v_metros_fita := v_metros_fita + (p_quantidade_janelas * 2 * (p_largura_janela + p_altura_janela));
    END IF;
    v_metros_fita := v_metros_fita * (1 + v_quebra_fita/100);
    
    -- Massa para juntas: metros_fita × 0,3 kg/m
    v_kg_massa_juntas := v_metros_fita * 0.3 * (1 + v_quebra_massa/100);
    
    -- Massa de acabamento: área_total × 0,5 kg/m²
    v_kg_massa_acabamento := v_area_total_placas * 0.5 * (1 + v_quebra_massa/100);
    
    -- CÁLCULO DE ISOLAMENTO
    IF p_com_isolamento THEN
        v_area_isolamento := v_area_liquida * (1 + v_quebra_isolamento/100);
    ELSE
        v_area_isolamento := 0;
    END IF;
    
    -- RETORNAR RESULTADOS DETALHADOS
    
    -- 1. PLACAS DE DRYWALL
    RETURN QUERY SELECT 
        r_placa.categoria_funcao,
        r_placa.codigo_funcao,
        r_placa.descricao,
        r_placa.especificacao,
        v_area_total_placas,
        v_quebra_placas,
        v_area_total_placas * (1 + v_quebra_placas/100),
        v_placas_necessarias,
        r_placa.unidade_comercial,
        r_placa.preco_unitario,
        v_placas_necessarias * r_placa.preco_unitario,
        v_placas_necessarias * r_placa.peso_unitario,
        'Inclui perda de ' || v_quebra_placas::text || '%'::text,
        1;
    
    -- 2. GUIAS (PERFIL HORIZONTAL)
    RETURN QUERY SELECT 
        r_guia.categoria_funcao,
        r_guia.codigo_funcao,
        r_guia.descricao,
        r_guia.especificacao,
        v_metros_guias,
        v_quebra_perfis,
        v_metros_guias * (1 + v_quebra_perfis/100),
        v_barras_guias,
        r_guia.unidade_comercial,
        r_guia.preco_unitario,
        v_barras_guias * r_guia.preco_unitario,
        v_barras_guias * r_guia.peso_unitario,
        'Fixação superior e inferior'::text,
        2;
    
    -- 3. MONTANTES (PERFIL VERTICAL)
    RETURN QUERY SELECT 
        r_montante.categoria_funcao,
        r_montante.codigo_funcao,
        r_montante.descricao,
        r_montante.especificacao,
        v_metros_montantes,
        v_quebra_perfis,
        v_metros_montantes * (1 + v_quebra_perfis/100),
        v_barras_montantes,
        r_montante.unidade_comercial,
        r_montante.preco_unitario,
        v_barras_montantes * r_montante.preco_unitario,
        v_barras_montantes * r_montante.peso_unitario,
        'Espaçamento: ' || p_espacamento_montantes::text || 'm + reforços'::text,
        3;
    
    -- 4. PARAFUSOS METAL-METAL
    RETURN QUERY SELECT 
        r_par_metal.categoria_funcao,
        r_par_metal.codigo_funcao,
        r_par_metal.descricao,
        r_par_metal.especificacao,
        v_parafusos_metal_metal::numeric,
        v_quebra_parafusos,
        v_parafusos_metal_metal * (1 + v_quebra_parafusos/100),
        CEIL(v_parafusos_metal_metal / 1000.0), -- Vendido em caixas de 1000
        r_par_metal.unidade_comercial,
        r_par_metal.preco_unitario,
        CEIL(v_parafusos_metal_metal / 1000.0) * r_par_metal.preco_unitario,
        CEIL(v_parafusos_metal_metal / 1000.0) * r_par_metal.peso_unitario,
        'União entre perfis metálicos'::text,
        4;
    
    -- 5. PARAFUSOS METAL-DRYWALL
    RETURN QUERY SELECT 
        r_par_drywall.categoria_funcao,
        r_par_drywall.codigo_funcao,
        r_par_drywall.descricao,
        r_par_drywall.especificacao,
        v_parafusos_metal_drywall::numeric,
        v_quebra_parafusos,
        v_parafusos_metal_drywall * (1 + v_quebra_parafusos/100),
        CEIL(v_parafusos_metal_drywall / 1000.0),
        r_par_drywall.unidade_comercial,
        r_par_drywall.preco_unitario,
        CEIL(v_parafusos_metal_drywall / 1000.0) * r_par_drywall.preco_unitario,
        CEIL(v_parafusos_metal_drywall / 1000.0) * r_par_drywall.peso_unitario,
        'Fixação placas nos perfis'::text,
        5;
    
    -- 6. BUCHAS E PARAFUSOS PARA CONCRETO
    RETURN QUERY SELECT 
        r_bucha.categoria_funcao,
        r_bucha.codigo_funcao,
        r_bucha.descricao,
        r_bucha.especificacao,
        v_buchas_fixacao::numeric,
        0::numeric, -- Sem quebra para buchas
        v_buchas_fixacao::numeric,
        v_buchas_fixacao,
        r_bucha.unidade_comercial,
        r_bucha.preco_unitario,
        v_buchas_fixacao * r_bucha.preco_unitario,
        v_buchas_fixacao * r_bucha.peso_unitario,
        'Fixação guias ao piso/teto'::text,
        6;
    
    -- 7. FITA MICROPERFURADA
    RETURN QUERY SELECT 
        r_fita.categoria_funcao,
        r_fita.codigo_funcao,
        r_fita.descricao,
        r_fita.especificacao,
        v_metros_fita,
        v_quebra_fita,
        v_metros_fita * (1 + v_quebra_fita/100),
        CEIL(v_metros_fita / 150.0), -- Rolo de 150m
        r_fita.unidade_comercial,
        r_fita.preco_unitario,
        CEIL(v_metros_fita / 150.0) * r_fita.preco_unitario,
        CEIL(v_metros_fita / 150.0) * r_fita.peso_unitario,
        'Tratamento de juntas'::text,
        7;
    
    -- 8. MASSA PARA JUNTAS
    RETURN QUERY SELECT 
        r_massa_junta.categoria_funcao,
        r_massa_junta.codigo_funcao,
        r_massa_junta.descricao,
        r_massa_junta.especificacao,
        v_kg_massa_juntas,
        v_quebra_massa,
        v_kg_massa_juntas * (1 + v_quebra_massa/100),
        CEIL(v_kg_massa_juntas / 20.0), -- Embalagem de 20kg
        r_massa_junta.unidade_comercial,
        r_massa_junta.preco_unitario,
        CEIL(v_kg_massa_juntas / 20.0) * r_massa_junta.preco_unitario,
        CEIL(v_kg_massa_juntas / 20.0) * r_massa_junta.peso_unitario,
        'Primeira demão - Rejunte'::text,
        8;
    
    -- 9. MASSA DE ACABAMENTO
    RETURN QUERY SELECT 
        r_massa_acab.categoria_funcao,
        r_massa_acab.codigo_funcao,
        r_massa_acab.descricao,
        r_massa_acab.especificacao,
        v_kg_massa_acabamento,
        v_quebra_massa,
        v_kg_massa_acabamento * (1 + v_quebra_massa/100),
        CEIL(v_kg_massa_acabamento / 20.0),
        r_massa_acab.unidade_comercial,
        r_massa_acab.preco_unitario,
        CEIL(v_kg_massa_acabamento / 20.0) * r_massa_acab.preco_unitario,
        CEIL(v_kg_massa_acabamento / 20.0) * r_massa_acab.peso_unitario,
        'Segunda demão - Acabamento'::text,
        9;
    
    -- 10. ISOLAMENTO ACÚSTICO (se solicitado)
    IF p_com_isolamento AND r_isolamento.id IS NOT NULL THEN
        RETURN QUERY SELECT 
            r_isolamento.categoria_funcao,
            r_isolamento.codigo_funcao,
            r_isolamento.descricao,
            r_isolamento.especificacao,
            v_area_isolamento,
            v_quebra_isolamento,
            v_area_isolamento * (1 + v_quebra_isolamento/100),
            CEIL(v_area_isolamento / 15.0), -- Rolo de 15m²
            r_isolamento.unidade_comercial,
            r_isolamento.preco_unitario,
            CEIL(v_area_isolamento / 15.0) * r_isolamento.preco_unitario,
            CEIL(v_area_isolamento / 15.0) * r_isolamento.peso_unitario,
            'Isolamento termo-acústico'::text,
            10;
    END IF;
    
    -- 11. CANTONEIRAS DE PROTEÇÃO (para esquadrias)
    IF (p_incluir_portas OR p_incluir_janelas) AND r_cant_perf.id IS NOT NULL THEN
        RETURN QUERY SELECT 
            r_cant_perf.categoria_funcao,
            r_cant_perf.codigo_funcao,
            r_cant_perf.descricao,
            r_cant_perf.especificacao,
            ((p_quantidade_portas * 2 * p_altura_porta) + (p_quantidade_janelas * 4 * p_altura_janela))::numeric,
            5.0::numeric,
            ((p_quantidade_portas * 2 * p_altura_porta) + (p_quantidade_janelas * 4 * p_altura_janela)) * 1.05,
            CEIL(((p_quantidade_portas * 2 * p_altura_porta) + (p_quantidade_janelas * 4 * p_altura_janela)) / 3.0),
            r_cant_perf.unidade_comercial,
            r_cant_perf.preco_unitario,
            CEIL(((p_quantidade_portas * 2 * p_altura_porta) + (p_quantidade_janelas * 4 * p_altura_janela)) / 3.0) * r_cant_perf.preco_unitario,
            CEIL(((p_quantidade_portas * 2 * p_altura_porta) + (p_quantidade_janelas * 4 * p_altura_janela)) / 3.0) * r_cant_perf.peso_unitario,
            'Proteção de cantos vivos'::text,
            11;
    END IF;
    
END;
$function$;