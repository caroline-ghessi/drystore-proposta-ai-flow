import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Image, X, Edit3, FileUp } from "lucide-react"
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
  'forros': 'Forros',
  'impermeabilizacao': 'Impermeabilização'
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
  },
  'impermeabilizacao': {
    titulo: 'Projeto de Impermeabilização',
    descricao: 'Envie especificações técnicas, plantas ou projeto de impermeabilização',
    formatos: 'PDF',
    exemplo: 'Exemplo: projeto_impermeabilizacao.pdf'
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
  const [modoEntrada, setModoEntrada] = useState<'upload' | 'manual'>('upload')

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
    if (modoEntrada === 'manual') {
      // Modo manual - pular para entrada manual de dados
      onDataChange({ entradaManual: true })
      onNext()
      return
    }

    if (!arquivo) {
      return
    }

    try {
      setUploading(true)
      const uploadResult = await uploadService.uploadDocumento(arquivo)
      onDataChange({ arquivoUrl: uploadResult.url, entradaManual: false })
      onNext()
    } catch (error) {
      alert('Erro no upload do arquivo. Tente novamente.')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const handleModoChange = (modo: string) => {
    setModoEntrada(modo as 'upload' | 'manual')
    if (modo === 'manual') {
      setArquivo(null)
      onDataChange({ arquivo: undefined })
    }
  }

  const isValid = modoEntrada === 'manual' || arquivo

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">
          {TIPO_LABELS[tipoProposta]} - Entrada de Dados
        </h3>
        <p className="text-muted-foreground">
          Escolha como deseja inserir os dados para a proposta
        </p>
      </div>

      <Tabs value={modoEntrada} onValueChange={handleModoChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <FileUp className="h-4 w-4" />
            Upload PDF
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            Entrada Manual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground">
              {info.descricao}. Os dados do cliente serão extraídos automaticamente do documento.
            </p>
          </div>

          {/* Campos específicos para energia solar */}
          {tipoProposta === 'energia-solar' && (
            <div className="mt-4 space-y-4 max-w-md mx-auto">
              <div>
                <Label htmlFor="tipo-sistema">Tipo de Sistema</Label>
                <select 
                  id="tipo-sistema"
                  className="w-full mt-1 p-2 border border-input rounded-md"
                  onChange={(e) => onDataChange({ tipoSistema: e.target.value as any })}
                  defaultValue="on-grid"
                >
                  <option value="on-grid">On-Grid (Conectado à rede)</option>
                  <option value="hibrido">Híbrido (Com baterias)</option>
                  <option value="off-grid">Off-Grid (Isolado)</option>
                  <option value="baterias_apenas">Apenas Baterias</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="inclui-baterias"
                  onChange={(e) => onDataChange({ incluiBaterias: e.target.checked })}
                />
                <Label htmlFor="inclui-baterias">Incluir sistema de baterias</Label>
              </div>
            </div>
          )}

          <div className="flex justify-center">
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
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground">
              Insira os dados manualmente para prosseguir com a criação da proposta
            </p>
          </div>

          <div className="flex justify-center">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle className="text-base text-center">Entrada Manual de Dados</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="p-8">
                  <Edit3 className="h-16 w-16 mx-auto text-primary mb-4" />
                  <p className="font-medium text-lg mb-2">
                    Prosseguir com Entrada Manual
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Os dados do cliente e especificações técnicas serão inseridos na próxima etapa
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!isValid || uploading}
        >
          {uploading ? 'Enviando...' : modoEntrada === 'manual' ? 'Inserir Dados' : 'Extrair Dados'}
        </Button>
      </div>
    </div>
  )
}