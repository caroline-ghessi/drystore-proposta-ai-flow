import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, Image, X } from "lucide-react"
import { TipoProposta, PropostaData } from "../PropostaWizard"
import { uploadService } from "@/services/uploadService"

interface StepUploadProps {
  tipoProposta: TipoProposta;
  onDataChange: (data: Partial<PropostaData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const TIPO_LABELS = {
  'energia-solar': 'Energia Solar',
  'telhas': 'Telhas Shingle',
  'divisorias': 'Divisórias',
  'pisos': 'Pisos',
  'forros': 'Forros'
}

const DOCUMENTO_INFO = {
  'energia-solar': {
    titulo: 'Conta de Luz',
    descricao: 'Faça upload da conta de luz para extrair o consumo automaticamente',
    formatos: 'PDF, JPG, PNG',
    exemplo: 'Exemplo: conta_luz_janeiro_2024.pdf'
  },
  'telhas': {
    titulo: 'Projeto de Cobertura',
    descricao: 'Envie o projeto ou especificações técnicas da cobertura',
    formatos: 'PDF',
    exemplo: 'Exemplo: projeto_telhado.pdf'
  },
  'divisorias': {
    titulo: 'Planta Baixa',
    descricao: 'Planta baixa com layout das divisórias e medidas',
    formatos: 'PDF',
    exemplo: 'Exemplo: planta_divisorias.pdf'
  },
  'pisos': {
    titulo: 'Projeto de Pisos',
    descricao: 'Lista de ambientes ou projeto com especificações de pisos',
    formatos: 'PDF',
    exemplo: 'Exemplo: projeto_pisos.pdf'
  },
  'forros': {
    titulo: 'Planta de Forro',
    descricao: 'Planta com especificações do forro e medidas',
    formatos: 'PDF',
    exemplo: 'Exemplo: planta_forro.pdf'
  }
}

export function StepUpload({ 
  tipoProposta, 
  onDataChange, 
  onNext, 
  onBack 
}: StepUploadProps) {
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const info = DOCUMENTO_INFO[tipoProposta]

  const handleFileSelect = (file: File) => {
    const validation = uploadService.validateFile(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }
    setArquivo(file)
    onDataChange({ arquivo: file })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleNext = async () => {
    if (!arquivo) {
      return
    }

    try {
      setUploading(true)
      const uploadResult = await uploadService.uploadDocumento(arquivo)
      onDataChange({ arquivoUrl: uploadResult.url })
      onNext()
    } catch (error) {
      alert('Erro no upload do arquivo. Tente novamente.')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const isValid = arquivo

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">
          Upload de PDF - {TIPO_LABELS[tipoProposta]}
        </h3>
        <p className="text-muted-foreground">
          {info.descricao}. Os dados do cliente serão extraídos automaticamente do documento.
        </p>
      </div>

      <div className="flex justify-center">
        {/* Upload de Arquivo */}
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-base text-center">{info.titulo}</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                ${arquivo ? 'border-green-500 bg-green-50' : ''}
              `}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
            >
              {arquivo ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    {arquivo.type.includes('image') ? (
                      <Image className="h-12 w-12 text-green-600" />
                    ) : (
                      <FileText className="h-12 w-12 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-green-700">{arquivo.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(arquivo.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setArquivo(null)
                      onDataChange({ arquivo: undefined })
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium text-lg">
                      Arraste o arquivo aqui ou clique para selecionar
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Formatos aceitos: {info.formatos}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {info.exemplo}
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept={tipoProposta === 'energia-solar' ? '.pdf,.jpg,.jpeg,.png' : '.pdf'}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileSelect(file)
                    }}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <Button variant="outline" size="lg" asChild>
                      <span>Selecionar Arquivo</span>
                    </Button>
                  </Label>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!isValid || uploading}
        >
          {uploading ? 'Enviando...' : 'Extrair Dados'}
        </Button>
      </div>
    </div>
  )
}