import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Eye } from 'lucide-react';

interface LogoUploadSectionProps {
  logoVersions: {
    fundo_branco?: string;
    fundo_cinza?: string;
    fundo_preto?: string;
    fundo_laranja?: string;
  };
  onLogoUpdate: (versions: any) => void;
}

const backgroundColors = {
  fundo_branco: { label: 'Fundo Branco', bg: 'bg-white', border: 'border-border' },
  fundo_cinza: { label: 'Fundo Cinza', bg: 'bg-muted', border: 'border-border' },
  fundo_preto: { label: 'Fundo Preto', bg: 'bg-black', border: 'border-border' },
  fundo_laranja: { label: 'Fundo Laranja', bg: 'bg-orange-500', border: 'border-border' }
};

export const LogoUploadSection: React.FC<LogoUploadSectionProps> = ({
  logoVersions,
  onLogoUpdate
}) => {
  const [uploading, setUploading] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const uploadLogo = async (file: File, version: string) => {
    setUploading(version);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logos/${version}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('logos-empresa')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos-empresa')
        .getPublicUrl(fileName);

      const newVersions = { ...logoVersions, [version]: publicUrl };
      onLogoUpdate(newVersions);

      toast({
        title: "Sucesso",
        description: `Logo para ${backgroundColors[version as keyof typeof backgroundColors].label} enviado com sucesso`
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o logo",
        variant: "destructive"
      });
    } finally {
      setUploading(null);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, version: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validação de tipo
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo PNG, JPG ou SVG",
        variant: "destructive"
      });
      return;
    }

    // Validação de tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 5MB",
        variant: "destructive"
      });
      return;
    }

    uploadLogo(file, version);
  };

  const removeLogo = (version: string) => {
    const newVersions = { ...logoVersions };
    delete newVersions[version as keyof typeof logoVersions];
    onLogoUpdate(newVersions);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Faça upload das versões do seu logo para diferentes fundos. Recomendado: PNG ou SVG, até 5MB.
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(backgroundColors).map(([version, config]) => (
          <Card key={version} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{config.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Preview Area */}
              <div className={`relative h-24 rounded-lg ${config.bg} ${config.border} border flex items-center justify-center overflow-hidden`}>
                {logoVersions[version as keyof typeof logoVersions] ? (
                  <>
                    <img
                      src={logoVersions[version as keyof typeof logoVersions]}
                      alt={`Logo ${config.label}`}
                      className="max-h-full max-w-full object-contain"
                    />
                    <div className="absolute top-1 right-1 flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-6 w-6 p-0"
                        onClick={() => window.open(logoVersions[version as keyof typeof logoVersions], '_blank')}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-6 w-6 p-0"
                        onClick={() => removeLogo(version)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground text-xs">Sem logo</div>
                )}
              </div>

              {/* Upload Button */}
              <div className="space-y-2">
                <Input
                  ref={(ref) => fileInputRefs.current[version] = ref}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={(e) => handleFileSelect(e, version)}
                  className="hidden"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRefs.current[version]?.click()}
                  disabled={uploading === version}
                >
                  <Upload className="h-3 w-3 mr-2" />
                  {uploading === version ? 'Enviando...' : 'Escolher Arquivo'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};