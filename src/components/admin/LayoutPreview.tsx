import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLayoutVariables } from '@/hooks/useLayoutVariables';
import { Shield, Award, Star, MessageCircle, Phone, Mail } from 'lucide-react';

interface LayoutPreviewProps {
  config: any;
  estilos: any;
  tipoProposta: string;
  mode: 'desktop' | 'mobile';
}

export function LayoutPreview({ config, estilos, tipoProposta, mode }: LayoutPreviewProps) {
  const { substituirVariaveis } = useLayoutVariables(tipoProposta);

  // Valores de exemplo para preview
  const valoresExemplo = {
    '{cliente}': 'João Silva',
    '{numeroProposta}': '2025-001',
    '{dataProposta}': '14 de Janeiro de 2025',
    '{valor_total}': 'R$ 25.000,00',
    '{tipoProduto}': tipoProposta === 'energia-solar' ? 'Energia Solar' : 
                      tipoProposta === 'telhas' ? 'Telhas Shingle' :
                      tipoProposta === 'divisorias' ? 'Divisórias' : 'Produto',
    '{potencia_kwp}': '5,4 kWp',
    '{economia_percent}': '95%',
    '{payback_anos}': '4,2 anos',
    '{geracao_anual_kwh}': '8.760 kWh',
    '{economia_anual}': 'R$ 3.500,00',
    '{quantidade_paineis}': '12 painéis',
    '{area_ocupada}': '24 m²',
    '{areaTelhado}': '120 m²',
    '{qtdTelhas}': '15 pacotes',
    '{corEscolhida}': 'Cinza Escuro',
    '{resistenciaVento}': '180 km/h',
    '{area_parede}': '45 m²',
    '{tipo_parede}': 'Drywall 70mm',
    '{pe_direito}': '2,80m'
  };

  const substituirTexto = (texto: string) => {
    return substituirVariaveis(texto, valoresExemplo);
  };

  const getStyleValue = (propriedade: string, valorPadrao: any) => {
    return estilos[propriedade] || valorPadrao;
  };

  const containerClass = mode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full';
  const textSizeClass = mode === 'mobile' ? 'text-sm' : 'text-base';

  const customStyles = {
    '--cor-primaria': getStyleValue('corPrimaria', 'hsl(var(--primary))'),
    '--cor-secundaria': getStyleValue('corSecundaria', 'hsl(var(--secondary))'),
    '--cor-fundo': getStyleValue('corFundo', 'hsl(var(--background))'),
    '--cor-texto': getStyleValue('corTexto', 'hsl(var(--foreground))'),
    '--tamanho-titulo': `${getStyleValue('tamanhoTitulo', 32)}px`,
    '--tamanho-subtitulo': `${getStyleValue('tamanhoSubtitulo', 20)}px`,
    '--tamanho-texto': `${getStyleValue('tamanhoTexto', 16)}px`,
    '--espacamento-secoes': `${getStyleValue('espacamentoSecoes', 64)}px`,
    '--espacamento-interno': `${getStyleValue('espacamentoInterno', 24)}px`,
  } as React.CSSProperties;

  return (
    <ScrollArea className="h-full">
      <div 
        className={`min-h-full ${containerClass}`} 
        style={customStyles}
      >
        {/* Header */}
        <header 
          className="p-4 border-b"
          style={{ 
            backgroundColor: getStyleValue('corPrimaria', 'hsl(var(--primary))'),
            color: 'white'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {config.header?.mostrar_logo !== false && (
                <div className="font-bold text-xl">DryStore</div>
              )}
              <div className={mode === 'mobile' ? 'hidden' : 'block'}>
                <h1 
                  className="font-semibold"
                  style={{ fontSize: 'var(--tamanho-titulo)' }}
                >
                  {substituirTexto(config.header?.titulo || 'Proposta para {cliente}')}
                </h1>
              </div>
            </div>
            <div className={`text-right text-xs ${textSizeClass}`}>
              <div>Proposta #{valoresExemplo['{numeroProposta}']}</div>
              <div>{valoresExemplo['{dataProposta}']}</div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section 
          className="p-6 text-center"
          style={{ 
            backgroundColor: getStyleValue('corFundo', 'hsl(var(--background))'),
            paddingTop: 'var(--espacamento-secoes)',
            paddingBottom: 'var(--espacamento-secoes)'
          }}
        >
          <h2 
            className="font-bold mb-4"
            style={{ 
              fontSize: 'var(--tamanho-titulo)',
              color: 'var(--cor-texto)'
            }}
          >
            {substituirTexto(config.header?.titulo || 'Proposta de {tipoProduto}')}
          </h2>
          
          <p 
            className="mb-6"
            style={{ 
              fontSize: 'var(--tamanho-subtitulo)',
              color: 'var(--cor-texto)'
            }}
          >
            {substituirTexto(config.header?.subtitulo || 'Solução personalizada para suas necessidades')}
          </p>

          {config.hero?.descricao && (
            <p 
              className="max-w-2xl mx-auto"
              style={{ 
                fontSize: 'var(--tamanho-texto)',
                color: 'var(--cor-texto)'
              }}
            >
              {substituirTexto(config.hero.descricao)}
            </p>
          )}
        </section>

        {/* Especificações/Benefícios */}
        <section className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tipoProposta === 'energia-solar' && (
              <>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{valoresExemplo['{potencia_kwp}']}</div>
                    <div className="text-sm text-muted-foreground">Potência do Sistema</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{valoresExemplo['{economia_percent}']}</div>
                    <div className="text-sm text-muted-foreground">Economia na Conta</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{valoresExemplo['{payback_anos}']}</div>
                    <div className="text-sm text-muted-foreground">Retorno do Investimento</div>
                  </CardContent>
                </Card>
              </>
            )}
            
            {tipoProposta === 'telhas' && (
              <>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{valoresExemplo['{areaTelhado}']}</div>
                    <div className="text-sm text-muted-foreground">Área do Telhado</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{valoresExemplo['{qtdTelhas}']}</div>
                    <div className="text-sm text-muted-foreground">Quantidade de Telhas</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{valoresExemplo['{resistenciaVento}']}</div>
                    <div className="text-sm text-muted-foreground">Resistência ao Vento</div>
                  </CardContent>
                </Card>
              </>
            )}
            
            {tipoProposta === 'divisorias' && (
              <>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{valoresExemplo['{area_parede}']}</div>
                    <div className="text-sm text-muted-foreground">Área da Parede</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{valoresExemplo['{tipo_parede}']}</div>
                    <div className="text-sm text-muted-foreground">Tipo de Parede</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{valoresExemplo['{pe_direito}']}</div>
                    <div className="text-sm text-muted-foreground">Pé Direito</div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </section>

        {/* Credibilidade */}
        {config.credibilidade?.mostrar_experiencia !== false && (
          <section className="p-6 bg-muted/30">
            <h3 className="text-2xl font-bold text-center mb-8">Por que escolher a DryStore?</h3>
            <div className={`grid gap-6 ${mode === 'mobile' ? 'grid-cols-2' : 'md:grid-cols-4'}`}>
              {config.credibilidade?.mostrar_experiencia !== false && (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">15+ Anos</h4>
                  <p className="text-xs text-muted-foreground">de Experiência</p>
                </div>
              )}
              
              {config.credibilidade?.mostrar_garantia !== false && (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-success/10 rounded-full mb-3">
                    <Shield className="h-6 w-6 text-success" />
                  </div>
                  <h4 className="font-semibold mb-1">Garantia</h4>
                  <p className="text-xs text-muted-foreground">Estendida</p>
                </div>
              )}
              
              {config.credibilidade?.mostrar_certificacoes !== false && (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-warning/10 rounded-full mb-3">
                    <Star className="h-6 w-6 text-warning" />
                  </div>
                  <h4 className="font-semibold mb-1">Certificado</h4>
                  <p className="text-xs text-muted-foreground">ABNT e ISO</p>
                </div>
              )}
              
              {config.credibilidade?.mostrar_suporte !== false && (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary/10 rounded-full mb-3">
                    <MessageCircle className="h-6 w-6 text-secondary" />
                  </div>
                  <h4 className="font-semibold mb-1">Suporte</h4>
                  <p className="text-xs text-muted-foreground">24/7</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* CTAs */}
        <section className="p-6">
          <div className="max-w-3xl mx-auto text-center">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Pronto para começar?</h3>
                
                {config.cta?.mostrar_valor !== false && (
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground">Investimento Total</p>
                    <p className="text-2xl font-bold text-primary">{valoresExemplo['{valor_total}']}</p>
                  </div>
                )}

                <div className={`grid gap-3 ${mode === 'mobile' ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
                  <Button 
                    className="bg-gradient-primary"
                    style={{
                      backgroundColor: getStyleValue('corBotaoPrimario', 'hsl(var(--primary))'),
                    }}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {config.cta?.botao_primario || 'Aceitar Proposta'}
                  </Button>
                  
                  <Button variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {config.cta?.botao_whatsapp || 'Falar no WhatsApp'}
                  </Button>
                  
                  <Button variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    {config.cta?.botao_alteracoes || 'Solicitar Alterações'}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  Sua proposta é válida por 30 dias • Preços sujeitos a alteração
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        {config.footer?.mostrar_contato !== false && (
          <footer 
            className="p-6 text-white"
            style={{ backgroundColor: getStyleValue('corPrimaria', 'hsl(var(--foreground))') }}
          >
            <div className={`grid gap-6 ${mode === 'mobile' ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
              <div>
                <div className="font-bold text-lg mb-2">DryStore</div>
                <p className="text-sm opacity-80">
                  Sua escolha segura em materiais de construção e energia renovável.
                </p>
              </div>
              
              {config.footer?.mostrar_contato !== false && (
                <div>
                  <h4 className="font-semibold mb-3">Contato</h4>
                  <div className="space-y-2 text-sm opacity-80">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      (11) 3456-7890
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-3 w-3" />
                      (11) 99999-9999
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      contato@drystore.com.br
                    </div>
                  </div>
                </div>
              )}
              
              {config.footer?.mostrar_certificacoes !== false && (
                <div>
                  <h4 className="font-semibold mb-3">Certificações</h4>
                  <div className="space-y-1">
                    <Badge variant="secondary">ABNT NBR 14715</Badge>
                    <Badge variant="secondary">ISO 9001</Badge>
                    <Badge variant="secondary">PBQP-H</Badge>
                  </div>
                </div>
              )}
            </div>
            
            <div className="border-t border-white/20 mt-6 pt-4 text-center text-sm opacity-60">
              © 2025 DryStore. Todos os direitos reservados.
            </div>
          </footer>
        )}
      </div>
    </ScrollArea>
  );
}