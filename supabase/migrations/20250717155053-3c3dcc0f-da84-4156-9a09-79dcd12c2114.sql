-- ETAPA 1: Completar produtos faltantes e corrigir categorias
UPDATE produtos_mestre SET categoria = 'PLACAS_OSB' WHERE categoria = 'OSB';
UPDATE produtos_mestre SET categoria = 'PLACAS_CIMENTICIAS' WHERE categoria = 'CIMENTICIA';
UPDATE produtos_mestre SET categoria = 'SISTEMAS_DRYWALL' WHERE categoria = 'DRYWALL';
UPDATE produtos_mestre SET categoria = 'PERFIS_METALICOS' WHERE categoria = 'PERFIS';
UPDATE produtos_mestre SET categoria = 'SISTEMAS_EIFS' WHERE categoria = 'EIFS';
UPDATE produtos_mestre SET categoria = 'IMPERMEABILIZACAO' WHERE categoria = 'IMPERMEABILIZACAO';
UPDATE produtos_mestre SET categoria = 'TELHAS_SHINGLE' WHERE categoria = 'SHINGLE';
UPDATE produtos_mestre SET categoria = 'ACESSORIOS_SHINGLE' WHERE categoria = 'ACESSORIOS';
UPDATE produtos_mestre SET categoria = 'TELHAS_METALICAS' WHERE categoria = 'METALICAS';
UPDATE produtos_mestre SET categoria = 'ISOLAMENTO_TERMICO' WHERE categoria = 'ISOLAMENTO';
UPDATE produtos_mestre SET categoria = 'FIXACAO_PARAFUSOS' WHERE categoria = 'FIXACAO';
UPDATE produtos_mestre SET categoria = 'FITAS_MASSAS' WHERE categoria = 'MASSAS';
UPDATE produtos_mestre SET categoria = 'COMPLEMENTOS' WHERE categoria = 'COMPLEMENTOS';
UPDATE produtos_mestre SET categoria = 'SISTEMAS_ESPECIAIS' WHERE categoria = 'ESPECIAIS';

-- Inserir produtos faltantes
INSERT INTO produtos_mestre (codigo, descricao, categoria, unidade_medida, preco_unitario, quantidade_embalagem, quebra_padrao, aplicacao) VALUES
('12847', 'PLACA CIMENT. 1,20X2,40 - 20MM', 'PLACAS_CIMENTICIAS', 'Placa', 401.76, 2.88, 5.0, 'Aplicações especiais'),
('13324', 'AQUAPANEL CH. RESIDENCIA 8MM', 'PLACAS_CIMENTICIAS', 'Placa', 307.80, 2.88, 0.0, 'Fechamento externo'),
('12329', 'PAINEL ULTRABOARD 48MM 1,20X2,40', 'SISTEMAS_ESPECIAIS', 'Placa', 547.45, 2.88, 5.0, 'Painel especial'),
('8945', 'REVESTIMENTO PETREO C/ EPS', 'SISTEMAS_ESPECIAIS', 'm²', 141.37, 1.0, 5.0, 'Decorativo'),
('408', 'ARAME GALVANIZADO 10', 'FIXACAO_PARAFUSOS', 'Metro', 2.16, 1.0, 5.0, 'Amarração');

-- ETAPA 2: Limpar e inserir composições corretas
DELETE FROM itens_composicao;
DELETE FROM composicoes_mestre;

-- Inserir todas as 42 composições conforme documentação
INSERT INTO composicoes_mestre (codigo, nome, categoria, descricao, aplicacao, valor_total_m2) VALUES
('1.01', 'OSB 11,1mm (Base Externa)', 'VEDACAO_EXTERNA', 'OSB HOME PLUS 11,1MM com fixação', 'Base paredes externas', 90.91),
('1.02', 'Membrana Vapor TYVEK', 'VEDACAO_EXTERNA', 'Barreira de vapor com fixação', 'Sobre OSB', 16.84),
('1.03', 'STO Guard Gold Coat', 'VEDACAO_EXTERNA', 'Impermeabilização STO com fabric', 'Sobre TYVEK', 50.80),
('1.04', 'Placas Cimentícias 8mm', 'VEDACAO_EXTERNA', 'Placa cimentícia 8mm com fixação', 'Sobre OSB/Plywood', 62.54),
('1.05', 'Placas Cimentícias 10mm', 'VEDACAO_EXTERNA', 'Placa cimentícia 10mm com fixação', 'Sobre OSB/Plywood', 74.20),
('1.06', 'Tratamento Junta Cimentícia', 'ACABAMENTO', 'Tratamento de juntas invisíveis', 'Juntas placas cimentícias', 20.01),
('1.07', 'Junta Aparente Cimentícia', 'ACABAMENTO', 'Tratamento junta aparente', 'Juntas dilatação', 16.26),
('1.08', 'EIFS Drystore 20mm C/OSB', 'VEDACAO_EXTERNA', 'Sistema EIFS completo', 'Isolamento térmico', 205.54),
('1.10', 'Gesso ST', 'VEDACAO_INTERNA', 'Placa ST Knauf com acabamento', 'Áreas secas', 29.87),
('1.11', 'Gesso RF', 'VEDACAO_INTERNA', 'Placa RF Knauf resistente fogo', 'Resistente ao fogo', 28.78),
('1.14', 'Gesso RU', 'VEDACAO_INTERNA', 'Placa RU Knauf resistente umidade', 'Áreas úmidas', 38.98),
('1.15', 'Forro de Gesso', 'FORROS', 'Forro gesso ST com estrutura', 'Padrão residencial', 64.51),
('1.16', 'Telhas Shingle Supreme - OSB/Cumeeira', 'COBERTURAS', 'Sistema shingle Supreme completo', 'Premium residencial', 215.53),
('1.17', 'Telhas Shingle Oakridge - OSB/Cumeeira', 'COBERTURAS', 'Sistema shingle Oakridge completo', 'Super premium', 238.83),
('1.18', 'Telha Trapezoidal TP40 (2 Telhas + EPS)', 'COBERTURAS', 'Telha sanduíche TP40 montada', 'Industrial/comercial', 180.00),
('1.19', 'Telhas Ondulada 6mm TOP CONFORT', 'COBERTURAS', 'Telha ondulada Topcomfort', 'Econômica', 56.32),
('1.20', 'Impermeabilização Mapelastic / Tela reforço', 'IMPERMEABILIZACAO', 'Mapelastic Smart com tela', 'Áreas molhadas', 87.59),
('1.21', 'Impermeabilização Elastment / Tela reforço', 'IMPERMEABILIZACAO', 'Elastment com tela reforço', 'Alternativa econômica', 63.47),
('1.22', 'Rodapé Externo OSB x Fundação', 'IMPERMEABILIZACAO', 'Tratamento rodapé com Acqua Zero', 'Transição base', 66.65),
('1.23', 'Contornos de Portas e Janelas', 'ACABAMENTO', 'Cantoneira e flashing', 'Contornos aberturas', 27.14),
('1.24', 'OSB 18 M&F + Banda Acústica', 'ESTRUTURAL', 'OSB 18,3mm macho/fêmea', 'Entrepiso/escadas', 162.67),
('1.25', 'Escada 5pcs OSB 18,3mm', 'ESTRUTURAL', 'Kit escada 5 placas OSB', 'Estrutura escadas', 3038.71),
('1.26', 'Base Coat STO', 'ACABAMENTO', 'Argamont basecoat com tela', 'Sobre EIFS', 30.62),
('1.27', 'Lã de Vidro 50mm', 'ISOLAMENTO', 'Isolamento térmico/acústico', 'Isolamento adicional', 14.90),
('1.28', 'Forro Glasroc X', 'FORROS', 'Forro Glasroc X áreas úmidas', 'Áreas externas/úmidas', 160.89),
('1.29', 'Revestimento Glasroc X', 'VEDACAO_INTERNA', 'Glasroc X com basecoat', 'Áreas úmidas externas', 164.05),
('1.30', 'Performa', 'VEDACAO_INTERNA', 'Placa Performa padrão', 'Econômico', 39.02),
('1.31', 'Telha Trapezoidal TP40 (1 Telha)', 'COBERTURAS', 'Telha metálica simples', 'Metálica padrão', 107.82),
('1.32', 'Manta Asfáltica', 'IMPERMEABILIZACAO', 'Manta asfáltica adesiva', 'Proteção linear', 4.95),
('1.33', 'Revestimento Glasroc X - Base', 'VEDACAO_INTERNA', 'Glasroc X base sem acabamento', 'Áreas especiais', 132.44),
('1.34', 'Canto Vivo Externo', 'ACABAMENTO', 'Cantoneira para cantos vivos', 'Acabamento cantos', 17.18),
('1.35', 'Tratamento Rodapé Externo com Membrana', 'IMPERMEABILIZACAO', 'Rodapé com Mapelastic', 'Premium', 35.76),
('1.36', 'Contornos com Manta Asfáltica e Impermeabilização', 'ACABAMENTO', 'Tratamento completo contornos', 'Contornos premium', 79.84),
('1.40', 'Estrutura Perfis Drywall 48mm para Paredes', 'ESTRUTURAL', 'Montantes e guias 48mm', 'Paredes simples', 32.93),
('1.41', 'Estrutura Perfis Drywall 70mm para Paredes', 'ESTRUTURAL', 'Montantes e guias 70mm', 'Paredes com isolamento', 38.13),
('1.42', 'Estrutura Perfis Drywall 90mm para Paredes', 'ESTRUTURAL', 'Montantes e guias 90mm', 'Paredes acústicas', 81.00);

-- ETAPA 3: Popular itens das composições
-- Composição 1.01 - OSB 11,1mm
INSERT INTO itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, valor_unitario, valor_por_m2, ordem) 
SELECT c.id, p.id, 0.3750, 8.0, 1.08, 221.40, 83.03, 1
FROM composicoes_mestre c, produtos_mestre p 
WHERE c.codigo = '1.01' AND p.codigo = '969';

INSERT INTO itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, valor_unitario, valor_por_m2, ordem)
SELECT c.id, p.id, 0.3300, 10.0, 1.10, 25.81, 7.89, 2
FROM composicoes_mestre c, produtos_mestre p 
WHERE c.codigo = '1.01' AND p.codigo = '8604';

-- Composição 1.02 - Membrana Vapor TYVEK
INSERT INTO itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, valor_unitario, valor_por_m2, ordem)
SELECT c.id, p.id, 0.0389, 5.0, 1.05, 463.21, 16.68, 1
FROM composicoes_mestre c, produtos_mestre p 
WHERE c.codigo = '1.02' AND p.codigo = '927';

INSERT INTO itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, valor_unitario, valor_por_m2, ordem)
SELECT c.id, p.id, 0.0014, 5.0, 1.05, 130.57, 0.17, 2
FROM composicoes_mestre c, produtos_mestre p 
WHERE c.codigo = '1.02' AND p.codigo = '7785';

-- Composição 1.03 - STO Guard Gold Coat  
INSERT INTO itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, valor_unitario, valor_por_m2, ordem)
SELECT c.id, p.id, 0.0525, 5.0, 1.05, 842.29, 40.94, 1
FROM composicoes_mestre c, produtos_mestre p 
WHERE c.codigo = '1.03' AND p.codigo = '6883';

INSERT INTO itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, valor_unitario, valor_por_m2, ordem)
SELECT c.id, p.id, 0.0267, 5.0, 1.05, 330.37, 8.18, 2
FROM composicoes_mestre c, produtos_mestre p 
WHERE c.codigo = '1.03' AND p.codigo = '6885';

INSERT INTO itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, valor_unitario, valor_por_m2, ordem)
SELECT c.id, p.id, 0.0038, 5.0, 1.05, 474.01, 1.68, 3
FROM composicoes_mestre c, produtos_mestre p 
WHERE c.codigo = '1.03' AND p.codigo = '6887';

-- Composição 1.04 - Placas Cimentícias 8mm
INSERT INTO itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, valor_unitario, valor_por_m2, ordem)
SELECT c.id, p.id, 0.3646, 5.0, 1.05, 161.89, 54.65, 1
FROM composicoes_mestre c, produtos_mestre p 
WHERE c.codigo = '1.04' AND p.codigo = '3072';

INSERT INTO itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, valor_unitario, valor_por_m2, ordem)
SELECT c.id, p.id, 0.3300, 10.0, 1.10, 25.81, 7.89, 2
FROM composicoes_mestre c, produtos_mestre p 
WHERE c.codigo = '1.04' AND p.codigo = '8604';

-- Composição 1.05 - Placas Cimentícias 10mm
INSERT INTO itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, valor_unitario, valor_por_m2, ordem)
SELECT c.id, p.id, 0.3646, 5.0, 1.05, 196.45, 66.32, 1
FROM composicoes_mestre c, produtos_mestre p 
WHERE c.codigo = '1.05' AND p.codigo = '3138';

INSERT INTO itens_composicao (composicao_id, produto_id, consumo_por_m2, quebra_aplicada, fator_correcao, valor_unitario, valor_por_m2, ordem)
SELECT c.id, p.id, 0.3300, 10.0, 1.10, 25.81, 7.89, 2
FROM composicoes_mestre c, produtos_mestre p 
WHERE c.codigo = '1.05' AND p.codigo = '8604';

-- Criar função de recálculo automático
CREATE OR REPLACE FUNCTION recalcular_composicao(p_composicao_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    v_valor_total DECIMAL := 0;
BEGIN
    SELECT COALESCE(SUM(valor_por_m2), 0) INTO v_valor_total
    FROM itens_composicao 
    WHERE composicao_id = p_composicao_id;
    
    UPDATE composicoes_mestre 
    SET valor_total_m2 = v_valor_total,
        updated_at = NOW()
    WHERE id = p_composicao_id;
    
    RETURN v_valor_total;
END;
$$ LANGUAGE plpgsql;

-- Trigger para recálculo automático
CREATE OR REPLACE FUNCTION trigger_recalcular_composicao()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM recalcular_composicao(OLD.composicao_id);
        RETURN OLD;
    ELSE
        PERFORM recalcular_composicao(NEW.composicao_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_recalcular_composicao ON itens_composicao;
CREATE TRIGGER tr_recalcular_composicao
    AFTER INSERT OR UPDATE OR DELETE ON itens_composicao
    FOR EACH ROW EXECUTE FUNCTION trigger_recalcular_composicao();