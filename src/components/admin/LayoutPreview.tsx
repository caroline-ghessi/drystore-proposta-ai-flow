import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import DynamicPropostaRenderer from './DynamicPropostaRenderer';

interface LayoutPreviewProps {
  config: any;
  estilos: any;
  tipoProposta: string;
  mode: 'desktop' | 'mobile';
}

export function LayoutPreview({ config, estilos, tipoProposta, mode }: LayoutPreviewProps) {
  // Converter estilos para o formato esperado pelo DynamicPropostaRenderer
  const estilosCustomizados = estilos ? {
    primary: estilos.corPrimaria,
    secondary: estilos.corSecundaria,
    accent: estilos.corAccent,
    background: estilos.corFundo,
    foreground: estilos.corTexto,
    muted: estilos.corMuted,
    border: estilos.corBorda,
    success: estilos.corSucesso,
    warning: estilos.corAviso,
    destructive: estilos.corDestructive,
    borderRadius: estilos.bordaRadius,
    fontFamily: estilos.fontePrimaria
  } : undefined;

  return (
    <ScrollArea className="h-full">
      <div className="min-h-full">
        <DynamicPropostaRenderer
          tipoProposta={tipoProposta}
          configuracao={config}
          estiloCustomizado={estilosCustomizados}
          mode={mode}
        />
      </div>
    </ScrollArea>
  );
}