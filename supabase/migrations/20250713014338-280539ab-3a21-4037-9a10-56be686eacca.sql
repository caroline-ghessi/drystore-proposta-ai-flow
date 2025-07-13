-- Adicionar 'impermeabilizacao' ao enum de tipos de proposta
ALTER TYPE tipo_proposta_enum ADD VALUE 'impermeabilizacao';

-- Criar tabela para cálculos de impermeabilização
CREATE TABLE public.calculos_impermeabilizacao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposta_id UUID REFERENCES public.propostas(id),
  area_aplicacao DECIMAL(15,2) NOT NULL,
  tipo_superficie TEXT,
  sistema_impermeabilizacao TEXT,
  numero_demaos INTEGER DEFAULT 2,
  inclui_primer BOOLEAN DEFAULT true,
  inclui_reforco_cantos BOOLEAN DEFAULT true,
  valor_por_m2 DECIMAL(15,2),
  valor_total DECIMAL(15,2),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.calculos_impermeabilizacao ENABLE ROW LEVEL SECURITY;

-- Criar política de acesso público temporário
CREATE POLICY "Acesso público temporário impermeabilizacao" 
ON public.calculos_impermeabilizacao 
FOR ALL 
USING (true);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_calculos_impermeabilizacao_updated_at
  BEFORE UPDATE ON public.calculos_impermeabilizacao
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();