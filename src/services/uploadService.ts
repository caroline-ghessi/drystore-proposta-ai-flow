import { supabase } from "@/integrations/supabase/client";

export interface UploadResult {
  url: string;
  path: string;
  fullUrl: string;
}

export class UploadService {
  private static instance: UploadService;

  public static getInstance(): UploadService {
    if (!UploadService.instance) {
      UploadService.instance = new UploadService();
    }
    return UploadService.instance;
  }

  async uploadDocumento(file: File, propostaId?: string): Promise<UploadResult> {
    try {
      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const fileName = `${propostaId || 'temp'}_${timestamp}.${extension}`;
      const filePath = `documentos/${fileName}`;

      console.log('Iniciando upload:', { fileName, size: file.size });

      // Upload para o bucket documentos-propostas
      const { data, error } = await supabase.storage
        .from('documentos-propostas')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Erro no upload: ${error.message}`);
      }

      // Gerar URL pública temporária (válida por 1 hora)
      const { data: urlData } = supabase.storage
        .from('documentos-propostas')
        .getPublicUrl(data.path);

      const result: UploadResult = {
        url: urlData.publicUrl,
        path: data.path,
        fullUrl: urlData.publicUrl
      };

      console.log('Upload concluído:', result);
      return result;

    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    }
  }

  async getDocumentoUrl(path: string): Promise<string> {
    try {
      const { data } = supabase.storage
        .from('documentos-propostas')
        .getPublicUrl(path);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao obter URL do documento:', error);
      throw error;
    }
  }

  async deleteDocumento(path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from('documentos-propostas')
        .remove([path]);

      if (error) {
        throw new Error(`Erro ao deletar arquivo: ${error.message}`);
      }

      console.log('Documento deletado:', path);
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      throw error;
    }
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

    if (file.size > maxSize) {
      return { valid: false, error: 'Arquivo muito grande. Máximo 10MB.' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Tipo de arquivo não permitido. Use PDF, JPG ou PNG.' };
    }

    return { valid: true };
  }
}

export const uploadService = UploadService.getInstance();