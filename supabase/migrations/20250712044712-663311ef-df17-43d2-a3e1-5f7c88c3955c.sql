-- Sistema de Cálculo de Energia Solar
-- Criando estrutura completa para propostas fotovoltaicas

-- 1. Tabela de Irradiação Solar por Região
CREATE TABLE public.irradiacao_solar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estado TEXT NOT NULL,
  cidade TEXT NOT NULL,
  latitude DECIMAL,
  longitude DECIMAL,
  irradiacao_media_anual DECIMAL NOT NULL, -- kWh/m²/dia
  irradiacao_por_mes JSONB, -- array com 12 valores mensais
  fator_correcao DECIMAL DEFAULT 1.0,
  fonte_dados TEXT,
  data_atualizacao DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Configurações do Sistema Solar
CREATE TABLE public.energia_solar_configuracoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  fator_perdas DECIMAL DEFAULT 0.8, -- perdas do sistema (20%)
  fator_seguranca DECIMAL DEFAULT 1.1, -- margem de segurança
  fator_sombreamento DECIMAL DEFAULT 0.95,
  custo_instalacao_wp DECIMAL, -- R$/Wp instalado
  margem_comercial DECIMAL DEFAULT 0.3, -- 30% de margem
  vigencia_dias INTEGER DEFAULT 30,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Expandir tabela produtos para energia solar
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS potencia_wp DECIMAL;
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS eficiencia DECIMAL;
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS tensao_v DECIMAL;
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS corrente_a DECIMAL;
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS dimensoes JSONB; -- {largura, altura, profundidade}
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS peso_kg DECIMAL;
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS garantia_anos INTEGER;
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS especificacoes_tecnicas JSONB;
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS compatibilidades JSONB; -- tipos de telha, sistemas compatíveis
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS fabricante TEXT;

-- 4. Tabela de Cálculos de Energia Solar
CREATE TABLE public.energia_solar_calculos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposta_id UUID REFERENCES public.propostas(id),
  
  -- Dados de entrada
  consumo_mensal_kwh DECIMAL NOT NULL,
  irradiacao_local DECIMAL NOT NULL,
  tipo_instalacao TEXT, -- 'residencial', 'comercial', 'industrial'
  tipo_telha TEXT,
  area_disponivel DECIMAL,
  
  -- Resultados do dimensionamento
  potencia_sistema_kwp DECIMAL NOT NULL,
  quantidade_paineis INTEGER NOT NULL,
  painel_selecionado_id UUID REFERENCES public.produtos(id),
  inversor_selecionado_id UUID REFERENCES public.produtos(id),
  
  -- Cálculos energéticos
  geracao_estimada_mensal_kwh DECIMAL,
  geracao_estimada_anual_kwh DECIMAL,
  economia_mensal_estimada DECIMAL,
  economia_anual_estimada DECIMAL,
  
  -- Cálculos financeiros
  valor_equipamentos DECIMAL,
  valor_instalacao DECIMAL,
  valor_total DECIMAL,
  payback_simples_anos DECIMAL,
  payback_descontado_anos DECIMAL,
  vpl_25_anos DECIMAL,
  
  -- Dados técnicos
  area_ocupada_m2 DECIMAL,
  peso_total_kg DECIMAL,
  
  -- Metadados
  configuracao_utilizada_id UUID REFERENCES public.energia_solar_configuracoes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Histórico de Cálculos
CREATE TABLE public.calculos_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  energia_solar_calculo_id UUID REFERENCES public.energia_solar_calculos(id),
  etapa TEXT, -- 'dimensionamento', 'selecao_equipamentos', 'precificacao'
  inputs JSONB,
  outputs JSONB,
  formula_utilizada TEXT,
  tempo_processamento_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Função de Dimensionamento Principal
CREATE OR REPLACE FUNCTION public.dimensionar_sistema(
  p_consumo_kwh DECIMAL,
  p_cidade TEXT,
  p_estado TEXT,
  p_tipo_instalacao TEXT DEFAULT 'residencial'
) RETURNS JSONB AS $$
DECLARE
  v_irradiacao DECIMAL;
  v_fator_perdas DECIMAL;
  v_fator_seguranca DECIMAL;
  v_potencia_necessaria DECIMAL;
  v_resultado JSONB;
BEGIN
  -- Buscar irradiação da localidade
  SELECT irradiacao_media_anual INTO v_irradiacao
  FROM irradiacao_solar
  WHERE cidade ILIKE p_cidade AND estado ILIKE p_estado
  LIMIT 1;
  
  -- Se não encontrar a cidade exata, usar média do estado
  IF v_irradiacao IS NULL THEN
    SELECT AVG(irradiacao_media_anual) INTO v_irradiacao
    FROM irradiacao_solar
    WHERE estado ILIKE p_estado;
  END IF;
  
  -- Buscar fatores de configuração
  SELECT fator_perdas, fator_seguranca INTO v_fator_perdas, v_fator_seguranca
  FROM energia_solar_configuracoes
  WHERE ativo = true
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Valores padrão se não houver configuração
  v_fator_perdas := COALESCE(v_fator_perdas, 0.8);
  v_fator_seguranca := COALESCE(v_fator_seguranca, 1.1);
  v_irradiacao := COALESCE(v_irradiacao, 4.5); -- Média Brasil
  
  -- Calcular potência necessária
  -- Fórmula: Potência = (Consumo mensal × 12) / (Irradiação × 365 × Fator de perdas)
  v_potencia_necessaria := (p_consumo_kwh * 12) / (v_irradiacao * 365 * v_fator_perdas) * v_fator_seguranca;
  
  -- Retornar resultado
  v_resultado := jsonb_build_object(
    'potencia_necessaria_kwp', ROUND(v_potencia_necessaria, 2),
    'irradiacao_local', v_irradiacao,
    'geracao_estimada_anual', ROUND(v_potencia_necessaria * v_irradiacao * 365 * v_fator_perdas, 2),
    'economia_mensal_estimada', p_consumo_kwh * 0.95, -- 95% de offset
    'economia_anual_estimada', p_consumo_kwh * 12 * 0.95,
    'fatores_utilizados', jsonb_build_object(
      'fator_perdas', v_fator_perdas,
      'fator_seguranca', v_fator_seguranca,
      'irradiacao', v_irradiacao
    )
  );
  
  RETURN v_resultado;
END;
$$ LANGUAGE plpgsql;

-- 7. Função de Seleção de Equipamentos
CREATE OR REPLACE FUNCTION public.selecionar_equipamentos(
  p_potencia_kwp DECIMAL,
  p_tipo_telha TEXT DEFAULT 'ceramica',
  p_area_disponivel DECIMAL DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_painel RECORD;
  v_inversor RECORD;
  v_quantidade_paineis INTEGER;
  v_potencia_paineis DECIMAL;
  v_resultado JSONB;
BEGIN
  -- Selecionar painel mais adequado
  SELECT * INTO v_painel
  FROM produtos
  WHERE categoria = 'painel-solar'
    AND ativo = true
    AND (compatibilidades->>'tipos_telha' IS NULL OR compatibilidades->'tipos_telha' ? p_tipo_telha)
  ORDER BY (potencia_wp / preco_unitario) DESC -- Melhor custo-benefício
  LIMIT 1;
  
  -- Se não encontrar painel específico, usar padrão
  IF v_painel.id IS NULL THEN
    SELECT * INTO v_painel
    FROM produtos
    WHERE categoria = 'painel-solar' AND ativo = true
    ORDER BY potencia_wp DESC
    LIMIT 1;
  END IF;
  
  -- Calcular quantidade de painéis necessária
  v_quantidade_paineis := CEIL(p_potencia_kwp * 1000 / v_painel.potencia_wp);
  v_potencia_paineis := v_quantidade_paineis * v_painel.potencia_wp / 1000.0;
  
  -- Selecionar inversor compatível
  SELECT * INTO v_inversor
  FROM produtos
  WHERE categoria = 'inversor'
    AND ativo = true
    AND potencia_wp >= (v_potencia_paineis * 0.8 * 1000) -- 80% da potência dos painéis
    AND potencia_wp <= (v_potencia_paineis * 1.3 * 1000) -- 130% da potência dos painéis
  ORDER BY potencia_wp ASC
  LIMIT 1;
  
  -- Montar resultado
  v_resultado := jsonb_build_object(
    'painel', jsonb_build_object(
      'id', v_painel.id,
      'modelo', v_painel.nome,
      'fabricante', v_painel.fabricante,
      'quantidade', v_quantidade_paineis,
      'potencia_unitaria', v_painel.potencia_wp,
      'potencia_total', v_potencia_paineis * 1000,
      'preco_unitario', v_painel.preco_unitario,
      'preco_total', v_painel.preco_unitario * v_quantidade_paineis
    ),
    'inversor', jsonb_build_object(
      'id', v_inversor.id,
      'modelo', v_inversor.nome,
      'fabricante', v_inversor.fabricante,
      'potencia', v_inversor.potencia_wp,
      'preco', v_inversor.preco_unitario
    ),
    'resumo', jsonb_build_object(
      'potencia_sistema', v_potencia_paineis,
      'quantidade_paineis', v_quantidade_paineis,
      'area_estimada', v_quantidade_paineis * 2.0 -- estimativa 2m² por painel
    )
  );
  
  RETURN v_resultado;
END;
$$ LANGUAGE plpgsql;

-- 8. Função de Precificação
CREATE OR REPLACE FUNCTION public.calcular_orcamento(
  p_painel_id UUID,
  p_quantidade_paineis INTEGER,
  p_inversor_id UUID,
  p_potencia_sistema DECIMAL
) RETURNS JSONB AS $$
DECLARE
  v_preco_paineis DECIMAL;
  v_preco_inversor DECIMAL;
  v_custo_instalacao DECIMAL;
  v_margem DECIMAL;
  v_valor_total DECIMAL;
  v_resultado JSONB;
BEGIN
  -- Buscar preços dos equipamentos
  SELECT preco_unitario * p_quantidade_paineis INTO v_preco_paineis
  FROM produtos WHERE id = p_painel_id;
  
  SELECT preco_unitario INTO v_preco_inversor
  FROM produtos WHERE id = p_inversor_id;
  
  -- Buscar configurações de instalação
  SELECT custo_instalacao_wp, margem_comercial INTO v_custo_instalacao, v_margem
  FROM energia_solar_configuracoes
  WHERE ativo = true
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Valores padrão
  v_custo_instalacao := COALESCE(v_custo_instalacao, 1.5); -- R$ 1,50/Wp
  v_margem := COALESCE(v_margem, 0.3); -- 30%
  
  -- Calcular custos
  v_custo_instalacao := v_custo_instalacao * p_potencia_sistema * 1000;
  v_valor_total := (v_preco_paineis + v_preco_inversor + v_custo_instalacao) * (1 + v_margem);
  
  v_resultado := jsonb_build_object(
    'equipamentos', jsonb_build_object(
      'paineis', v_preco_paineis,
      'inversor', v_preco_inversor
    ),
    'instalacao', v_custo_instalacao,
    'subtotal', v_preco_paineis + v_preco_inversor + v_custo_instalacao,
    'margem_aplicada', v_margem * 100,
    'valor_total', ROUND(v_valor_total, 2),
    'valor_kwp_instalado', ROUND(v_valor_total / p_potencia_sistema, 2)
  );
  
  RETURN v_resultado;
END;
$$ LANGUAGE plpgsql;

-- 9. Função de Cálculo de Payback
CREATE OR REPLACE FUNCTION public.calcular_payback(
  p_valor_investimento DECIMAL,
  p_economia_mensal DECIMAL,
  p_tarifa_energia DECIMAL DEFAULT 0.75,
  p_taxa_desconto DECIMAL DEFAULT 0.06
) RETURNS JSONB AS $$
DECLARE
  v_economia_anual DECIMAL;
  v_payback_simples DECIMAL;
  v_payback_descontado DECIMAL;
  v_vpl_25_anos DECIMAL;
  v_resultado JSONB;
  i INTEGER;
  v_fluxo_anual DECIMAL;
  v_vp_fluxo DECIMAL;
BEGIN
  v_economia_anual := p_economia_mensal * 12 * p_tarifa_energia;
  
  -- Payback simples
  v_payback_simples := p_valor_investimento / v_economia_anual;
  
  -- Payback descontado e VPL
  v_vpl_25_anos := -p_valor_investimento; -- investimento inicial
  v_payback_descontado := NULL;
  
  FOR i IN 1..25 LOOP
    v_fluxo_anual := v_economia_anual * POWER(1.02, i-1); -- inflação energia 2% ao ano
    v_vp_fluxo := v_fluxo_anual / POWER(1 + p_taxa_desconto, i);
    v_vpl_25_anos := v_vpl_25_anos + v_vp_fluxo;
    
    -- Calcular payback descontado
    IF v_payback_descontado IS NULL AND v_vpl_25_anos > 0 THEN
      v_payback_descontado := i;
    END IF;
  END LOOP;
  
  v_resultado := jsonb_build_object(
    'payback_simples_anos', ROUND(v_payback_simples, 1),
    'payback_descontado_anos', COALESCE(v_payback_descontado, 25),
    'vpl_25_anos', ROUND(v_vpl_25_anos, 2),
    'economia_anual', ROUND(v_economia_anual, 2),
    'tir_estimada', CASE 
      WHEN v_payback_simples > 0 THEN ROUND((1/v_payback_simples) * 100, 1)
      ELSE 0
    END
  );
  
  RETURN v_resultado;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_irradiacao_solar_updated_at
  BEFORE UPDATE ON public.irradiacao_solar
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_energia_solar_configuracoes_updated_at
  BEFORE UPDATE ON public.energia_solar_configuracoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_energia_solar_calculos_updated_at
  BEFORE UPDATE ON public.energia_solar_calculos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados iniciais de irradiação (principais cidades brasileiras)
INSERT INTO public.irradiacao_solar (estado, cidade, latitude, longitude, irradiacao_media_anual, fonte_dados) VALUES
('SP', 'São Paulo', -23.5505, -46.6333, 4.56, 'INMET/CRESESB'),
('RJ', 'Rio de Janeiro', -22.9068, -43.1729, 5.24, 'INMET/CRESESB'),
('MG', 'Belo Horizonte', -19.9208, -43.9378, 5.42, 'INMET/CRESESB'),
('RS', 'Porto Alegre', -30.0346, -51.2177, 4.73, 'INMET/CRESESB'),
('PR', 'Curitiba', -25.4284, -49.2733, 4.84, 'INMET/CRESESB'),
('SC', 'Florianópolis', -27.5954, -48.5480, 4.78, 'INMET/CRESESB'),
('BA', 'Salvador', -12.9714, -38.5014, 5.69, 'INMET/CRESESB'),
('PE', 'Recife', -8.0476, -34.8770, 5.87, 'INMET/CRESESB'),
('CE', 'Fortaleza', -3.7172, -38.5434, 6.12, 'INMET/CRESESB'),
('GO', 'Goiânia', -16.6799, -49.2550, 5.31, 'INMET/CRESESB'),
('DF', 'Brasília', -15.7801, -47.9292, 5.23, 'INMET/CRESESB'),
('AM', 'Manaus', -3.1190, -60.0217, 4.35, 'INMET/CRESESB'),
('PA', 'Belém', -1.4558, -48.5044, 4.81, 'INMET/CRESESB'),
('MT', 'Cuiabá', -15.6014, -56.0979, 5.54, 'INMET/CRESESB'),
('MS', 'Campo Grande', -20.4697, -54.6201, 5.45, 'INMET/CRESESB');

-- Inserir configuração padrão do sistema
INSERT INTO public.energia_solar_configuracoes (
  nome, 
  fator_perdas, 
  fator_seguranca, 
  fator_sombreamento, 
  custo_instalacao_wp, 
  margem_comercial,
  vigencia_dias
) VALUES (
  'Configuração Padrão 2025',
  0.85, -- 15% de perdas (inversor, cabeamento, sombreamento)
  1.1,  -- 10% de margem de segurança
  0.95, -- 5% de perdas por sombreamento
  1.50, -- R$ 1,50 por Wp instalado
  0.25, -- 25% de margem comercial
  30    -- 30 dias de validade
);

-- Inserir produtos solares básicos
INSERT INTO public.produtos (
  nome, categoria, fabricante, potencia_wp, eficiencia, tensao_v, 
  preco_unitario, unidade, dimensoes, peso_kg, garantia_anos,
  especificacoes_tecnicas, compatibilidades
) VALUES 
(
  'Painel Canadian Solar 450W', 'painel-solar', 'Canadian Solar', 450, 20.9, 41.5,
  650.00, 'un', 
  '{"largura": 1134, "altura": 2108, "profundidade": 35}'::jsonb,
  24.5, 25,
  '{"tipo": "monocristalino", "certificacoes": ["INMETRO", "IEC61215"]}'::jsonb,
  '{"tipos_telha": ["ceramica", "concreto", "metalica", "fibrocimento"]}'::jsonb
),
(
  'Painel Jinko Solar 550W', 'painel-solar', 'Jinko Solar', 550, 21.76, 49.5,
  780.00, 'un',
  '{"largura": 1134, "altura": 2274, "profundidade": 35}'::jsonb,
  27.5, 25,
  '{"tipo": "monocristalino", "certificacoes": ["INMETRO", "IEC61215"]}'::jsonb,
  '{"tipos_telha": ["ceramica", "concreto", "metalica", "fibrocimento"]}'::jsonb
),
(
  'Inversor Growatt 3kW', 'inversor', 'Growatt', 3000, 97.6, 220,
  1200.00, 'un',
  '{"largura": 270, "altura": 370, "profundidade": 141}'::jsonb,
  9.5, 10,
  '{"tipo": "string", "mppt": 1, "monitoramento": "wifi"}'::jsonb,
  '{"sistemas": ["on-grid"], "fases": ["monofasico"]}'::jsonb
),
(
  'Inversor Fronius 5kW', 'inversor', 'Fronius', 5000, 98.1, 220,
  2850.00, 'un',
  '{"largura": 431, "altura": 645, "profundidade": 204}'::jsonb,
  19.5, 12,
  '{"tipo": "string", "mppt": 2, "monitoramento": "ethernet"}'::jsonb,
  '{"sistemas": ["on-grid"], "fases": ["monofasico", "bifasico"]}'::jsonb
);

-- RLS Policies para as novas tabelas
ALTER TABLE public.irradiacao_solar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energia_solar_configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energia_solar_calculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculos_historico ENABLE ROW LEVEL SECURITY;

-- Políticas temporárias de acesso público
CREATE POLICY "Acesso público temporário irradiacao" ON public.irradiacao_solar FOR ALL USING (true);
CREATE POLICY "Acesso público temporário configuracoes" ON public.energia_solar_configuracoes FOR ALL USING (true);
CREATE POLICY "Acesso público temporário calculos" ON public.energia_solar_calculos FOR ALL USING (true);
CREATE POLICY "Acesso público temporário historico" ON public.calculos_historico FOR ALL USING (true);