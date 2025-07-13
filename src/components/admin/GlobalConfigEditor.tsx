import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, Upload, Palette, Type, MessageSquare, TrendingUp } from 'lucide-react';
import { LogoUploadSection } from './LogoUploadSection';
import { FaviconUpload } from './FaviconUpload';

interface GlobalConfigEditorProps {
  isOpen: boolean;
  onClose: () => void;
  categoria: string;
}

interface ConfigItem {
  id: string;
  categoria: string;
  chave: string;
  valor: any;
  descricao: string;
}

export const GlobalConfigEditor: React.FC<GlobalConfigEditorProps> = ({
  isOpen,
  onClose,
  categoria
}) => {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && categoria) {
      carregarConfiguracoes();
    }
  }, [isOpen, categoria]);

  const carregarConfiguracoes = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_globais')
        .select('*')
        .eq('categoria', categoria)
        .eq('ativo', true)
        .order('chave');

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações",
        variant: "destructive"
      });
    }
  };

  const salvarConfiguracao = async (chave: string, novoValor: any) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('configuracoes_globais')
        .update({ valor: novoValor })
        .eq('categoria', categoria)
        .eq('chave', chave);

      if (error) throw error;

      setConfigs(prev => prev.map(config => 
        config.chave === chave 
          ? { ...config, valor: novoValor }
          : config
      ));

      toast({
        title: "Sucesso",
        description: "Configuração salva com sucesso"
      });
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a configuração",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderIdentidadeVisual = () => {
    const logoConfig = configs.find(c => c.chave === 'logo_principal');
    const faviconConfig = configs.find(c => c.chave === 'favicon');
    const coresConfig = configs.find(c => c.chave === 'cores_marca');

    return (
      <div className="space-y-6">
        {/* Upload do Favicon */}
        {faviconConfig && (
          <FaviconUpload
            currentFavicon={faviconConfig.valor?.url}
            onFaviconUpdate={(url) => {
              const novoValor = { ...faviconConfig.valor, url };
              salvarConfiguracao(faviconConfig.chave, novoValor);
            }}
          />
        )}

        {/* Upload dos Logos */}
        {logoConfig && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Logos da Empresa
              </CardTitle>
              <CardDescription>
                Faça upload das versões do seu logo para diferentes fundos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogoUploadSection
                logoVersions={logoConfig.valor?.versoes || {}}
                onLogoUpdate={(versoes) => {
                  const novoValor = { ...logoConfig.valor, versoes };
                  salvarConfiguracao(logoConfig.chave, novoValor);
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Cores da Marca */}
        {coresConfig && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {coresConfig.descricao}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Cor Primária</Label>
                  <Input
                    type="color"
                    value={coresConfig.valor?.primaria || '#0066CC'}
                    onChange={(e) => {
                      const novoValor = { ...coresConfig.valor, primaria: e.target.value };
                      salvarConfiguracao(coresConfig.chave, novoValor);
                    }}
                  />
                </div>
                <div>
                  <Label>Cor Secundária</Label>
                  <Input
                    type="color"
                    value={coresConfig.valor?.secundaria || '#FF6B35'}
                    onChange={(e) => {
                      const novoValor = { ...coresConfig.valor, secundaria: e.target.value };
                      salvarConfiguracao(coresConfig.chave, novoValor);
                    }}
                  />
                </div>
                <div>
                  <Label>Cor de Acento</Label>
                  <Input
                    type="color"
                    value={coresConfig.valor?.acento || '#00CC66'}
                    onChange={(e) => {
                      const novoValor = { ...coresConfig.valor, acento: e.target.value };
                      salvarConfiguracao(coresConfig.chave, novoValor);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderTipografia = () => (
    <div className="space-y-6">
      {configs.filter(c => c.categoria === 'tipografia').map(config => (
        <Card key={config.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              {config.descricao}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {config.chave === 'fonte_principal' && (
              <div>
                <Label>Família da Fonte</Label>
                <Input
                  value={config.valor?.familia || 'Inter'}
                  onChange={(e) => {
                    const novoValor = { ...config.valor, familia: e.target.value };
                    salvarConfiguracao(config.chave, novoValor);
                  }}
                />
              </div>
            )}
            
            {config.chave === 'cores_texto' && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Texto Primário</Label>
                  <Input
                    type="color"
                    value={config.valor?.primario || '#1a1a1a'}
                    onChange={(e) => {
                      const novoValor = { ...config.valor, primario: e.target.value };
                      salvarConfiguracao(config.chave, novoValor);
                    }}
                  />
                </div>
                <div>
                  <Label>Texto Secundário</Label>
                  <Input
                    type="color"
                    value={config.valor?.secundario || '#666666'}
                    onChange={(e) => {
                      const novoValor = { ...config.valor, secundario: e.target.value };
                      salvarConfiguracao(config.chave, novoValor);
                    }}
                  />
                </div>
                <div>
                  <Label>Texto Destaque</Label>
                  <Input
                    type="color"
                    value={config.valor?.destaque || '#0066CC'}
                    onChange={(e) => {
                      const novoValor = { ...config.valor, destaque: e.target.value };
                      salvarConfiguracao(config.chave, novoValor);
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTextosPadrao = () => (
    <div className="space-y-6">
      {configs.filter(c => c.categoria === 'textos_padrao').map(config => (
        <Card key={config.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {config.descricao}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {config.chave === 'ctas_principais' && (
              <div className="space-y-3">
                <div>
                  <Label>Texto "Aceitar Proposta"</Label>
                  <Input
                    value={config.valor?.aceitar || 'Aceitar Proposta'}
                    onChange={(e) => {
                      const novoValor = { ...config.valor, aceitar: e.target.value };
                      salvarConfiguracao(config.chave, novoValor);
                    }}
                  />
                </div>
                <div>
                  <Label>Texto "Contato WhatsApp"</Label>
                  <Input
                    value={config.valor?.contato || 'Falar no WhatsApp'}
                    onChange={(e) => {
                      const novoValor = { ...config.valor, contato: e.target.value };
                      salvarConfiguracao(config.chave, novoValor);
                    }}
                  />
                </div>
                <div>
                  <Label>Texto "Solicitar Alteração"</Label>
                  <Input
                    value={config.valor?.alteracao || 'Solicitar Alteração'}
                    onChange={(e) => {
                      const novoValor = { ...config.valor, alteracao: e.target.value };
                      salvarConfiguracao(config.chave, novoValor);
                    }}
                  />
                </div>
              </div>
            )}

            {config.chave === 'rodape' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome da Empresa</Label>
                  <Input
                    value={config.valor?.empresa || 'DryStore'}
                    onChange={(e) => {
                      const novoValor = { ...config.valor, empresa: e.target.value };
                      salvarConfiguracao(config.chave, novoValor);
                    }}
                  />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input
                    value={config.valor?.telefone || '(11) 9999-9999'}
                    onChange={(e) => {
                      const novoValor = { ...config.valor, telefone: e.target.value };
                      salvarConfiguracao(config.chave, novoValor);
                    }}
                  />
                </div>
                <div>
                  <Label>E-mail</Label>
                  <Input
                    value={config.valor?.email || 'contato@drystore.com'}
                    onChange={(e) => {
                      const novoValor = { ...config.valor, email: e.target.value };
                      salvarConfiguracao(config.chave, novoValor);
                    }}
                  />
                </div>
                <div>
                  <Label>Endereço</Label>
                  <Input
                    value={config.valor?.endereco || 'Rua Principal, 123'}
                    onChange={(e) => {
                      const novoValor = { ...config.valor, endereco: e.target.value };
                      salvarConfiguracao(config.chave, novoValor);
                    }}
                  />
                </div>
              </div>
            )}

            {config.chave === 'avisos_legais' && (
              <div className="space-y-3">
                <div>
                  <Label>Texto de Validade</Label>
                  <Textarea
                    value={config.valor?.validade || 'Esta proposta tem validade de 30 dias'}
                    onChange={(e) => {
                      const novoValor = { ...config.valor, validade: e.target.value };
                      salvarConfiguracao(config.chave, novoValor);
                    }}
                  />
                </div>
                <div>
                  <Label>Condições Gerais</Label>
                  <Textarea
                    value={config.valor?.condicoes || 'Valores sujeitos a alteração sem aviso prévio'}
                    onChange={(e) => {
                      const novoValor = { ...config.valor, condicoes: e.target.value };
                      salvarConfiguracao(config.chave, novoValor);
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderMetricas = () => (
    <div className="space-y-6">
      {configs.filter(c => c.categoria === 'metricas').map(config => (
        <Card key={config.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {config.descricao}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {config.chave === 'metas_conversao' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Taxa de Conversão Objetivo (%)</Label>
                  <Input
                    type="number"
                    value={config.valor?.taxa_objetivo || 25}
                    onChange={(e) => {
                      const novoValor = { ...config.valor, taxa_objetivo: Number(e.target.value) };
                      salvarConfiguracao(config.chave, novoValor);
                    }}
                  />
                </div>
                <div>
                  <Label>Tempo de Resposta (horas)</Label>
                  <Input
                    type="number"
                    value={config.valor?.tempo_resposta || 24}
                    onChange={(e) => {
                      const novoValor = { ...config.valor, tempo_resposta: Number(e.target.value) };
                      salvarConfiguracao(config.chave, novoValor);
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const getTitleByCategoria = () => {
    switch (categoria) {
      case 'identidade_visual': return 'Logo e Identidade Visual';
      case 'tipografia': return 'Cores e Tipografia';
      case 'textos_padrao': return 'Textos Padrão e CTAs';
      case 'metricas': return 'Métricas de Conversão';
      default: return 'Configurações Globais';
    }
  };

  const renderContent = () => {
    switch (categoria) {
      case 'identidade_visual': return renderIdentidadeVisual();
      case 'tipografia': return renderTipografia();
      case 'textos_padrao': return renderTextosPadrao();
      case 'metricas': return renderMetricas();
      default: return <div>Categoria não encontrada</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant="secondary">{getTitleByCategoria()}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {renderContent()}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};