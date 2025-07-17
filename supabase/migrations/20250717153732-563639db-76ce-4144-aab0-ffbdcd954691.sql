-- Fase 1: Criar estrutura unificada de produtos e composições

-- Criar tabela produtos_mestre
CREATE TABLE IF NOT EXISTS public.produtos_mestre (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo TEXT NOT NULL UNIQUE,
    descricao TEXT NOT NULL,
    categoria TEXT NOT NULL,
    unidade_medida TEXT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    quantidade_embalagem DECIMAL(10,3) NOT NULL DEFAULT 1.0,
    quebra_padrao DECIMAL(5,2) NOT NULL DEFAULT 5.0,
    icms_percentual DECIMAL(5,2) DEFAULT 0.0,
    aplicacao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela composicoes_mestre
CREATE TABLE IF NOT EXISTS public.composicoes_mestre (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL,
    valor_total_m2 DECIMAL(10,2) NOT NULL,
    descricao TEXT,
    aplicacao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela itens_composicao
CREATE TABLE IF NOT EXISTS public.itens_composicao (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    composicao_id UUID NOT NULL REFERENCES public.composicoes_mestre(id) ON DELETE CASCADE,
    produto_id UUID NOT NULL REFERENCES public.produtos_mestre(id) ON DELETE CASCADE,
    consumo_por_m2 DECIMAL(10,4) NOT NULL,
    quebra_aplicada DECIMAL(5,2) NOT NULL DEFAULT 5.0,
    fator_correcao DECIMAL(10,4) NOT NULL DEFAULT 1.0,
    valor_unitario DECIMAL(10,2) NOT NULL,
    valor_por_m2 DECIMAL(10,2) NOT NULL,
    ordem INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.produtos_mestre ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.composicoes_mestre ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_composicao ENABLE ROW LEVEL SECURITY;

-- Criar políticas públicas (temporárias)
CREATE POLICY "Produtos mestre públicos" ON public.produtos_mestre FOR ALL USING (true);
CREATE POLICY "Composições mestre públicas" ON public.composicoes_mestre FOR ALL USING (true);
CREATE POLICY "Itens composição públicos" ON public.itens_composicao FOR ALL USING (true);

-- Criar índices para performance
CREATE INDEX idx_produtos_mestre_codigo ON public.produtos_mestre(codigo);
CREATE INDEX idx_produtos_mestre_categoria ON public.produtos_mestre(categoria);
CREATE INDEX idx_composicoes_mestre_codigo ON public.composicoes_mestre(codigo);
CREATE INDEX idx_composicoes_mestre_categoria ON public.composicoes_mestre(categoria);
CREATE INDEX idx_itens_composicao_composicao_id ON public.itens_composicao(composicao_id);
CREATE INDEX idx_itens_composicao_produto_id ON public.itens_composicao(produto_id);

-- Criar trigger para updated_at
CREATE TRIGGER update_produtos_mestre_updated_at
    BEFORE UPDATE ON public.produtos_mestre
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_composicoes_mestre_updated_at
    BEFORE UPDATE ON public.composicoes_mestre
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir os 105 produtos da lista mestre
INSERT INTO public.produtos_mestre (codigo, descricao, categoria, unidade_medida, preco_unitario, quantidade_embalagem, quebra_padrao, icms_percentual, aplicacao) VALUES
-- 1.1 PLACAS E SISTEMAS OSB
('969', 'LP OSB HOME PLUS 11,1MM - 1,20 x 2,40', 'OSB', 'Placa', 221.40, 2.88, 8.0, 17.0, 'Base paredes externas'),
('1793', 'LP OSB HOME PLUS 9,5MM - 1,20 x 2,40', 'OSB', 'Placa', 205.20, 2.88, 8.0, 17.0, 'Base paredes internas/externas'),
('1983', 'LP OSB HP M&F 18,3MM - 1,20 x 2,40', 'OSB', 'Placa', 384.37, 2.88, 5.0, 17.0, 'Base de entrepiso, escadas'),
('11087', 'COMPENSADO TRATADO E-KOMPOSIT', 'OSB', 'Placa', 227.77, 2.88, 8.0, 17.0, 'Base paredes externas (alternativa)'),

-- 1.2 PLACAS CIMENTÍCIAS
('3072', 'PLACA CIMENT. 1,20X2,40 - 08MM', 'CIMENTICIAS', 'Placa', 161.89, 2.88, 5.0, 17.0, 'Sobre OSB/Plywood'),
('3138', 'PLACA CIMENT. 1,20X2,40 - 10MM', 'CIMENTICIAS', 'Placa', 196.45, 2.88, 5.0, 17.0, 'Sobre OSB/Plywood'),
('9074', 'PLACA CIM. ETERNIT 1,20X2,40 - 8MM', 'CIMENTICIAS', 'Placa', 119.77, 2.88, 5.0, 17.0, 'Sobre OSB/Plywood'),
('9262', 'PLACA CIM. ETERNIT 1,20X2,40 - 10MM', 'CIMENTICIAS', 'Placa', 148.93, 2.88, 5.0, 17.0, 'Sobre OSB/Plywood'),
('10710', 'PLACA CIMENTICIA PROFORT 12,5MM', 'CIMENTICIAS', 'Placa', 229.93, 2.88, 5.0, 17.0, 'Direto sobre estrutura'),
('10711', 'PLACA CIMENTICIA PROFORT 8MM', 'CIMENTICIAS', 'Placa', 135.97, 2.88, 5.0, 17.0, 'Sobre OSB/Plywood'),
('10712', 'PLACA CIMENTICIA PROFORT 10MM', 'CIMENTICIAS', 'Placa', 151.09, 2.88, 5.0, 17.0, 'Sobre OSB/Plywood'),
('12847', 'PLACA CIMENT. 1,20X2,40 - 20MM', 'CIMENTICIAS', 'Placa', 401.76, 2.88, 5.0, 17.0, 'Aplicações especiais'),
('13324', 'AQUAPANEL CH. RESIDENCIA 8MM', 'CIMENTICIAS', 'Placa', 307.80, 2.88, 0.0, 0.0, 'Fechamento externo'),

-- 1.3 SISTEMAS DRYWALL
('5417', 'ST PLACA KNAUF - 12,5 X 1200 X 2400', 'DRYWALL', 'Placa', 75.49, 2.88, 5.0, 4.0, 'Standard (ST) - Áreas secas'),
('5044', 'RU PLACA KNAUF - 12,5 X 1200 X 2400', 'DRYWALL', 'Placa', 102.49, 2.88, 5.0, 17.0, 'Resistente Umidade (RU)'),
('6701', 'RF PLACA KNAUF - 12,5 X 1200 X 2400', 'DRYWALL', 'Placa', 72.25, 2.88, 5.0, 17.0, 'Resistente Fogo (RF)'),
('10042', 'PLACA GESSO PERFORMA BR 12,5', 'DRYWALL', 'Placa', 91.80, 2.88, 5.0, 17.0, 'Padrão econômico'),
('9888', 'PLACA GESSO GLASROC X BR 12,5', 'DRYWALL', 'Placa', 293.65, 2.88, 5.0, 17.0, 'Áreas externas/úmidas'),
('10417', 'ST PLACA PLACO - 12,5X1200X1800', 'DRYWALL', 'Placa', 54.97, 2.16, 5.0, 17.0, 'Forro'),

-- 1.4 PERFIS METÁLICOS DRYWALL
('11982', 'Montante drywall 48mm', 'PERFIS', 'Peça 3m', 23.65, 3.0, 7.0, 0.0, 'Paredes simples'),
('4852', 'Guia drywall 48mm', 'PERFIS', 'Peça 3m', 23.65, 3.0, 7.0, 0.0, 'Paredes simples'),
('4256', 'Montante drywall 70mm', 'PERFIS', 'Peça 3m', 34.56, 3.0, 7.0, 0.0, 'Paredes com isolamento'),
('4253', 'Guia drywall 70mm', 'PERFIS', 'Peça 3m', 28.08, 3.0, 7.0, 0.0, 'Paredes com isolamento'),
('4264', 'Montante drywall 90mm', 'PERFIS', 'Peça 3m', 41.04, 3.0, 7.0, 0.0, 'Paredes acústicas'),
('4254', 'Guia drywall 90mm', 'PERFIS', 'Peça 3m', 39.96, 3.0, 7.0, 0.0, 'Paredes acústicas'),
('4287', 'PERFIL F530 S/ST - 3M', 'PERFIS', 'Peça 3m', 24.73, 3.0, 5.0, 17.0, 'Forros'),
('9245', 'SUPORTE NIVELADOR F530 TRIB', 'PERFIS', 'Peça', 2.05, 1.0, 5.0, 17.0, 'Forros'),
('4249', 'CANTONEIRA DE FORRO L 25/30 S/ST', 'PERFIS', 'Peça 3m', 15.01, 3.0, 5.0, 17.0, 'Junção forros'),
('4289', 'TABICA LISA BRANCA S/ST - 3M', 'PERFIS', 'Peça 3m', 33.37, 3.0, 5.0, 17.0, 'Acabamento forro'),

-- 1.5 SISTEMAS EIFS/STO
('6883', 'STO GOLD COAT 18L', 'EIFS', 'Balde', 842.29, 18.0, 5.0, 0.0, 'Base STOGuard'),
('6884', 'ARGAMONT BASECOAT STO 22,6KG', 'EIFS', 'Saco', 97.09, 22.6, 5.0, 4.0, 'Base coat'),
('6885', 'STOGUARD FABRIC 4" 101MM C/55M', 'EIFS', 'Rolo', 330.37, 55.0, 5.0, 4.0, 'Tratamento juntas'),
('6887', 'STOGUARD FABRIC 6" 152MM C/55M', 'EIFS', 'Rolo', 474.01, 55.0, 5.0, 4.0, 'Tratamento juntas'),
('6890', 'STO PRIMER / ADHESIVE-B', 'EIFS', 'Saco', 117.61, 22.6, 5.0, 17.0, 'Fixação EPS'),
('6896', 'STO TELA DE ARMADURA', 'EIFS', 'Rolo', 1691.17, 50.0, 5.0, 17.0, 'Reforço'),
('6901', 'PLACA ISOLANTE STO THERM 25MM', 'EIFS', 'm²', 18.25, 0.25, 5.0, 0.0, 'Isolamento térmico'),
('4472', 'CHAPA EPS 7F 2000X1000X25MM', 'EIFS', 'Placa', 110.05, 2.0, 5.0, 17.0, 'Isolamento'),
('11996', 'ARRUELA EIFS 45 MM', 'EIFS', 'Unidade', 0.97, 1.0, 5.0, 0.0, 'Fixação EPS'),
('9820', 'PARAF 3,5X45 ARRUELA EIFS', 'EIFS', 'Cento', 14.90, 100.0, 5.0, 17.0, 'Fixação arruelas'),
('11890', 'ESPUMA ADESIVA 60 SEGUNDOS', 'EIFS', 'Tubo', 114.37, 1.0, 5.0, 4.0, 'Fixação EPS'),

-- 1.6 IMPERMEABILIZAÇÃO
('11609', 'MAPELASTIC SMART A SACO 20KG', 'IMPERMEABILIZACAO', 'Saco', 123.01, 20.0, 5.0, 4.0, 'Base cimentícia'),
('11610', 'MAPELASTIC SMART B BALDE 10KG', 'IMPERMEABILIZACAO', 'Balde', 509.65, 10.0, 5.0, 4.0, 'Complemento'),
('11617', 'MAPENET 150 ROLO 1X50 MT', 'IMPERMEABILIZACAO', 'Rolo', 22.57, 50.0, 5.0, 4.0, 'Tela reforço'),
('11619', 'MAPEBAND EASY H130 ROLO 30 MT', 'IMPERMEABILIZACAO', 'Rolo', 17.17, 30.0, 5.0, 4.0, 'Transição rodapé'),
('9530', 'ELASTMENT CIMENTO ELASTICO CIN', 'IMPERMEABILIZACAO', 'Balde', 854.17, 20.0, 5.0, 17.0, 'Impermeabilizante'),
('8664', 'ACQUA ZERO IMPERMEAB. DRYLEVIS', 'IMPERMEABILIZACAO', 'Balde', 551.77, 12.0, 5.0, 17.0, 'Impermeabilizante'),
('3837', 'ACQUA ZERO IMPERMEAB. DRYLEVIS', 'IMPERMEABILIZACAO', 'Balde', 222.37, 5.0, 5.0, 17.0, 'Rodapé/transição'),
('10030', 'MANTA 4 MM ADESIVA SEM ALUMINI', 'IMPERMEABILIZACAO', 'Rolo', 165.13, 10.0, 8.0, 17.0, 'Base impermeável'),
('2063', 'TELA P/REF. IMPERMEABILIZACAO', 'IMPERMEABILIZACAO', 'm²', 10.69, 1.0, 5.0, 17.0, 'Reforço'),
('11773', 'VIAFLEX FITA SLEEVE (30CM X 10M)', 'IMPERMEABILIZACAO', 'Rolo', 119.77, 10.0, 5.0, 17.0, 'Contorno portas/janelas'),
('9114', 'FLASHING VIAFLEX BRANCO - 30CM', 'IMPERMEABILIZACAO', 'Rolo', 102.49, 10.0, 5.0, 17.0, 'Contorno aberturas'),

-- 1.7 TELHAS SHINGLE
('10420', 'SHINGLE LP SUPREME CINZA GRAFI', 'TELHAS_SHINGLE', 'Pacote', 277.45, 3.1, 5.0, 0.0, 'SUPREME'),
('9143', 'SHINGLE LP SUPREME CHOCOLATE C', 'TELHAS_SHINGLE', 'Pacote', 277.45, 3.1, 5.0, 17.0, 'SUPREME'),
('6936', 'SHINGLE DRYSTORE DURATION CZ G', 'TELHAS_SHINGLE', 'Pacote', 303.37, 3.05, 5.0, 0.0, 'DURATION'),
('8938', 'SHINGLE DRYSTORE OAKRIDGE DRIF', 'TELHAS_SHINGLE', 'Pacote', 291.49, 3.05, 5.0, 17.0, 'OAKRIDGE'),

-- 1.8 ACESSÓRIOS TELHA SHINGLE
('927', 'TYVEK HOME WRAP 914MM - 27,87M', 'ACESSORIOS_SHINGLE', 'Rolo', 463.21, 27.0, 5.0, 0.0, 'Subcobertura'),
('7427', 'SUBCOBERTURA TYVEK PROTEC 120', 'ACESSORIOS_SHINGLE', 'Rolo', 1533.60, 92.0, 5.0, 0.0, 'Subcobertura especial'),
('3539', 'PREGO ROLO SHINGLE 18X25MM', 'ACESSORIOS_SHINGLE', 'Rolo', 21.49, 100.0, 5.0, 17.0, 'Fixação telha'),
('9960', 'PREGO 3,4X50 SHINGLE ANELADO G', 'ACESSORIOS_SHINGLE', 'Kg', 77.65, 1.0, 5.0, 17.0, 'Fixação cumeeira'),
('7785', 'GRAMPO MAKITA 001708-0A 80W6', 'ACESSORIOS_SHINGLE', 'Pente', 130.57, 1000.0, 5.0, 0.0, 'Fixação subcobertura'),
('5298', 'CUMEEIRA VENTILADA DRYSTORE', 'ACESSORIOS_SHINGLE', 'Peça', 62.53, 1.0, 5.0, 0.0, 'Ventilação cumeeira'),
('5177', 'MONOPOL ASFALTICO PT 310ML', 'ACESSORIOS_SHINGLE', 'Tubo', 32.29, 1.0, 5.0, 17.0, 'Vedação'),
('5322', 'BOBINA ALUMINIO STEP FLASH 150', 'ACESSORIOS_SHINGLE', 'Unidade', 11.77, 1.0, 5.0, 17.0, 'União telha/parede'),

-- 1.9 TELHAS METÁLICAS E ACESSÓRIOS
('4547', 'TELHA NATURAL GL043 AT40/980', 'TELHAS_METALICAS', 'm²', 94.93, 1.0, 5.0, 17.0, 'Trapezoidal'),
('10656', 'TELHA SANDUICHE TP40 (0,43/E)', 'TELHAS_METALICAS', 'Peça', 227.77, 1.0, 5.0, 4.0, 'Sanduíche'),
('5831', 'TELHA TOPCOMFORT BRASILIT 2,44M', 'TELHAS_METALICAS', 'Peça', 128.98, 2.684, 5.0, 17.0, 'Ondulada'),
('5147', 'CUMEEIRA GALVALUME TP40', 'TELHAS_METALICAS', 'Peça', 85.21, 1.0, 5.0, 17.0, 'Cumeeira metálica'),
('7681', 'CUMEEIRA NORM 1,10 TOPCOMFORT', 'TELHAS_METALICAS', 'Peça', 60.37, 1.0, 5.0, 1.0, 'Cumeeira fibrocimento'),
('4560', 'PARAF. PERF. PONTA 3 TELHA/MET', 'TELHAS_METALICAS', 'Cento', 126.25, 100.0, 5.0, 17.0, 'Fixação telha metálica'),
('3346', 'PARAF. PERF PONTA 3 TELHA/META', 'TELHAS_METALICAS', 'Cento', 69.01, 100.0, 5.0, 17.0, 'Fixação alternativa'),

-- 1.10 ISOLAMENTO TÉRMICO/ACÚSTICO
('4715', 'LA VIDRO WF 4+ POP 100 7,5 X 1,2M', 'ISOLAMENTO', 'Rolo', 239.65, 9.0, 5.0, 17.0, '100mm'),
('4714', 'LA VIDRO WF 4+ POP 70 1,2 X 12M', 'ISOLAMENTO', 'Rolo', 290.41, 15.0, 5.0, 17.0, '70mm'),
('4748', 'LA VIDRO WF 4+ POP 50 1,2 X 12M', 'ISOLAMENTO', 'Rolo', 229.93, 15.0, 5.0, 17.0, '50mm'),
('9252', 'FITA BANDA ACÚSTICA KNAUF 95MM', 'ISOLAMENTO', 'Rolo', 171.61, 30.0, 5.0, 17.0, 'Isolamento acústico'),

-- 1.11 FIXAÇÃO E PARAFUSOS
('8604', 'PARAF. AA 4,2 X 32 PB S/ASA 20', 'FIXACAO', 'Cento', 25.81, 100.0, 10.0, 11.0, 'OSB/Cimentícia'),
('7815', 'PARAFUSO TTPC25 - PA', 'FIXACAO', 'Cento', 8.53, 100.0, 5.0, 17.0, 'Drywall s/OSB'),
('703', 'PARAFUSO TTPC25 - PB', 'FIXACAO', 'Cento', 9.61, 100.0, 5.0, 0.0, 'Drywall s/estrutura'),
('9891', 'PARAFUSO GLASROC 25 PA', 'FIXACAO', 'Cento', 22.57, 100.0, 5.0, 4.0, 'Glasroc X'),
('408', 'ARAME GALVANIZADO 10', 'FIXACAO', 'Metro', 2.16, 1.0, 5.0, 17.0, 'Amarração'),

-- 1.12 FITAS E MASSAS PARA JUNTAS
('1935', 'FITA PAPEL P/JUNTAS ANCORA 150M', 'JUNTAS', 'Rolo', 71.17, 150.0, 5.0, 0.0, 'Drywall'),
('7029', 'FITA PAPEL P/JUNTAS KNAUF 150M', 'JUNTAS', 'Rolo', 60.37, 150.0, 5.0, 0.0, 'Knauf'),
('8012', 'FITA TELADA VERTEX', 'JUNTAS', 'Rolo', 96.01, 50.0, 5.0, 17.0, 'Cimentícia/Glasroc'),
('9889', 'FITA HYDRO TAPE MOLD-X10 - 90M', 'JUNTAS', 'Rolo', 49.57, 90.0, 5.0, 4.0, 'Áreas úmidas'),
('10718', 'FITA JUNTA 10CM X 50M PROFORT', 'JUNTAS', 'Rolo', 135.97, 50.0, 5.0, 4.0, 'BC System'),
('6462', 'MASSA DRYWALL EXTRA-FINA ANDRE', 'JUNTAS', 'Balde', 107.89, 28.0, 5.0, 0.0, 'Drywall'),
('7030', 'MASSA P/JUNTA KNAUF READYFIX', 'JUNTAS', 'Balde', 128.41, 30.0, 5.0, 17.0, 'Knauf'),
('9890', 'MASSA PR HYDRO 25KG', 'JUNTAS', 'Saco', 367.09, 25.0, 5.0, 4.0, 'Áreas úmidas'),
('7970', 'MASSA BRASILIT UNICA 05KG', 'JUNTAS', 'Saco', 118.69, 5.0, 5.0, 17.0, 'Cimentícia'),
('11190', 'PLACOPLAST BASECOAT GRX - 20KG', 'JUNTAS', 'Saco', 100.33, 20.0, 5.0, 0.0, 'Glasroc X'),
('10713', 'MASSA PROFORT BC SYSTEM - SC', 'JUNTAS', 'Saco', 84.13, 20.0, 5.0, 0.0, 'Profort'),

-- 1.13 COMPLEMENTOS E ACABAMENTOS
('6809', 'CANTONEIRA TRANC VERTEX 100X2,5', 'ACABAMENTOS', 'Peça', 44.17, 2.5, 5.0, 4.0, 'Cantos vivos'),
('2331', 'CORDAO DELIMITADOR JUNTA BRASILIT', 'ACABAMENTOS', 'Rolo', 0.97, 1.0, 5.0, 17.0, 'Junta dilatação'),
('2390', 'PRIMER P/JUNTAS INVISIVEIS BRA', 'ACABAMENTOS', 'Balde', 114.37, 5.0, 5.0, 17.0, 'Primer juntas'),
('10921', 'ADESIVO FRANK TB SELANTE DURAM', 'ACABAMENTOS', 'Tubo', 61.45, 1.0, 5.0, 0.0, 'Selante'),
('9766', 'PINGADEIRA PVC PLATBANDAS LTDU', 'ACABAMENTOS', 'Peça', 62.53, 3.0, 5.0, 0.0, 'Platibandas'),
('10716', 'MEMBRANA PROFORT HOUSE WRAP', 'ACABAMENTOS', 'Rolo', 879.01, 50.0, 5.0, 4.0, 'Barreira vapor'),
('10717', 'TELA DE FIBRA 1,2M X 50M PROFORT', 'ACABAMENTOS', 'Rolo', 836.89, 50.0, 5.0, 4.0, 'Reforço'),
('9539', 'TELA VERTEX 100CMX50M', 'ACABAMENTOS', 'Rolo', 607.93, 50.0, 5.0, 4.0, 'Reforço superfície'),

-- 1.14 SISTEMAS ESPECIAIS
('12329', 'PAINEL ULTRABOARD 48MM 1,20X2,40', 'ESPECIAIS', 'Placa', 547.45, 2.88, 5.0, 0.0, 'Painel especial'),
('8945', 'REVESTIMENTO PETREO C/ EPS', 'ESPECIAIS', 'm²', 141.37, 1.0, 5.0, 0.0, 'Decorativo');

-- Inserir composições principais
INSERT INTO public.composicoes_mestre (codigo, nome, categoria, valor_total_m2, descricao, aplicacao) VALUES
('1.01', 'OSB 11,1mm (Base Externa)', 'VEDACAO_EXTERNA', 90.91, 'Base estrutural para paredes externas', 'Paredes externas sobre estrutura LSF'),
('1.02', 'Membrana Vapor TYVEK', 'VEDACAO_EXTERNA', 16.84, 'Barreira de vapor respirável', 'Proteção contra umidade'),
('1.03', 'STO Guard Gold Coat', 'VEDACAO_EXTERNA', 50.80, 'Sistema de proteção STO', 'Impermeabilização de base'),
('1.04', 'Placas Cimentícias 8mm', 'VEDACAO_EXTERNA', 62.54, 'Fechamento externo cimentício', 'Sobre OSB/Plywood'),
('1.05', 'Placas Cimentícias 10mm', 'VEDACAO_EXTERNA', 74.20, 'Fechamento externo reforçado', 'Sobre OSB/Plywood'),
('1.06', 'Tratamento Junta Cimentícia', 'ACABAMENTOS', 20.01, 'Tratamento de juntas cimentícias', 'Juntas invisíveis'),
('1.07', 'Junta Aparente Cimentícia', 'ACABAMENTOS', 16.26, 'Junta aparente selada', 'Juntas estruturais'),
('1.08', 'EIFS Drystore 20mm C/OSB', 'VEDACAO_EXTERNA', 205.54, 'Sistema EIFS completo', 'Isolamento térmico externo'),
('1.10', 'Gesso ST', 'VEDACAO_INTERNA', 29.87, 'Gesso standard áreas secas', 'Paredes internas secas'),
('1.11', 'Gesso RF', 'VEDACAO_INTERNA', 28.78, 'Gesso resistente ao fogo', 'Paredes com exigência RF'),
('1.14', 'Gesso RU', 'VEDACAO_INTERNA', 38.98, 'Gesso resistente à umidade', 'Áreas úmidas internas'),
('1.15', 'Forro de Gesso', 'FORROS', 64.51, 'Forro em placas de gesso', 'Forros modulares'),
('1.16', 'Telhas Shingle Supreme', 'COBERTURA', 215.53, 'Sistema Shingle completo Supreme', 'Cobertura residencial premium'),
('1.17', 'Telhas Shingle Oakridge', 'COBERTURA', 238.83, 'Sistema Shingle completo Oakridge', 'Cobertura residencial super premium'),
('1.18', 'Telha TP40 Sanduíche', 'COBERTURA', 180.00, 'Telha metálica sanduíche', 'Cobertura industrial/comercial'),
('1.19', 'Telha Ondulada 6mm', 'COBERTURA', 56.32, 'Telha fibrocimento ondulada', 'Cobertura econômica'),
('1.20', 'Impermeabilização Mapelastic', 'IMPERMEABILIZACAO', 87.59, 'Sistema Mapelastic com tela', 'Áreas molhadas'),
('1.21', 'Impermeabilização Elastment', 'IMPERMEABILIZACAO', 63.47, 'Sistema Elastment com tela', 'Alternativa econômica'),
('1.22', 'Rodapé OSB x Fundação', 'IMPERMEABILIZACAO', 66.65, 'Tratamento rodapé externo', 'Transição base/parede');

-- Limpar produtos obsoletos das tabelas antigas
DELETE FROM public.produtos WHERE categoria NOT IN ('painel-solar', 'inversor') OR categoria IS NULL;
DELETE FROM public.produtos_drywall WHERE ativo = false OR preco_unitario = 0;
DELETE FROM public.produtos_impermeabilizacao WHERE ativo = false OR preco_unitario = 0;
DELETE FROM public.produtos_shingle_novo WHERE ativo = false OR preco_unitario = 0;
DELETE FROM public.produtos_shingle_completos WHERE ativo = false OR preco_unitario = 0;