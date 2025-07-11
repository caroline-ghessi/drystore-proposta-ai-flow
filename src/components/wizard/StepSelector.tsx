import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap, Building, Layers, Square, CreditCard } from "lucide-react"
import { TipoProposta } from "../PropostaWizard"

interface StepSelectorProps {
  tipoProposta: TipoProposta;
  onSelect: (tipo: TipoProposta) => void;
  onNext: () => void;
}

const TIPOS_PROPOSTA = [
  {
    tipo: 'energia-solar' as TipoProposta,
    titulo: 'Energia Solar',
    descricao: 'Sistema fotovoltaico residencial ou comercial',
    icone: Zap,
    documento: 'Conta de luz (PDF ou imagem)',
    detalhes: 'Cálculo automático baseado no consumo'
  },
  {
    tipo: 'telhas' as TipoProposta,
    titulo: 'Telhas Shingle',
    descricao: 'Cobertura e telhas para telhados',
    icone: Building,
    documento: 'Projeto ou especificações (PDF)',
    detalhes: 'Área, inclinação e especificações'
  },
  {
    tipo: 'divisorias' as TipoProposta,
    titulo: 'Divisórias',
    descricao: 'Sistemas de divisórias e dry wall',
    icone: Layers,
    documento: 'Planta baixa ou layout (PDF)',
    detalhes: 'Medidas e tipos de acabamento'
  },
  {
    tipo: 'pisos' as TipoProposta,
    titulo: 'Pisos',
    descricao: 'Pisos vinílicos, laminados e carpetes',
    icone: Square,
    documento: 'Projeto ou lista de ambientes (PDF)',
    detalhes: 'Área total e tipo de piso'
  },
  {
    tipo: 'forros' as TipoProposta,
    titulo: 'Forros',
    descricao: 'Forro PVC, gesso e mineral',
    icone: CreditCard,
    documento: 'Planta de forro (PDF)',
    detalhes: 'Área e especificações técnicas'
  }
]

export function StepSelector({ tipoProposta, onSelect, onNext }: StepSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Selecione o tipo de proposta</h3>
        <p className="text-muted-foreground">
          Escolha o grupo de produtos para criar a proposta
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TIPOS_PROPOSTA.map((item) => {
          const IconComponent = item.icone
          const isSelected = tipoProposta === item.tipo

          return (
            <Card
              key={item.tipo}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => onSelect(item.tipo)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`
                    p-2 rounded-lg 
                    ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                  `}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{item.titulo}</CardTitle>
                    <CardDescription className="text-sm">
                      {item.descricao}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-muted-foreground">Documento:</span>
                    <p className="text-xs">{item.documento}</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-muted-foreground">Processamento:</span>
                    <p className="text-xs">{item.detalhes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} disabled={!tipoProposta}>
          Continuar
        </Button>
      </div>
    </div>
  )
}