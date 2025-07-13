import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Eye, Info } from 'lucide-react';

interface FaviconUploadProps {
  currentFavicon?: string;
  onFaviconUpdate: (url: string) => void;
}

export const FaviconUpload: React.FC<FaviconUploadProps> = ({
  currentFavicon,
  onFaviconUpdate
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFavicon = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `favicons/favicon-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('logos-empresa')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos-empresa')
        .getPublicUrl(fileName);

      onFaviconUpdate(publicUrl);

      toast({
        title: "Sucesso",
        description: "Favicon atualizado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao fazer upload do favicon:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o favicon",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validação de tipo
    const allowedTypes = ['image/png', 'image/jpeg', 'image/x-icon'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo PNG, JPG ou ICO",
        variant: "destructive"
      });
      return;
    }

    // Validação de tamanho (1MB)
    if (file.size > 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O favicon deve ter no máximo 1MB",
        variant: "destructive"
      });
      return;
    }

    uploadFavicon(file);
  };

  const removeFavicon = () => {
    onFaviconUpdate('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Upload className="h-4 w-4" />
          Favicon do Site
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="text-xs text-muted-foreground">
            O favicon é o pequeno ícone que aparece na aba do navegador. 
            Recomendado: 32x32px, PNG ou ICO, até 1MB.
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-muted border rounded-lg flex items-center justify-center overflow-hidden">
            {currentFavicon ? (
              <img
                src={currentFavicon}
                alt="Favicon"
                className="w-8 h-8 object-contain"
              />
            ) : (
              <div className="text-xs text-muted-foreground">Sem favicon</div>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/x-icon"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex-1"
              >
                <Upload className="h-3 w-3 mr-2" />
                {uploading ? 'Enviando...' : 'Escolher Favicon'}
              </Button>

              {currentFavicon && (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => window.open(currentFavicon, '_blank')}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={removeFavicon}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};