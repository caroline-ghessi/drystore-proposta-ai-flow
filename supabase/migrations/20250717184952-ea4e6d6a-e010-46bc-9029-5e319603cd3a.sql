-- Migração de Limpeza: Remover composições não aprovadas e dados fictícios

-- 1. Remover itens de composições não aprovadas
DELETE FROM public.itens_composicao 
WHERE composicao_id IN (
  SELECT id FROM composicoes_mestre 
  WHERE codigo NOT LIKE '1.%' 
  OR codigo NOT IN (
    '1.01', '1.02', '1.03', '1.04', '1.05', '1.06', '1.07', '1.08', '1.10', '1.11',
    '1.14', '1.15', '1.16', '1.17', '1.18', '1.19', '1.20', '1.21', '1.22', '1.23',
    '1.24', '1.25', '1.26', '1.27', '1.28', '1.29', '1.30', '1.31', '1.32', '1.33',
    '1.34', '1.35', '1.36', '1.40', '1.41', '1.42'
  )
);

-- 2. Remover mapeamentos de tipos de proposta para composições não aprovadas
DELETE FROM public.tipo_proposta_composicoes 
WHERE composicao_id IN (
  SELECT id FROM composicoes_mestre 
  WHERE codigo NOT LIKE '1.%' 
  OR codigo NOT IN (
    '1.01', '1.02', '1.03', '1.04', '1.05', '1.06', '1.07', '1.08', '1.10', '1.11',
    '1.14', '1.15', '1.16', '1.17', '1.18', '1.19', '1.20', '1.21', '1.22', '1.23',
    '1.24', '1.25', '1.26', '1.27', '1.28', '1.29', '1.30', '1.31', '1.32', '1.33',
    '1.34', '1.35', '1.36', '1.40', '1.41', '1.42'
  )
);

-- 3. Remover composições não aprovadas (não estão no catálogo oficial)
DELETE FROM public.composicoes_mestre 
WHERE codigo NOT LIKE '1.%' 
OR codigo NOT IN (
  '1.01', '1.02', '1.03', '1.04', '1.05', '1.06', '1.07', '1.08', '1.10', '1.11',
  '1.14', '1.15', '1.16', '1.17', '1.18', '1.19', '1.20', '1.21', '1.22', '1.23',
  '1.24', '1.25', '1.26', '1.27', '1.28', '1.29', '1.30', '1.31', '1.32', '1.33',
  '1.34', '1.35', '1.36', '1.40', '1.41', '1.42'
);

-- 4. Remover mapeamentos de tipos de proposta não alinhados com as categorias corretas
DELETE FROM public.tipo_proposta_composicoes 
WHERE tipo_proposta = 'energia-solar';

DELETE FROM public.tipo_proposta_composicoes 
WHERE tipo_proposta = 'impermeabilizacao';

DELETE FROM public.tipo_proposta_composicoes 
WHERE tipo_proposta = 'divisorias';

DELETE FROM public.tipo_proposta_composicoes 
WHERE tipo_proposta = 'forros';

-- 5. Limpar todos os itens de composições existentes (para permitir configuração gradual)
DELETE FROM public.itens_composicao;

-- 6. Resetar valores das composições para zero (serão calculados quando os itens forem adicionados)
UPDATE public.composicoes_mestre 
SET valor_total_m2 = 0, updated_at = now()
WHERE codigo LIKE '1.%';

-- 7. Inserir as composições oficiais que podem estar faltando (baseado no catálogo)
-- Estas serão inseridas vazias, para serem populadas gradualmente

-- Sistemas de vedação externa
INSERT INTO public.composicoes_mestre (codigo, nome, categoria, aplicacao, descricao, valor_total_m2, ativo) VALUES
('1.01', 'OSB 11,1mm (Base Externa)', 'VEDACAO_EXTERNA', 'Base paredes externas', 'LP OSB HOME PLUS 11,1MM + fixação', 0, true),
('1.02', 'Membrana Vapor TYVEK', 'VEDACAO_EXTERNA', 'Impermeabilização', 'TYVEK HOME WRAP 914MM', 0, true),
('1.03', 'STO Guard Gold Coat', 'VEDACAO_EXTERNA', 'Impermeabilização', 'STO GOLD COAT com tecidos', 0, true),
('1.04', 'Placas Cimentícias 8mm', 'VEDACAO_EXTERNA', 'Revestimento externo', 'Placa cimentícia 8mm + fixação', 0, true),
('1.05', 'Placas Cimentícias 10mm', 'VEDACAO_EXTERNA', 'Revestimento externo', 'Placa cimentícia 10mm + fixação', 0, true),
('1.08', 'EIFS Drystore 20mm C/OSB', 'VEDACAO_EXTERNA', 'Sistema térmico', 'Sistema EIFS completo', 0, true)
ON CONFLICT (codigo) DO NOTHING;

-- Tratamento de juntas
INSERT INTO public.composicoes_mestre (codigo, nome, categoria, aplicacao, descricao, valor_total_m2, ativo) VALUES
('1.06', 'Tratamento Junta Cimentícia', 'ACABAMENTO', 'Juntas', 'Tratamento completo juntas cimentícia', 0, true),
('1.07', 'Junta Aparente Cimentícia', 'ACABAMENTO', 'Juntas', 'Junta aparente com selante', 0, true)
ON CONFLICT (codigo) DO NOTHING;

-- Sistemas drywall
INSERT INTO public.composicoes_mestre (codigo, nome, categoria, aplicacao, descricao, valor_total_m2, ativo) VALUES
('1.10', 'Gesso ST', 'VEDACAO_INTERNA', 'Áreas secas', 'Placa ST + acabamento', 0, true),
('1.11', 'Gesso RF (Resistente ao Fogo)', 'VEDACAO_INTERNA', 'Resistente fogo', 'Placa RF + acabamento', 0, true),
('1.14', 'Gesso RU (Resistente à Umidade)', 'VEDACAO_INTERNA', 'Áreas úmidas', 'Placa RU + acabamento', 0, true),
('1.30', 'Performa', 'VEDACAO_INTERNA', 'Econômico', 'Placa Performa + acabamento', 0, true),
('1.33', 'Revestimento Glasroc X - Base', 'VEDACAO_INTERNA', 'Áreas especiais', 'Glasroc X base', 0, true)
ON CONFLICT (codigo) DO NOTHING;

-- Forros
INSERT INTO public.composicoes_mestre (codigo, nome, categoria, aplicacao, descricao, valor_total_m2, ativo) VALUES
('1.15', 'Forro de Gesso', 'FORROS', 'Residencial', 'Forro gesso completo', 0, true),
('1.28', 'Forro Glasroc X', 'FORROS', 'Áreas externas/úmidas', 'Forro Glasroc X completo', 0, true)
ON CONFLICT (codigo) DO NOTHING;

-- Telhas shingle
INSERT INTO public.composicoes_mestre (codigo, nome, categoria, aplicacao, descricao, valor_total_m2, ativo) VALUES
('1.16', 'Telhas Shingle Supreme - OSB/Cumeeira', 'COBERTURAS', 'Premium residencial', 'Shingle Supreme completo', 0, true),
('1.17', 'Telhas Shingle Oakridge - OSB/Cumeeira', 'COBERTURAS', 'Super premium', 'Shingle Oakridge completo', 0, true)
ON CONFLICT (codigo) DO NOTHING;

-- Coberturas metálicas
INSERT INTO public.composicoes_mestre (codigo, nome, categoria, aplicacao, descricao, valor_total_m2, ativo) VALUES
('1.18', 'Telha Trapezoidal TP40 (2 Telhas + EPS)', 'COBERTURAS', 'Industrial/comercial', 'Telha sanduíche completa', 0, true),
('1.19', 'Telhas Ondulada 6mm TOP CONFORT', 'COBERTURAS', 'Econômica', 'Telha ondulada fibrocimento', 0, true),
('1.31', 'Telha Trapezoidal TP40 (1 Telha)', 'COBERTURAS', 'Metálica padrão', 'Telha metálica simples', 0, true)
ON CONFLICT (codigo) DO NOTHING;

-- Impermeabilização
INSERT INTO public.composicoes_mestre (codigo, nome, categoria, aplicacao, descricao, valor_total_m2, ativo) VALUES
('1.20', 'Impermeabilização Mapelastic / Tela reforço', 'IMPERMEABILIZACAO', 'Áreas molhadas', 'Mapelastic + tela', 0, true),
('1.21', 'Impermeabilização Elastment / Tela reforço', 'IMPERMEABILIZACAO', 'Alternativa econômica', 'Elastment + tela', 0, true),
('1.22', 'Rodapé Externo OSB x Fundação', 'IMPERMEABILIZACAO', 'Transição base', 'Rodapé impermeabilizado', 0, true),
('1.32', 'Manta Asfáltica', 'IMPERMEABILIZACAO', 'Proteção linear', 'Manta asfáltica aplicada', 0, true),
('1.35', 'Tratamento Rodapé Externo com Membrana', 'IMPERMEABILIZACAO', 'Premium', 'Rodapé com membrana', 0, true)
ON CONFLICT (codigo) DO NOTHING;

-- Complementos e acabamentos
INSERT INTO public.composicoes_mestre (codigo, nome, categoria, aplicacao, descricao, valor_total_m2, ativo) VALUES
('1.23', 'Contornos de Portas e Janelas', 'ACABAMENTO', 'Contornos', 'Cantoneira + flashing', 0, true),
('1.24', 'OSB 18 M&F + Banda Acústica', 'ESTRUTURAL', 'Acústico', 'OSB 18mm + banda acústica', 0, true),
('1.25', 'Escada 5pcs OSB 18,3mm', 'ESTRUTURAL', 'Escadas', 'Kit escada OSB', 0, true),
('1.26', 'Base Coat STO', 'ACABAMENTO', 'Base coat', 'Argamassa + tela', 0, true),
('1.27', 'Lã de Vidro 50mm', 'ISOLAMENTO', 'Isolamento', 'Isolamento térmico/acústico', 0, true),
('1.29', 'Revestimento Glasroc X', 'VEDACAO_EXTERNA', 'Áreas externas', 'Glasroc X completo', 0, true),
('1.34', 'Canto Vivo Externo', 'ACABAMENTO', 'Cantos', 'Cantoneira externa', 0, true),
('1.36', 'Contornos com Manta Asfáltica e Impermeabilização', 'ACABAMENTO', 'Contornos especiais', 'Sistema completo contorno', 0, true)
ON CONFLICT (codigo) DO NOTHING;

-- Estruturas metálicas
INSERT INTO public.composicoes_mestre (codigo, nome, categoria, aplicacao, descricao, valor_total_m2, ativo) VALUES
('1.40', 'Estrutura Perfis Drywall 48mm para Paredes', 'ESTRUTURAL', 'Paredes simples', 'Montantes + guias 48mm', 0, true),
('1.41', 'Estrutura Perfis Drywall 70mm para Paredes', 'ESTRUTURAL', 'Paredes com isolamento', 'Montantes + guias 70mm', 0, true),
('1.42', 'Estrutura Perfis Drywall 90mm para Paredes', 'ESTRUTURAL', 'Paredes acústicas', 'Montantes + guias 90mm', 0, true)
ON CONFLICT (codigo) DO NOTHING;