import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from './ColorPicker';
import { VariableProtectedEditor } from './VariableProtectedEditor';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  Save, 
  X,
  Type,
  Palette,
  Layout,
  Image,
  Link
} from 'lucide-react';

interface SectionConfig {
  visivel: boolean;
  ordem: number;
  titulo?: string;
  subtitulo?: string;
  descricao?: string;
  cor_fundo?: string;
  cor_texto?: string;
  imagem_fundo?: string;
  botoes?: {
    texto: string;
    link: string;
    cor: string;
  }[];
  [key: string]: any;
}

interface SectionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: SectionConfig) => void;
  sectionName: string;
  sectionConfig: SectionConfig;
  tipoProposta: string;
}

export function SectionEditor({ 
  isOpen, 
  onClose, 
  onSave, 
  sectionName, 
  sectionConfig, 
  tipoProposta 
}: SectionEditorProps) {
  const [config, setConfig] = useState<SectionConfig>(sectionConfig);
  const { toast } = useToast();

  const handleSave = () => {
    onSave(config);
    toast({
      title: "Seção Atualizada",
      description: `Configurações da seção ${getSectionTitle(sectionName)} foram salvas`,
    });
    onClose();
  };

  const updateConfig = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getSectionTitle = (name: string) => {
    const titles: Record<string, string> = {
      header: 'Cabeçalho',
      hero: 'Seção Principal',
      beneficios: 'Benefícios',
      especificacoes: 'Especificações',
      credibilidade: 'Credibilidade',
      cta: 'Chamadas para Ação',
      footer: 'Rodapé'
    };
    return titles[name] || name;
  };

  const getSectionDescription = (name: string) => {
    const descriptions: Record<string, string> = {
      header: 'Configure o cabeçalho com logo, título e informações principais',
      hero: 'Seção de destaque com apresentação do produto/serviço',
      beneficios: 'Lista de benefícios e vantagens do seu produto',
      especificacoes: 'Especificações técnicas e detalhes importantes',
      credibilidade: 'Certificações, experiência e elementos de confiança',
      cta: 'Botões de ação e formulários de contato',
      footer: 'Informações de contato e rodapé da proposta'
    };
    return descriptions[name] || '';
  };

  const renderHeaderEditor = () => (
    <div className="space-y-6">
      <VariableProtectedEditor
        label="Título Principal"
        description="Título que aparece no cabeçalho"
        value={config.titulo || ''}
        onChange={(value) => updateConfig('titulo', value)}
        tipoProposta={tipoProposta}
        placeholder="Ex: Proposta de {tipoProduto} para {cliente}"
      />
      
      <VariableProtectedEditor
        label="Subtítulo"
        description="Subtítulo complementar"
        value={config.subtitulo || ''}
        onChange={(value) => updateConfig('subtitulo', value)}
        tipoProposta={tipoProposta}
        placeholder="Ex: Solução personalizada para suas necessidades"
      />

      <div className="space-y-2">
        <Label>Logo/Imagem</Label>
        <Input
          type="url"
          placeholder="URL da imagem ou logo"
          value={config.imagem_logo || ''}
          onChange={(e) => updateConfig('imagem_logo', e.target.value)}
        />
      </div>
    </div>
  );

  const renderHeroEditor = () => (
    <div className="space-y-6">
      <VariableProtectedEditor
        label="Título Hero"
        description="Título de destaque da seção principal"
        value={config.titulo || ''}
        onChange={(value) => updateConfig('titulo', value)}
        tipoProposta={tipoProposta}
        placeholder="Ex: {produto} de Alta Qualidade"
      />
      
      <VariableProtectedEditor
        label="Descrição"
        description="Descrição detalhada do produto/serviço"
        value={config.descricao || ''}
        onChange={(value) => updateConfig('descricao', value)}
        tipoProposta={tipoProposta}
        multiline
        placeholder="Descreva os principais benefícios..."
      />

      <div className="space-y-2">
        <Label>Imagem de Fundo</Label>
        <Input
          type="url"
          placeholder="URL da imagem de fundo"
          value={config.imagem_fundo || ''}
          onChange={(e) => updateConfig('imagem_fundo', e.target.value)}
        />
      </div>
    </div>
  );

  const renderBeneficiosEditor = () => (
    <div className="space-y-6">
      <VariableProtectedEditor
        label="Título da Seção"
        value={config.titulo || 'Principais Benefícios'}
        onChange={(value) => updateConfig('titulo', value)}
        tipoProposta={tipoProposta}
      />

      <div className="space-y-4">
        <Label>Lista de Benefícios</Label>
        {(config.beneficios || ['']).map((beneficio: string, index: number) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder={`Benefício ${index + 1}`}
              value={beneficio}
              onChange={(e) => {
                const novosHBeneficios = [...(config.beneficios || [''])];
                novosHBeneficios[index] = e.target.value;
                updateConfig('beneficios', novosHBeneficios);
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const novosBeneficios = (config.beneficios || ['']).filter((_: any, i: number) => i !== index);
                updateConfig('beneficios', novosBeneficios);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={() => {
            const novosBeneficios = [...(config.beneficios || ['']), ''];
            updateConfig('beneficios', novosBeneficios);
          }}
        >
          Adicionar Benefício
        </Button>
      </div>
    </div>
  );

  const renderCTAEditor = () => (
    <div className="space-y-6">
      <VariableProtectedEditor
        label="Botão Primário"
        description="Texto do botão principal de ação"
        value={config.botao_primario || ''}
        onChange={(value) => updateConfig('botao_primario', value)}
        tipoProposta={tipoProposta}
        placeholder="Ex: Aceitar Proposta"
      />
      
      <VariableProtectedEditor
        label="Botão WhatsApp"
        description="Texto do botão de contato via WhatsApp"
        value={config.botao_whatsapp || ''}
        onChange={(value) => updateConfig('botao_whatsapp', value)}
        tipoProposta={tipoProposta}
        placeholder="Ex: Falar no WhatsApp"
      />
      
      <VariableProtectedEditor
        label="Botão Alterações"
        description="Texto do botão para solicitar alterações"
        value={config.botao_alteracoes || ''}
        onChange={(value) => updateConfig('botao_alteracoes', value)}
        tipoProposta={tipoProposta}
        placeholder="Ex: Solicitar Alterações"
      />

      <div className="space-y-2">
        <Label>Mensagem de Urgência</Label>
        <Textarea
          placeholder="Ex: Esta proposta é válida por 7 dias"
          value={config.mensagem_urgencia || ''}
          onChange={(e) => updateConfig('mensagem_urgencia', e.target.value)}
        />
      </div>
    </div>
  );

  const renderGenericEditor = () => (
    <div className="space-y-6">
      <VariableProtectedEditor
        label="Título da Seção"
        value={config.titulo || ''}
        onChange={(value) => updateConfig('titulo', value)}
        tipoProposta={tipoProposta}
      />
      
      <div className="space-y-2">
        <Label>Conteúdo</Label>
        <Textarea
          placeholder="Conteúdo da seção..."
          value={config.conteudo || ''}
          onChange={(e) => updateConfig('conteudo', e.target.value)}
          rows={6}
        />
      </div>
    </div>
  );

  const renderContentEditor = () => {
    switch (sectionName) {
      case 'header':
        return renderHeaderEditor();
      case 'hero':
        return renderHeroEditor();
      case 'beneficios':
        return renderBeneficiosEditor();
      case 'cta':
        return renderCTAEditor();
      default:
        return renderGenericEditor();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurar {getSectionTitle(sectionName)}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <Tabs defaultValue="conteudo" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="conteudo">
                <Type className="h-4 w-4 mr-2" />
                Conteúdo
              </TabsTrigger>
              <TabsTrigger value="aparencia">
                <Palette className="h-4 w-4 mr-2" />
                Aparência
              </TabsTrigger>
              <TabsTrigger value="layout">
                <Layout className="h-4 w-4 mr-2" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="configuracoes">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="conteudo" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Conteúdo da Seção</CardTitle>
                    <CardDescription>
                      {getSectionDescription(sectionName)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderContentEditor()}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="aparencia" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Cores e Estilo</CardTitle>
                    <CardDescription>
                      Configure as cores e aparência da seção
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Cor de Fundo</Label>
                        <ColorPicker
                          label="Cor de Fundo"
                          value={config.cor_fundo || ''}
                          onChange={(color) => updateConfig('cor_fundo', color)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cor do Texto</Label>
                        <ColorPicker
                          label="Cor do Texto"
                          value={config.cor_texto || ''}
                          onChange={(color) => updateConfig('cor_texto', color)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Gradiente de Fundo</Label>
                      <Input
                        placeholder="Ex: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        value={config.gradiente_fundo || ''}
                        onChange={(e) => updateConfig('gradiente_fundo', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="layout" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Layout e Posicionamento</CardTitle>
                    <CardDescription>
                      Configure o layout e espaçamentos da seção
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Padding Superior (px)</Label>
                        <Input
                          type="number"
                          placeholder="40"
                          value={config.padding_top || ''}
                          onChange={(e) => updateConfig('padding_top', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Padding Inferior (px)</Label>
                        <Input
                          type="number"
                          placeholder="40"
                          value={config.padding_bottom || ''}
                          onChange={(e) => updateConfig('padding_bottom', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Alinhamento do Texto</Label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={config.alinhamento_texto || 'center'}
                        onChange={(e) => updateConfig('alinhamento_texto', e.target.value)}
                      >
                        <option value="left">Esquerda</option>
                        <option value="center">Centro</option>
                        <option value="right">Direita</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="configuracoes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações Gerais</CardTitle>
                    <CardDescription>
                      Configure a visibilidade e outras opções da seção
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Seção Visível</Label>
                        <p className="text-sm text-muted-foreground">
                          Controla se a seção aparece na proposta
                        </p>
                      </div>
                      <Switch
                        checked={config.visivel}
                        onCheckedChange={(checked) => updateConfig('visivel', checked)}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Ordem de Exibição</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={config.ordem || 1}
                        onChange={(e) => updateConfig('ordem', parseInt(e.target.value))}
                      />
                      <p className="text-sm text-muted-foreground">
                        Ordem em que a seção aparece na página (menor número = mais acima)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>ID da Seção</Label>
                      <Input
                        placeholder="Ex: secao-hero"
                        value={config.id_secao || ''}
                        onChange={(e) => updateConfig('id_secao', e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">
                        ID único para a seção (usado para navegação)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}