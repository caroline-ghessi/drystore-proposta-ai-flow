-- Criar tabela para knowledge base de vendas
CREATE TABLE public.conhecimento_vendas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria TEXT NOT NULL CHECK (categoria IN ('followup', 'objecoes', 'fechamento', 'relacionamento', 'geral')),
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  prioridade INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.conhecimento_vendas ENABLE ROW LEVEL SECURITY;

-- Política para acesso público (temporário para desenvolvimento)
CREATE POLICY "Knowledge base vendas público" ON public.conhecimento_vendas FOR ALL USING (true);

-- Inserir conhecimento inicial de vendas
INSERT INTO public.conhecimento_vendas (categoria, titulo, conteudo, tags) VALUES 
('followup', 'Follow-up 1º Dia - Agradecimento', 
'Olá [NOME]! 😊 Muito obrigado pelo interesse em nossos produtos. Acabei de enviar sua proposta personalizada. Dê uma olhada quando puder e me conte suas impressões. Estou aqui para esclarecer qualquer dúvida!', 
ARRAY['agradecimento', 'primeiro-contato', 'cordial']),

('followup', 'Follow-up 3º Dia - Esclarecimento', 
'Oi [NOME]! Espero que esteja tudo bem! Vi que você ainda não visualizou nossa proposta. Imagino que deve estar ocupado(a). Quando tiver um tempinho, vale a pena dar uma olhada - preparamos algo bem especial para você. Tem alguma dúvida que posso esclarecer?', 
ARRAY['esclarecimento', 'segundo-followup', 'consultivo']),

('followup', 'Follow-up 7º Dia - Urgência Suave', 
'[NOME], tudo bem? Nossa proposta vence em breve e não quero que você perca essa oportunidade. Os preços estão bem competitivos e temos condições especiais válidas apenas neste mês. Que tal conversarmos hoje mesmo? Posso ligar agora?', 
ARRAY['urgencia', 'terceiro-followup', 'escassez']),

('objecoes', 'Objeção - Preço Alto', 
'Entendo sua preocupação com o investimento. Na verdade, quando analisamos o custo-benefício a longo prazo, nossos clientes economizam em média 30% comparado a outras soluções. Além disso, temos condições de pagamento que cabem no seu bolso. Quer que eu mostre algumas opções?', 
ARRAY['preco', 'custo-beneficio', 'parcelamento']),

('objecoes', 'Objeção - Preciso Pensar', 
'Claro! É natural querer pensar bem antes de uma decisão importante. Para te ajudar nessa reflexão, que tal eu explicar os 3 principais benefícios que nossos clientes mais valorizam? Assim você pode avaliar se faz sentido para sua situação. Posso compartilhar isso com você?', 
ARRAY['reflexao', 'beneficios', 'consultivo']),

('fechamento', 'Fechamento - Assumir a Venda', 
'Perfeito! Vou preparar tudo para começarmos seu projeto. Você prefere que eu agende a instalação para a próxima semana ou na seguinte? E qual forma de pagamento funciona melhor para você hoje?', 
ARRAY['assumir-venda', 'agendamento', 'pagamento']),

('relacionamento', 'Construção de Rapport', 
'Vi que você está em [CIDADE]. Conheço bem a região! Temos vários clientes satisfeitos por aí. Inclusive, se quiser, posso compartilhar alguns depoimentos de vizinhos seus que já instalaram nossos produtos. Isso ajuda a ter uma visão real dos resultados.', 
ARRAY['rapport', 'prova-social', 'local']);

-- Criar tabela para histórico de follow-ups gerados
CREATE TABLE public.followups_ia (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposta_id UUID REFERENCES public.propostas(id),
  vendedor_id UUID REFERENCES public.vendedores(id),
  mensagem_gerada TEXT NOT NULL,
  prompt_melhoria TEXT,
  mensagem_final TEXT,
  enviado BOOLEAN DEFAULT false,
  feedback_vendedor INTEGER CHECK (feedback_vendedor IN (1, -1)), -- 1 para positivo, -1 para negativo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.followups_ia ENABLE ROW LEVEL SECURITY;

-- Política para acesso público (temporário)
CREATE POLICY "Follow-ups IA público" ON public.followups_ia FOR ALL USING (true);

-- Trigger para updated_at na knowledge base
CREATE TRIGGER update_conhecimento_vendas_updated_at
  BEFORE UPDATE ON public.conhecimento_vendas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();