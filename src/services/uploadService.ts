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
      // Validar arquivo
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const fileName = `${propostaId || 'temp'}_${timestamp}.${extension}`;
      const filePath = `documentos/${fileName}`;

      console.log('Iniciando upload:', { fileName, size: file.size });

      // Determinar Content-Type correto baseado na extensão
      const contentType = this.getContentType(file.name);
      console.log('Upload com Content-Type:', contentType);

      // Determinar bucket baseado no tipo de upload
      const isTrainingUpload = propostaId === 'treinamento-ia';
      const bucketName = isTrainingUpload ? 'treinamento-ia' : 'documentos-propostas';
      
      console.log('Upload para bucket:', bucketName);

      // Upload para o bucket apropriado
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: contentType
        });

      if (error) {
        throw new Error(`Erro no upload: ${error.message}`);
      }

      // Para arquivos de treinamento (bucket público), usar URL pública diretamente
      if (isTrainingUpload) {
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(data.path);

        const result: UploadResult = {
          url: urlData.publicUrl,
          path: data.path,
          fullUrl: urlData.publicUrl
        };

        console.log('Upload de treinamento concluído com URL pública:', result);
        return result;
      }

      // Para propostas (bucket privado), usar URL assinada temporária (válida por 24 horas)
      const { data: signedUrlData, error: signedError } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(data.path, 86400); // 24 horas

      if (signedError) {
        console.warn('Erro ao gerar URL assinada, usando URL pública:', signedError);
        // Fallback para URL pública
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(data.path);

        const result: UploadResult = {
          url: urlData.publicUrl,
          path: data.path,
          fullUrl: urlData.publicUrl
        };

        console.log('Upload concluído com URL pública:', result);
        return result;
      }

      const result: UploadResult = {
        url: signedUrlData.signedUrl,
        path: data.path,
        fullUrl: signedUrlData.signedUrl
      };

      console.log('Upload concluído com URL assinada:', result);
      return result;

    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    }
  }

  async getDocumentoUrl(path: string, isTraining: boolean = false): Promise<string> {
    try {
      const bucketName = isTraining ? 'treinamento-ia' : 'documentos-propostas';
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(path);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao obter URL do documento:', error);
      throw error;
    }
  }

  async deleteDocumento(path: string, isTraining: boolean = false): Promise<void> {
    try {
      const bucketName = isTraining ? 'treinamento-ia' : 'documentos-propostas';
      const { error } = await supabase.storage
        .from(bucketName)
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
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];

    if (file.size > maxSize) {
      return { valid: false, error: 'Arquivo muito grande. Máximo 10MB.' };
    }

    // Validar por tipo MIME
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Tipo de arquivo não permitido. Use PDF, JPG ou PNG.' };
    }

    // Validar por extensão como backup
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return { valid: false, error: 'Extensão de arquivo não permitida. Use .pdf, .jpg ou .png.' };
    }

    return { valid: true };
  }

  private getContentType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      default:
        return 'application/octet-stream';
    }
  }

  async reuploadWithCorrectContentType(path: string): Promise<UploadResult> {
    try {
      // Baixar o arquivo existente
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('documentos-propostas')
        .download(path);

      if (downloadError) {
        throw new Error(`Erro ao baixar arquivo: ${downloadError.message}`);
      }

      // Determinar Content-Type correto baseado no caminho
      const contentType = this.getContentType(path);
      console.log('Re-upload com Content-Type correto:', contentType);

      // Re-upload com Content-Type correto
      const { data, error } = await supabase.storage
        .from('documentos-propostas')
        .upload(path, fileData, {
          cacheControl: '3600',
          upsert: true,
          contentType: contentType
        });

      if (error) {
        throw new Error(`Erro no re-upload: ${error.message}`);
      }

      // Gerar nova URL
      const { data: urlData } = supabase.storage
        .from('documentos-propostas')
        .getPublicUrl(data.path);

      const result: UploadResult = {
        url: urlData.publicUrl,
        path: data.path,
        fullUrl: urlData.publicUrl
      };

      console.log('Re-upload concluído:', result);
      return result;

    } catch (error) {
      console.error('Erro no re-upload:', error);
      throw error;
    }
  }
}

export const uploadService = UploadService.getInstance();