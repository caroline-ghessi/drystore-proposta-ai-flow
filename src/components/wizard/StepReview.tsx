import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { CheckCircle, Edit3, Calculator } from "lucide-react"
import { PropostaData } from "../PropostaWizard"
import { difyService, DadosMateriaisConstrucao, DadosEnergiaSolarCompletos } from "@/services/difyService"
import { ProdutosTable } from "@/components/ProdutosTable"
import { DadosContaLuzDisplay } from "./DadosContaLuzDisplay"

interface StepReviewProps {
  propostaData: PropostaData;
  onDataChange: (data: Partial<PropostaData>) => void;
  onBack: () => void;
  onComplete: (options?: { ocultarPrecosUnitarios: boolean; dadosCompletos?: Partial<PropostaData> }) => void;
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

export function StepReview({ 
  propostaData, 
  onDataChange, 
  onBack, 
  onComplete 
}: StepReviewProps) {
  const [editandoValor, setEditandoValor] = useState(false)
  const [ocultarPrecosUnitarios, setOcultarPrecosUnitarios] = useState(false)

  const dadosFormatados = propostaData.dadosExtraidos 
    ? difyService.formatarDadosParaExibicao(propostaData.dadosExtraidos, propostaData.tipoProposta)
    : {}

  const isEnergiaSolar = propostaData.tipoProposta === 'energia-solar';
  const isMateriaisConstrucao = ['materiais-construcao', 'tintas-texturas', 'verga-fibra', 'argamassa-silentfloor', 'light-steel-frame'].includes(propostaData.tipoProposta);
  
  const dadosEnergiaSolar = isEnergiaSolar ? propostaData.dadosExtraidos as DadosEnergiaSolarCompletos : null;
  const dadosMateriais = isMateriaisConstrucao ? propostaData.dadosExtraidos as DadosMateriaisConstrucao : null;
  const dadosUnificados = !isMateriaisConstrucao && !isEnergiaSolar ? propostaData.dadosExtraidos as any : null;
  
  // Verificar se há produtos em qualquer tipo de proposta
  const temProdutos = dadosMateriais?.produtos?.length > 0 || dadosUnificados?.produtos?.length > 0;
  const produtosList = dadosMateriais?.produtos || dadosUnificados?.produtos || [];

  const handleValorChange = (novoValor: string) => {
    const valor = parseFloat(novoValor.replace(/[^\d.,]/g, '').replace(',', '.'))
    if (!isNaN(valor)) {
      onDataChange({ valorTotal: valor })
    }
  }

  const handleProdutosChange = (produtos: any[]) => {
    if (dadosMateriais) {
      const novosDados = { ...dadosMateriais, produtos };
      onDataChange({ dadosExtraidos: novosDados });
    } else if (dadosUnificados) {
      const novosDados = { ...dadosUnificados, produtos };
      onDataChange({ dadosExtraidos: novosDados });
    }
  };

  const handleFreteChange = (valorFrete: number) => {
    if (dadosMateriais) {
      const novosDados = { ...dadosMateriais, valor_frete: valorFrete };
      const novoTotal = novosDados.produtos.reduce((acc, p) => acc + p.total, 0) + valorFrete;
      novosDados.valor_total_proposta = novoTotal;
      onDataChange({ 
        dadosExtraidos: novosDados,
        valorTotal: novoTotal
      });
    } else if (dadosUnificados) {
      const novosDados = { ...dadosUnificados, valor_frete: valorFrete };
      const novoTotal = novosDados.produtos.reduce((acc, p) => acc + p.total, 0) + valorFrete;
      novosDados.valor_total_proposta = novoTotal;
      onDataChange({ 
        dadosExtraidos: novosDados,
        valorTotal: novoTotal
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Validar e Completar Dados</h3>
        <p className="text-muted-foreground">
          Revise os dados extraídos automaticamente e complete as informações do cliente
        </p>
      </div>

      {/* Dados da Conta de Luz - Para energia solar */}
      {isEnergiaSolar && dadosEnergiaSolar && (
        <div className="col-span-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Dados da Conta de Luz
                <Badge variant="secondary">{TIPO_LABELS[propostaData.tipoProposta as keyof typeof TIPO_LABELS]}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DadosContaLuzDisplay dados={dadosEnergiaSolar} />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados Extraídos - Só para não-materiais e não-energia-solar */}
        {!isMateriaisConstrucao && !isEnergiaSolar && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Dados Extraídos
                <Badge variant="secondary">{TIPO_LABELS[propostaData.tipoProposta as keyof typeof TIPO_LABELS]}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(dadosFormatados).map(([chave, valor]) => (
                  <div key={chave} className="flex justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      {chave}:
                    </span>
                    <span className="text-sm font-medium text-right">
                      {valor || 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dados do Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="review-nome">Nome Completo</Label>
              <Input
                id="review-nome"
                value={propostaData.clienteNome || dadosEnergiaSolar?.dadosContaLuz.nome_cliente || dadosMateriais?.nome_cliente || dadosUnificados?.nome_cliente || ''}
                onChange={(e) => onDataChange({ clienteNome: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="review-email">Email</Label>
              <Input
                id="review-email"
                value={propostaData.clienteEmail}
                onChange={(e) => onDataChange({ clienteEmail: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="review-whatsapp">WhatsApp</Label>
              <Input
                id="review-whatsapp"
                value={propostaData.clienteWhatsapp || dadosMateriais?.telefone_do_cliente || dadosUnificados?.telefone_do_cliente || ''}
                onChange={(e) => onDataChange({ clienteWhatsapp: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <Label htmlFor="review-endereco">Endereço</Label>
              <Input
                id="review-endereco"
                value={propostaData.clienteEndereco || dadosEnergiaSolar?.dadosContaLuz.endereco || ''}
                onChange={(e) => onDataChange({ clienteEndereco: e.target.value })}
                placeholder="Endereço completo"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Valor e Observações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Valor da Proposta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!temProdutos && (
              <div>
                <Label htmlFor="valor-total">Valor Total</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="valor-total"
                    value={propostaData.valorTotal?.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }) || ''}
                    onChange={(e) => handleValorChange(e.target.value)}
                    disabled={!editandoValor}
                    placeholder="R$ 0,00"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditandoValor(!editandoValor)}
                  >
                    {editandoValor ? 'OK' : 'Editar'}
                  </Button>
                </div>
              </div>
            )}
            {temProdutos && (
              <div>
                <Label>Valor Total (calculado automaticamente)</Label>
                <p className="text-lg font-semibold text-primary">
                  {(dadosMateriais?.valor_total_proposta || dadosUnificados?.valor_total_proposta || 0).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Toggle para ocultar preços unitários */}
          {temProdutos && (
            <div className="flex items-center space-x-2">
              <Switch
                id="ocultar-precos"
                checked={ocultarPrecosUnitarios}
                onCheckedChange={setOcultarPrecosUnitarios}
              />
              <Label htmlFor="ocultar-precos">
                Ocultar preços unitários e quantidades na proposta do cliente
              </Label>
            </div>
          )}

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={propostaData.observacoes || ''}
              onChange={(e) => onDataChange({ observacoes: e.target.value })}
              placeholder="Informações adicionais sobre a proposta..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Produtos - para qualquer tipo de proposta que tenha produtos */}
      {temProdutos && (
        <div className="mt-6">
          <ProdutosTable
            produtos={produtosList}
            valorFrete={(dadosMateriais?.valor_frete || dadosUnificados?.valor_frete || 0)}
            valorTotal={(dadosMateriais?.valor_total_proposta || dadosUnificados?.valor_total_proposta || 0)}
            onProdutosChange={handleProdutosChange}
            onFreteChange={handleFreteChange}
            ocultarPrecosUnitarios={ocultarPrecosUnitarios}
          />
        </div>
      )}

      <Separator />

      {/* Resumo Final */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h4 className="font-semibold text-lg">Resumo da Proposta</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Cliente:</span>
                <p className="font-medium">{propostaData.clienteNome || dadosEnergiaSolar?.dadosContaLuz.nome_cliente || dadosMateriais?.nome_cliente || dadosUnificados?.nome_cliente || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tipo:</span>
                <p className="font-medium">{TIPO_LABELS[propostaData.tipoProposta as keyof typeof TIPO_LABELS]}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Valor:</span>
                <p className="font-medium text-lg text-primary">
                  {(temProdutos 
                    ? (dadosMateriais?.valor_total_proposta || dadosUnificados?.valor_total_proposta) 
                    : propostaData.valorTotal
                  )?.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }) || 'A calcular'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className="font-medium text-green-600">Pronta para envio</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button 
          onClick={() => {
            // Prepare complete data
            const dadosCompletos = {
              clienteNome: propostaData.clienteNome || dadosEnergiaSolar?.dadosContaLuz.nome_cliente || dadosMateriais?.nome_cliente || dadosUnificados?.nome_cliente || '',
              clienteEmail: propostaData.clienteEmail || '',
              clienteWhatsapp: propostaData.clienteWhatsapp || dadosMateriais?.telefone_do_cliente || dadosUnificados?.telefone_do_cliente || '',
              clienteEndereco: propostaData.clienteEndereco || dadosEnergiaSolar?.dadosContaLuz.endereco || '',
              valorTotal: temProdutos 
                ? (dadosMateriais?.valor_total_proposta || dadosUnificados?.valor_total_proposta) 
                : propostaData.valorTotal,
              observacoes: propostaData.observacoes || ''
            };
            
            // Pass complete data directly to onComplete
            onComplete({ 
              ocultarPrecosUnitarios,
              dadosCompletos 
            });
          }}
          disabled={
            !(propostaData.clienteNome || dadosEnergiaSolar?.dadosContaLuz.nome_cliente || dadosMateriais?.nome_cliente || dadosUnificados?.nome_cliente) ||
            !propostaData.clienteEmail
          }
          className="bg-primary hover:bg-primary/90"
        >
          Prosseguir
        </Button>
      </div>
    </div>
  )
}