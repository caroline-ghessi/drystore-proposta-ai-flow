import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Save, 
  RotateCcw, 
  Eye, 
  Palette, 
  Type, 
  Layout, 
  Settings, 
  FileText,
  Image,
  Smartphone,
  Monitor,
  History,
  Variable
} from 'lucide-react';
import { VariableProtectedEditor } from './VariableProtectedEditor';
import { ColorPicker } from './ColorPicker';
import { StyleEditor } from './StyleEditor';
import { LayoutPreview } from './LayoutPreview';

interface LayoutConfig {
  id: string;
  tipo_proposta: string;
  nome: string;
  descricao: string;
  configuracao: any;
  estilos_customizados: any;
  variaveis_utilizadas: string[];
  template_base: string;
  versao_editor: number;
  ativo: boolean;
  configuracao_padrao: boolean;
}

interface AdvancedLayoutEditorProps {
  layoutId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function AdvancedLayoutEditor({ layoutId, isOpen, onClose, onSave }: AdvancedLayoutEditorProps) {
  const [layout, setLayout] = useState<LayoutConfig | null>(null);
  const [config, setConfig] = useState<any>({});
  const [estilosCustomizados, setEstilosCustomizados] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (layoutId && isOpen) {
      carregarLayout();
    }
  }, [layoutId, isOpen]);

  const carregarLayout = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('layout_configuracoes')
        .select('*')
        .eq('id', layoutId)
        .single();

      if (error) throw error;

      setLayout(data);
      setConfig(data.configuracao || {});
      setEstilosCustomizados(data.estilos_customizados || {});
    } catch (error) {
      console.error('Erro ao carregar layout:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o layout",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const salvarLayout = async () => {
    if (!layout) return;

    try {
      setSaving(true);
      
      // Detectar variáveis utilizadas
      const variaveisUtilizadas = detectarVariaveisUtilizadas(config);
      
      // Salvar versão atual no histórico
      await salvarHistorico();
      
      // Atualizar layout principal
      const { error } = await supabase
        .from('layout_configuracoes')
        .update({
          configuracao: config,
          estilos_customizados: estilosCustomizados,
          variaveis_utilizadas: variaveisUtilizadas,
          versao_editor: (layout.versao_editor || 1) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', layout.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Layout salvo com sucesso!",
      });

      onSave();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar layout:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o layout",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const salvarHistorico = async () => {
    if (!layout) return;

    try {
      await supabase
        .from('layout_historico')
        .insert({
          layout_id: layout.id,
          versao: layout.versao_editor || 1,
          configuracao: config,
          estilos_customizados: estilosCustomizados,
          observacoes: `Salvamento automático v${(layout.versao_editor || 1) + 1}`
        });
    } catch (error) {
      console.warn('Erro ao salvar histórico:', error);
    }
  };

  const detectarVariaveisUtilizadas = (configuracao: any): string[] => {
    const variaveisEncontradas: Set<string> = new Set();
    const regex = /\{[^}]+\}/g;

    const buscarVariaveis = (obj: any) => {
      if (typeof obj === 'string') {
        const matches = obj.match(regex);
        if (matches) {
          matches.forEach(match => variaveisEncontradas.add(match));
        }
      } else if (typeof obj === 'object' && obj !== null) {
        Object.values(obj).forEach(buscarVariaveis);
      }
    };

    buscarVariaveis(configuracao);
    return Array.from(variaveisEncontradas);
  };

  const restaurarPadrao = async () => {
    if (!layout) return;
    
    try {
      const { data, error } = await supabase
        .from('layout_configuracoes')
        .select('configuracao, estilos_customizados')
        .eq('tipo_proposta', layout.tipo_proposta)
        .eq('configuracao_padrao', true)
        .single();

      if (error) throw error;

      setConfig(data.configuracao);
      setEstilosCustomizados(data.estilos_customizados || {});
      
      toast({
        title: "Restaurado",
        description: "Configuração padrão restaurada",
      });
    } catch (error) {
      console.error('Erro ao restaurar padrão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível restaurar a configuração padrão",
        variant: "destructive",
      });
    }
  };

  const updateConfig = (section: string, field: string, value: any) => {
    setConfig((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateEstilo = (propriedade: string, valor: any) => {
    setEstilosCustomizados((prev: any) => ({
      ...prev,
      [propriedade]: valor
    }));
  };

  if (!layout) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Editor Avançado - {layout.nome}
            <Badge variant={layout.ativo ? "default" : "secondary"} className="ml-2">
              {layout.ativo ? "Ativo" : "Inativo"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="flex flex-1 min-h-0">
            {/* Painel Esquerdo - Editor */}
            <div className="w-1/2 border-r flex flex-col">
              <div className="p-4 border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={restaurarPadrao}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restaurar Padrão
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
                      <History className="h-4 w-4 mr-2" />
                      Histórico
                    </Button>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant={previewMode === 'desktop' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setPreviewMode('desktop')}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant={previewMode === 'mobile' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setPreviewMode('mobile')}
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="p-4">
                  <Tabs defaultValue="estrutura" className="w-full">
                    <TabsList className="grid w-full grid-cols-6">
                      <TabsTrigger value="estrutura" className="text-xs">
                        <Layout className="h-3 w-3 mr-1" />
                        Estrutura
                      </TabsTrigger>
                      <TabsTrigger value="conteudo" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        Conteúdo
                      </TabsTrigger>
                      <TabsTrigger value="estilo" className="text-xs">
                        <Palette className="h-3 w-3 mr-1" />
                        Estilo
                      </TabsTrigger>
                      <TabsTrigger value="layout" className="text-xs">
                        <Type className="h-3 w-3 mr-1" />
                        Layout
                      </TabsTrigger>
                      <TabsTrigger value="imagens" className="text-xs">
                        <Image className="h-3 w-3 mr-1" />
                        Imagens
                      </TabsTrigger>
                      <TabsTrigger value="avancado" className="text-xs">
                        <Settings className="h-3 w-3 mr-1" />
                        Avançado
                      </TabsTrigger>
                    </TabsList>

                    {/* Tab Estrutura */}
                    <TabsContent value="estrutura" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Estrutura da Página</CardTitle>
                          <CardDescription>
                            Configure a estrutura geral e seções da proposta
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <h4 className="font-medium">Seções Ativas</h4>
                            {['header', 'hero', 'beneficios', 'especificacoes', 'credibilidade', 'cta', 'footer'].map(secao => (
                              <div key={secao} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                  <div className="font-medium capitalize">{secao.replace('_', ' ')}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {secao === 'header' && 'Cabeçalho com logo e título'}
                                    {secao === 'hero' && 'Seção principal de apresentação'}
                                    {secao === 'beneficios' && 'Lista de benefícios do produto'}
                                    {secao === 'especificacoes' && 'Especificações técnicas'}
                                    {secao === 'credibilidade' && 'Certificações e experiência'}
                                    {secao === 'cta' && 'Botões de ação'}
                                    {secao === 'footer' && 'Rodapé com contatos'}
                                  </div>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    toast({
                                      title: `Configurar ${secao}`,
                                      description: "Editor específico da seção em desenvolvimento",
                                    });
                                  }}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Tab Conteúdo */}
                    <TabsContent value="conteudo" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Variable className="h-5 w-5" />
                            Textos e Conteúdo
                          </CardTitle>
                          <CardDescription>
                            Edite os textos com proteção de variáveis dinâmicas
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <VariableProtectedEditor
                            label="Título Principal"
                            description="Título que aparece no cabeçalho da proposta"
                            value={config.header?.titulo || ''}
                            onChange={(value) => updateConfig('header', 'titulo', value)}
                            tipoProposta={layout.tipo_proposta}
                            placeholder="Ex: Proposta de {tipoProduto} para {cliente}"
                          />
                          
                          <VariableProtectedEditor
                            label="Subtítulo"
                            description="Subtítulo complementar ao título principal"
                            value={config.header?.subtitulo || ''}
                            onChange={(value) => updateConfig('header', 'subtitulo', value)}
                            tipoProposta={layout.tipo_proposta}
                            placeholder="Ex: Solução personalizada para suas necessidades"
                          />

                          <VariableProtectedEditor
                            label="Descrição do Produto"
                            description="Descrição detalhada do produto/serviço"
                            value={config.hero?.descricao || ''}
                            onChange={(value) => updateConfig('hero', 'descricao', value)}
                            tipoProposta={layout.tipo_proposta}
                            multiline
                            placeholder="Descreva os benefícios e características principais..."
                          />

                          <Separator />
                          
                          <div className="space-y-4">
                            <h4 className="font-medium">Botões de Ação (CTAs)</h4>
                            
                            <VariableProtectedEditor
                              label="Botão Primário"
                              value={config.cta?.botao_primario || ''}
                              onChange={(value) => updateConfig('cta', 'botao_primario', value)}
                              tipoProposta={layout.tipo_proposta}
                              placeholder="Ex: Aceitar Proposta"
                            />
                            
                            <VariableProtectedEditor
                              label="Botão WhatsApp"
                              value={config.cta?.botao_whatsapp || ''}
                              onChange={(value) => updateConfig('cta', 'botao_whatsapp', value)}
                              tipoProposta={layout.tipo_proposta}
                              placeholder="Ex: Falar no WhatsApp"
                            />
                            
                            <VariableProtectedEditor
                              label="Botão Alterações"
                              value={config.cta?.botao_alteracoes || ''}
                              onChange={(value) => updateConfig('cta', 'botao_alteracoes', value)}
                              tipoProposta={layout.tipo_proposta}
                              placeholder="Ex: Solicitar Alterações"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Tab Estilo */}
                    <TabsContent value="estilo" className="space-y-4">
                      <StyleEditor
                        estilos={estilosCustomizados}
                        onUpdate={updateEstilo}
                        tipoProposta={layout.tipo_proposta}
                      />
                    </TabsContent>

                    {/* Outras tabs podem ser implementadas posteriormente */}
                    <TabsContent value="layout">
                      <Card>
                        <CardContent className="p-6">
                          <div className="text-center text-muted-foreground">
                            Editor de layout em desenvolvimento
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="imagens">
                      <Card>
                        <CardContent className="p-6">
                          <div className="text-center text-muted-foreground">
                            Gerenciador de imagens em desenvolvimento
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="avancado">
                      <Card>
                        <CardContent className="p-6">
                          <div className="text-center text-muted-foreground">
                            Configurações avançadas em desenvolvimento
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </ScrollArea>
            </div>

            {/* Painel Direito - Preview */}
            <div className="w-1/2 bg-muted/20 flex flex-col">
              <div className="p-4 border-b bg-muted/30 shrink-0">
                <h3 className="font-medium">Preview Live</h3>
                <p className="text-sm text-muted-foreground">
                  Visualização em tempo real das alterações
                </p>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <LayoutPreview
                  config={config}
                  estilos={estilosCustomizados}
                  tipoProposta={layout.tipo_proposta}
                  mode={previewMode}
                />
              </div>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex justify-between p-4 border-t bg-background shrink-0 relative z-50">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={salvarLayout} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}