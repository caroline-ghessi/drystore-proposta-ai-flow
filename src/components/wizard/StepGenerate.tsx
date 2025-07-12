import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, User, FileText, Calculator, Send } from "lucide-react"
import { PropostaData } from "../PropostaWizard"
import { difyService, DadosMateriaisConstrucao } from "@/services/difyService"

interface StepGenerateProps {
  propostaData: PropostaData;
  onBack: () => void;
  onComplete: () => void;
}

const TIPO_LABELS = {
  'energia-solar': 'Energia Solar',
  'telhas': 'Telhas Shingle',
  'divisorias': 'Divisórias',
  'pisos': 'Pisos',
  'forros': 'Forros',
  'materiais-construcao': 'Materiais de Construção',
  'tintas-texturas': 'Tintas e Texturas',
  'verga-fibra': 'Verga Fibra',
  'argamassa-silentfloor': 'Argamassa SilentFloor',
  'light-steel-frame': 'Light Steel Frame'
}

export function StepGenerate({ 
  propostaData, 
  onBack, 
  onComplete 
}: StepGenerateProps) {
  const isMateriaisConstrucao = ['materiais-construcao', 'tintas-texturas', 'verga-fibra', 'argamassa-silentfloor', 'light-steel-frame'].includes(propostaData.tipoProposta);
  const dadosMateriais = isMateriaisConstrucao ? propostaData.dadosExtraidos as DadosMateriaisConstrucao : null;
  
  const valorFinal = isMateriaisConstrucao 
    ? dadosMateriais?.valor_total_proposta 
    : propostaData.valorTotal;

  const numeroProdutos = isMateriaisConstrucao 
    ? dadosMateriais?.produtos?.length || 0 
    : 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Gerar Proposta</h3>
        <p className="text-muted-foreground">
          Confirme os dados finais antes de criar a proposta
        </p>
      </div>

      {/* Resumo Final da Proposta */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Resumo Final da Proposta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Cliente */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <User className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-semibold text-sm text-muted-foreground">CLIENTE</h4>
              <p className="font-bold text-lg">
                {propostaData.clienteNome || dadosMateriais?.nome_cliente}
              </p>
              <p className="text-sm text-muted-foreground">
                {propostaData.clienteEmail}
              </p>
              {(propostaData.clienteWhatsapp || dadosMateriais?.telefone_do_cliente) && (
                <p className="text-sm text-muted-foreground">
                  {propostaData.clienteWhatsapp || dadosMateriais?.telefone_do_cliente}
                </p>
              )}
            </div>

            {/* Tipo */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-semibold text-sm text-muted-foreground">TIPO</h4>
              <Badge variant="default" className="text-sm">
                {TIPO_LABELS[propostaData.tipoProposta as keyof typeof TIPO_LABELS]}
              </Badge>
              {isMateriaisConstrucao && numeroProdutos > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {numeroProdutos} {numeroProdutos === 1 ? 'produto' : 'produtos'}
                </p>
              )}
            </div>

            {/* Valor */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Calculator className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-semibold text-sm text-muted-foreground">VALOR TOTAL</h4>
              <p className="font-bold text-2xl text-primary">
                {valorFinal?.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }) || 'A calcular'}
              </p>
              {isMateriaisConstrucao && dadosMateriais?.valor_frete && dadosMateriais.valor_frete > 0 && (
                <p className="text-sm text-muted-foreground">
                  Inclui frete: {dadosMateriais.valor_frete.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Send className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-sm text-muted-foreground">STATUS</h4>
              <p className="font-bold text-lg text-green-600">Pronta</p>
              <p className="text-sm text-muted-foreground">
                Para envio ao cliente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      {propostaData.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{propostaData.observacoes}</p>
          </CardContent>
        </Card>
      )}

      {/* Dados do Arquivo Original */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documento Processado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm">
              {propostaData.arquivo?.name || 'Documento enviado'}
            </span>
            <Badge variant="secondary" className="ml-auto">
              Processado com sucesso
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Próximos Passos */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Uma landing page personalizada será criada para o cliente</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Notificação será enviada automaticamente via WhatsApp</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Você receberá atualizações sobre visualizações e respostas</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Voltar para Edições
        </Button>
        <Button 
          onClick={onComplete}
          className="bg-green-600 hover:bg-green-700 text-white"
          size="lg"
        >
          <Send className="h-4 w-4 mr-2" />
          Criar Proposta
        </Button>
      </div>
    </div>
  )
}