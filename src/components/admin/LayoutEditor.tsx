import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, RotateCcw, Eye, Palette, Type, Layout, Settings } from 'lucide-react';

interface LayoutConfig {
  id: string;
  tipo_proposta: string;
  nome: string;
  descricao: string;
  configuracao: any;
  ativo: boolean;
  configuracao_padrao: boolean;
}

interface LayoutEditorProps {
  layoutId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function LayoutEditor({ layoutId, isOpen, onClose, onSave }: LayoutEditorProps) {
  const [layout, setLayout] = useState<LayoutConfig | null>(null);
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
      const { error } = await supabase
        .from('layout_configuracoes')
        .update({
          configuracao: config,
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

  const restaurarPadrao = async () => {
    if (!layout) return;
    
    try {
      // Buscar configuração padrão do mesmo tipo
      const { data, error } = await supabase
        .from('layout_configuracoes')
        .select('configuracao')
        .eq('tipo_proposta', layout.tipo_proposta)
        .eq('configuracao_padrao', true)
        .single();

      if (error) throw error;

      setConfig(data.configuracao);
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

  if (!layout) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Editor de Layout - {layout.nome}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Preview Badge */}
            <div className="flex items-center justify-between">
              <Badge variant={layout.ativo ? "default" : "secondary"}>
                {layout.ativo ? "Ativo" : "Inativo"}
              </Badge>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={restaurarPadrao}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurar Padrão
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>

            <Tabs defaultValue="header" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="header" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Cabeçalho
                </TabsTrigger>
                <TabsTrigger value="credibilidade" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Credibilidade
                </TabsTrigger>
                <TabsTrigger value="cta" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  CTAs
                </TabsTrigger>
                <TabsTrigger value="footer" className="flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  Rodapé
                </TabsTrigger>
              </TabsList>

              {/* Tab Cabeçalho */}
              <TabsContent value="header" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações do Cabeçalho</CardTitle>
                    <CardDescription>
                      Personalize o cabeçalho das propostas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="titulo">Título Principal</Label>
                        <Input
                          id="titulo"
                          value={config.header?.titulo || ''}
                          onChange={(e) => updateConfig('header', 'titulo', e.target.value)}
                          placeholder="Ex: Proposta de Energia Solar"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subtitulo">Subtítulo</Label>
                        <Input
                          id="subtitulo"
                          value={config.header?.subtitulo || ''}
                          onChange={(e) => updateConfig('header', 'subtitulo', e.target.value)}
                          placeholder="Ex: Solução completa para sua independência energética"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="mostrar_logo"
                        checked={config.header?.mostrar_logo || false}
                        onCheckedChange={(checked) => updateConfig('header', 'mostrar_logo', checked)}
                      />
                      <Label htmlFor="mostrar_logo">Mostrar Logo da DryStore</Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cor_fundo">Cor de Fundo</Label>
                      <select
                        id="cor_fundo"
                        value={config.header?.cor_fundo || 'primary'}
                        onChange={(e) => updateConfig('header', 'cor_fundo', e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      >
                        <option value="primary">Primária</option>
                        <option value="secondary">Secundária</option>
                        <option value="accent">Accent</option>
                        <option value="gradient-primary">Gradient Primário</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Credibilidade */}
              <TabsContent value="credibilidade" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Seção de Credibilidade</CardTitle>
                    <CardDescription>
                      Configure quais elementos de credibilidade mostrar
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="mostrar_experiencia"
                          checked={config.credibilidade?.mostrar_experiencia || false}
                          onCheckedChange={(checked) => updateConfig('credibilidade', 'mostrar_experiencia', checked)}
                        />
                        <Label htmlFor="mostrar_experiencia">Mostrar Experiência</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="mostrar_garantia"
                          checked={config.credibilidade?.mostrar_garantia || false}
                          onCheckedChange={(checked) => updateConfig('credibilidade', 'mostrar_garantia', checked)}
                        />
                        <Label htmlFor="mostrar_garantia">Mostrar Garantia</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="mostrar_certificacoes"
                          checked={config.credibilidade?.mostrar_certificacoes || false}
                          onCheckedChange={(checked) => updateConfig('credibilidade', 'mostrar_certificacoes', checked)}
                        />
                        <Label htmlFor="mostrar_certificacoes">Mostrar Certificações</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="mostrar_suporte"
                          checked={config.credibilidade?.mostrar_suporte || false}
                          onCheckedChange={(checked) => updateConfig('credibilidade', 'mostrar_suporte', checked)}
                        />
                        <Label htmlFor="mostrar_suporte">Mostrar Suporte 24/7</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab CTAs */}
              <TabsContent value="cta" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Chamadas para Ação</CardTitle>
                    <CardDescription>
                      Configure os botões e textos das CTAs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="botao_primario">Texto do Botão Primário</Label>
                        <Input
                          id="botao_primario"
                          value={config.cta?.botao_primario || ''}
                          onChange={(e) => updateConfig('cta', 'botao_primario', e.target.value)}
                          placeholder="Ex: Aceitar Proposta"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="botao_whatsapp">Texto do Botão WhatsApp</Label>
                        <Input
                          id="botao_whatsapp"
                          value={config.cta?.botao_whatsapp || ''}
                          onChange={(e) => updateConfig('cta', 'botao_whatsapp', e.target.value)}
                          placeholder="Ex: Falar no WhatsApp"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="botao_alteracoes">Texto do Botão Alterações</Label>
                        <Input
                          id="botao_alteracoes"
                          value={config.cta?.botao_alteracoes || ''}
                          onChange={(e) => updateConfig('cta', 'botao_alteracoes', e.target.value)}
                          placeholder="Ex: Solicitar Alterações"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="mostrar_valor"
                          checked={config.cta?.mostrar_valor || false}
                          onCheckedChange={(checked) => updateConfig('cta', 'mostrar_valor', checked)}
                        />
                        <Label htmlFor="mostrar_valor">Mostrar Valor Total</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Footer */}
              <TabsContent value="footer" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações do Rodapé</CardTitle>
                    <CardDescription>
                      Configure as informações do rodapé
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="mostrar_contato_footer"
                          checked={config.footer?.mostrar_contato || false}
                          onCheckedChange={(checked) => updateConfig('footer', 'mostrar_contato', checked)}
                        />
                        <Label htmlFor="mostrar_contato_footer">Mostrar Informações de Contato</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="mostrar_certificacoes_footer"
                          checked={config.footer?.mostrar_certificacoes || false}
                          onCheckedChange={(checked) => updateConfig('footer', 'mostrar_certificacoes', checked)}
                        />
                        <Label htmlFor="mostrar_certificacoes_footer">Mostrar Certificações</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="mostrar_selos_footer"
                          checked={config.footer?.mostrar_selos || false}
                          onCheckedChange={(checked) => updateConfig('footer', 'mostrar_selos', checked)}
                        />
                        <Label htmlFor="mostrar_selos_footer">Mostrar Selos de Qualidade</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Separator />

            {/* Botões de Ação */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={salvarLayout} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}