-- Criar função completa para cálculo de divisórias de drywall
-- Baseada no guia completo de orçamentação de divisórias de drywall

CREATE OR REPLACE FUNCTION public.calcular_orcamento_drywall_completo(
    p_largura numeric,
    p_altura numeric,
    p_tipo_parede text DEFAULT 'Parede Simples ST 73mm',
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
    p_quebra_customizada numeric DEFAULT NULL
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
BEGIN
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
        'VEDAÇÃO'::text as categoria,
        'DRY-ST-12.5'::text as item_codigo,
        'Placa Drywall Standard 12,5mm'::text as item_descricao,
        '1,20m × 2,40m (2,88m²)'::text as especificacao,
        v_area_total_placas as quantidade_liquida,
        v_quebra_placas as quebra_percentual,
        v_area_total_placas * (1 + v_quebra_placas/100) as quantidade_com_quebra,
        v_placas_necessarias as quantidade_comercial,
        'un'::text as unidade_comercial,
        85.00::numeric as preco_unitario,
        v_placas_necessarias * 85.00 as valor_total,
        v_placas_necessarias * 25.0 as peso_total_kg, -- ~25kg por placa
        'Inclui perda de ' || v_quebra_placas::text || '%'::text as observacoes,
        1 as ordem_categoria;
    
    -- 2. GUIAS (PERFIL HORIZONTAL)
    RETURN QUERY SELECT 
        'ESTRUTURA'::text,
        'GUIA-70'::text,
        'Guia 70mm × 30mm'::text,
        'Barra de 3,00m - Galvanizado Z275'::text,
        v_metros_guias,
        v_quebra_perfis,
        v_metros_guias * (1 + v_quebra_perfis/100),
        v_barras_guias,
        'barra'::text,
        42.00::numeric,
        v_barras_guias * 42.00,
        v_barras_guias * 2.8, -- ~2,8kg por barra
        'Fixação superior e inferior'::text,
        2;
    
    -- 3. MONTANTES (PERFIL VERTICAL)
    RETURN QUERY SELECT 
        'ESTRUTURA'::text,
        'MONT-70'::text,
        'Montante 70mm × 35mm'::text,
        'Barra de 3,00m - Galvanizado Z275'::text,
        v_metros_montantes,
        v_quebra_perfis,
        v_metros_montantes * (1 + v_quebra_perfis/100),
        v_barras_montantes,
        'barra'::text,
        45.00::numeric,
        v_barras_montantes * 45.00,
        v_barras_montantes * 3.2, -- ~3,2kg por barra
        'Espaçamento: ' || p_espacamento_montantes::text || 'm + reforços'::text,
        3;
    
    -- 4. PARAFUSOS METAL-METAL
    RETURN QUERY SELECT 
        'FIXAÇÃO'::text,
        'PAR-13MM'::text,
        'Parafuso Metal-Metal 4,2×13mm'::text,
        'Ponta broca - Cabeça lentilha'::text,
        v_parafusos_metal_metal::numeric,
        v_quebra_parafusos,
        v_parafusos_metal_metal * (1 + v_quebra_parafusos/100),
        CEIL(v_parafusos_metal_metal / 1000.0), -- Vendido em caixas de 1000
        'cx-1000'::text,
        85.00::numeric,
        CEIL(v_parafusos_metal_metal / 1000.0) * 85.00,
        CEIL(v_parafusos_metal_metal / 1000.0) * 8.5, -- ~8,5kg por caixa
        'União entre perfis metálicos'::text,
        4;
    
    -- 5. PARAFUSOS METAL-DRYWALL
    RETURN QUERY SELECT 
        'FIXAÇÃO'::text,
        'PAR-25MM'::text,
        'Parafuso Metal-Drywall 3,5×25mm'::text,
        'Ponta agulha - Cabeça trombeta'::text,
        v_parafusos_metal_drywall::numeric,
        v_quebra_parafusos,
        v_parafusos_metal_drywall * (1 + v_quebra_parafusos/100),
        CEIL(v_parafusos_metal_drywall / 1000.0),
        'cx-1000'::text,
        95.00::numeric,
        CEIL(v_parafusos_metal_drywall / 1000.0) * 95.00,
        CEIL(v_parafusos_metal_drywall / 1000.0) * 9.5,
        'Fixação placas nos perfis'::text,
        5;
    
    -- 6. BUCHAS E PARAFUSOS PARA CONCRETO
    RETURN QUERY SELECT 
        'FIXAÇÃO'::text,
        'BUCHA-S6'::text,
        'Bucha S6 com Parafuso 4,5×40mm'::text,
        'Nylon + Parafuso galvanizado'::text,
        v_buchas_fixacao::numeric,
        0::numeric, -- Sem quebra para buchas
        v_buchas_fixacao::numeric,
        v_buchas_fixacao,
        'un'::text,
        2.50::numeric,
        v_buchas_fixacao * 2.50,
        v_buchas_fixacao * 0.05, -- ~50g por conjunto
        'Fixação guias ao piso/teto'::text,
        6;
    
    -- 7. FITA MICROPERFURADA
    RETURN QUERY SELECT 
        'ACABAMENTO'::text,
        'FITA-50MM'::text,
        'Fita Microperfurada 50mm'::text,
        'Papel kraft - Rolo de 150m'::text,
        v_metros_fita,
        v_quebra_fita,
        v_metros_fita * (1 + v_quebra_fita/100),
        CEIL(v_metros_fita / 150.0), -- Rolo de 150m
        'rolo'::text,
        28.00::numeric,
        CEIL(v_metros_fita / 150.0) * 28.00,
        CEIL(v_metros_fita / 150.0) * 1.8, -- ~1,8kg por rolo
        'Tratamento de juntas'::text,
        7;
    
    -- 8. MASSA PARA JUNTAS
    RETURN QUERY SELECT 
        'ACABAMENTO'::text,
        'MASSA-JUNTA'::text,
        'Massa para Juntas'::text,
        'Embalagem 20kg - Pronta para uso'::text,
        v_kg_massa_juntas,
        v_quebra_massa,
        v_kg_massa_juntas * (1 + v_quebra_massa/100),
        CEIL(v_kg_massa_juntas / 20.0), -- Embalagem de 20kg
        'saco-20kg'::text,
        65.00::numeric,
        CEIL(v_kg_massa_juntas / 20.0) * 65.00,
        CEIL(v_kg_massa_juntas / 20.0) * 20.0,
        'Primeira demão - Rejunte'::text,
        8;
    
    -- 9. MASSA DE ACABAMENTO
    RETURN QUERY SELECT 
        'ACABAMENTO'::text,
        'MASSA-ACAB'::text,
        'Massa de Acabamento'::text,
        'Embalagem 20kg - Pronta para uso'::text,
        v_kg_massa_acabamento,
        v_quebra_massa,
        v_kg_massa_acabamento * (1 + v_quebra_massa/100),
        CEIL(v_kg_massa_acabamento / 20.0),
        'saco-20kg'::text,
        72.00::numeric,
        CEIL(v_kg_massa_acabamento / 20.0) * 72.00,
        CEIL(v_kg_massa_acabamento / 20.0) * 20.0,
        'Segunda demão - Acabamento'::text,
        9;
    
    -- 10. ISOLAMENTO ACÚSTICO (se solicitado)
    IF p_com_isolamento THEN
        RETURN QUERY SELECT 
            'ISOLAMENTO'::text,
            'LA-VIDRO-' || p_espessura_isolamento::text || 'MM'::text,
            'Lã de Vidro ' || p_espessura_isolamento::text || 'mm'::text,
            'Densidade 12kg/m³ - Rolo 1,20×12,5m'::text,
            v_area_isolamento,
            v_quebra_isolamento,
            v_area_isolamento * (1 + v_quebra_isolamento/100),
            CEIL(v_area_isolamento / 15.0), -- Rolo de 15m²
            'rolo'::text,
            185.00::numeric,
            CEIL(v_area_isolamento / 15.0) * 185.00,
            CEIL(v_area_isolamento / 15.0) * 18.0, -- ~18kg por rolo
            'Isolamento termo-acústico'::text,
            10;
    END IF;
    
    -- 11. CANTONEIRAS DE PROTEÇÃO (para esquadrias)
    IF p_incluir_portas OR p_incluir_janelas THEN
        RETURN QUERY SELECT 
            'ACABAMENTO'::text,
            'CANT-PERF'::text,
            'Cantoneira Perfurada 25×25mm'::text,
            'Galvanizada - Barra de 3,00m'::text,
            ((p_quantidade_portas * 2 * p_altura_porta) + (p_quantidade_janelas * 4 * p_altura_janela))::numeric,
            5.0::numeric,
            ((p_quantidade_portas * 2 * p_altura_porta) + (p_quantidade_janelas * 4 * p_altura_janela)) * 1.05,
            CEIL(((p_quantidade_portas * 2 * p_altura_porta) + (p_quantidade_janelas * 4 * p_altura_janela)) / 3.0),
            'barra'::text,
            32.00::numeric,
            CEIL(((p_quantidade_portas * 2 * p_altura_porta) + (p_quantidade_janelas * 4 * p_altura_janela)) / 3.0) * 32.00,
            CEIL(((p_quantidade_portas * 2 * p_altura_porta) + (p_quantidade_janelas * 4 * p_altura_janela)) / 3.0) * 1.5,
            'Proteção de cantos vivos'::text,
            11;
    END IF;
    
END;
$function$;