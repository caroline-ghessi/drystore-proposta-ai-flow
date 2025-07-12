-- Criar tabela de telhas shingle
CREATE TABLE public.telhas_shingle (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo TEXT NOT NULL,
    linha TEXT NOT NULL CHECK (linha IN ('SUPREME', 'DURATION')),
    descricao TEXT NOT NULL,
    cor TEXT,
    consumo_m2 DECIMAL(10,4) DEFAULT 1,
    qtd_unidade_venda DECIMAL(10,2) DEFAULT 3.1, -- m² por pacote
    fator_multiplicador DECIMAL(10,4) GENERATED ALWAYS AS 
        (consumo_m2 / NULLIF(qtd_unidade_venda, 0)) STORED,
    quebra_padrao DECIMAL(5,2) DEFAULT 5.0,
    preco_unitario DECIMAL(15,2),
    peso_kg_m2 DECIMAL(5,2) DEFAULT 12.0,
    garantia_anos INTEGER DEFAULT 25,
    resistencia_vento_kmh INTEGER DEFAULT 200,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(codigo)
);

-- Criar tabela de cálculos de telhado shingle
CREATE TABLE public.calculos_telhado_shingle (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    proposta_id UUID REFERENCES public.propostas(id),
    telha_shingle_id UUID REFERENCES public.telhas_shingle(id),
    area_telhado DECIMAL(15,2) NOT NULL,
    inclinacao_percentual DECIMAL(5,2),
    quebra_percentual DECIMAL(5,2) DEFAULT 5.0,
    quantidade_pacotes_calculada DECIMAL(15,3),
    quantidade_pacotes_arredondada INTEGER,
    valor_unitario DECIMAL(15,2),
    valor_total DECIMAL(15,2),
    valor_por_m2 DECIMAL(15,2),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_telhas_shingle_updated_at
    BEFORE UPDATE ON public.telhas_shingle
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calculos_telhado_shingle_updated_at
    BEFORE UPDATE ON public.calculos_telhado_shingle
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir produtos exemplo
INSERT INTO public.telhas_shingle (codigo, linha, descricao, cor, preco_unitario) VALUES
('10420', 'SUPREME', 'SHINGLE LP SUPREME CINZA GRAFITE', 'CINZA GRAFITE', 256.90),
('10421', 'DURATION', 'SHINGLE LP DURATION CINZA', 'CINZA', 280.00),
('10422', 'SUPREME', 'SHINGLE LP SUPREME MARROM', 'MARROM', 256.90),
('10423', 'DURATION', 'SHINGLE LP DURATION PRETO', 'PRETO', 285.00),
('10424', 'SUPREME', 'SHINGLE LP SUPREME VERDE', 'VERDE', 256.90),
('10425', 'DURATION', 'SHINGLE LP DURATION BEGE', 'BEGE', 275.00),
('10426', 'SUPREME', 'SHINGLE LP SUPREME TERRACOTA', 'TERRACOTA', 260.00),
('10427', 'DURATION', 'SHINGLE LP DURATION AZUL', 'AZUL', 290.00);

-- Função para calcular orçamento de telhas shingle
CREATE OR REPLACE FUNCTION public.calcular_orcamento_shingle(
    p_area_telhado DECIMAL,
    p_telha_id UUID,
    p_quebra_percentual DECIMAL DEFAULT NULL,
    p_inclinacao DECIMAL DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_telha RECORD;
    v_quebra_final DECIMAL;
    v_fator_correcao DECIMAL;
    v_quantidade_pacotes DECIMAL;
    v_pacotes_arredondados INTEGER;
    v_valor_total DECIMAL;
    v_valor_por_m2 DECIMAL;
    v_area_corrigida DECIMAL;
    v_resultado JSONB;
BEGIN
    -- Buscar dados da telha
    SELECT * INTO v_telha
    FROM public.telhas_shingle
    WHERE id = p_telha_id
    AND ativo = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Telha não encontrada ou inativa';
    END IF;
    
    -- Calcular quebra final
    v_quebra_final := COALESCE(p_quebra_percentual, v_telha.quebra_padrao);
    
    -- Corrigir área por inclinação se fornecida
    v_area_corrigida := p_area_telhado;
    IF p_inclinacao IS NOT NULL AND p_inclinacao > 0 THEN
        v_area_corrigida := p_area_telhado * (1 + (p_inclinacao / 100));
    END IF;
    
    -- Calcular fator de correção com quebra
    v_fator_correcao := v_telha.fator_multiplicador * (1 + v_quebra_final / 100);
    
    -- Calcular quantidade de pacotes
    v_quantidade_pacotes := v_area_corrigida * v_fator_correcao;
    v_pacotes_arredondados := CEIL(v_quantidade_pacotes);
    
    -- Calcular valores
    v_valor_total := v_pacotes_arredondados * v_telha.preco_unitario;
    v_valor_por_m2 := v_valor_total / p_area_telhado;
    
    -- Montar resultado
    v_resultado := jsonb_build_object(
        'telha', jsonb_build_object(
            'id', v_telha.id,
            'codigo', v_telha.codigo,
            'linha', v_telha.linha,
            'descricao', v_telha.descricao,
            'cor', v_telha.cor,
            'fator_multiplicador', v_telha.fator_multiplicador,
            'qtd_unidade_venda', v_telha.qtd_unidade_venda,
            'preco_unitario', v_telha.preco_unitario,
            'peso_kg_m2', v_telha.peso_kg_m2,
            'garantia_anos', v_telha.garantia_anos,
            'resistencia_vento_kmh', v_telha.resistencia_vento_kmh
        ),
        'calculo', jsonb_build_object(
            'area_original', p_area_telhado,
            'area_corrigida', v_area_corrigida,
            'inclinacao_percentual', p_inclinacao,
            'quebra_percentual', v_quebra_final,
            'fator_correcao', v_fator_correcao,
            'quantidade_pacotes_calculada', ROUND(v_quantidade_pacotes, 3),
            'quantidade_pacotes_arredondada', v_pacotes_arredondados,
            'valor_total', ROUND(v_valor_total, 2),
            'valor_por_m2', ROUND(v_valor_por_m2, 2)
        ),
        'economias', jsonb_build_object(
            'peso_total_kg', ROUND(p_area_telhado * v_telha.peso_kg_m2, 2),
            'peso_vs_ceramica', ROUND(p_area_telhado * (40 - v_telha.peso_kg_m2), 2),
            'economia_estrutural', 'Redução significativa no peso da estrutura'
        )
    );
    
    RETURN v_resultado;
END;
$$ LANGUAGE plpgsql;

-- View para facilitar consultas
CREATE OR REPLACE VIEW public.v_telhas_shingle_resumo AS
SELECT 
    id,
    codigo,
    linha,
    descricao,
    cor,
    fator_multiplicador,
    qtd_unidade_venda,
    preco_unitario,
    ROUND(preco_unitario * fator_multiplicador * 1.05, 2) as valor_por_m2_com_quebra,
    peso_kg_m2,
    garantia_anos,
    resistencia_vento_kmh,
    ativo
FROM public.telhas_shingle
WHERE ativo = true
ORDER BY linha, preco_unitario;