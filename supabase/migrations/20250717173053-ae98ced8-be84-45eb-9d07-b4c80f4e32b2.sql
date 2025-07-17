-- Criar tabela para mapear composições com tipos de proposta
CREATE TABLE public.tipo_proposta_composicoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_proposta TEXT NOT NULL,
  composicao_id UUID NOT NULL REFERENCES public.composicoes_mestre(id) ON DELETE CASCADE,
  obrigatorio BOOLEAN NOT NULL DEFAULT true,
  ordem_calculo INTEGER NOT NULL DEFAULT 1,
  fator_aplicacao NUMERIC NOT NULL DEFAULT 1.0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tipo_proposta, composicao_id)
);

-- Habilitar RLS
ALTER TABLE public.tipo_proposta_composicoes ENABLE ROW LEVEL SECURITY;

-- Política de acesso público temporário
CREATE POLICY "Mapeamentos públicos temporário" 
ON public.tipo_proposta_composicoes 
FOR ALL 
USING (true);

-- Trigger para updated_at
CREATE TRIGGER update_tipo_proposta_composicoes_updated_at
  BEFORE UPDATE ON public.tipo_proposta_composicoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Popular com alguns dados iniciais para energia solar
INSERT INTO public.tipo_proposta_composicoes (tipo_proposta, composicao_id, obrigatorio, ordem_calculo) 
SELECT 
  'energia-solar' as tipo_proposta,
  id as composicao_id,
  true as obrigatorio,
  ROW_NUMBER() OVER (ORDER BY nome) as ordem_calculo
FROM public.composicoes_mestre 
WHERE categoria IN ('ENERGIA_SOLAR', 'ELETRICO')
LIMIT 5;