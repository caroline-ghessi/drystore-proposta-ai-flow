import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Zap, Building, Layers, Square, CreditCard, Palette, Drill, Volume2, Home, Shield, CheckCircle, AlertCircle, XCircle, Loader } from "lucide-react"
import { TipoProposta } from "../PropostaWizard"
import { useMapeamentosStatus } from "@/hooks/useMapeamentosStatus"

interface StepSelectorProps {
  tipoProposta: TipoProposta;
  onSelect: (tipo: TipoProposta, tipoShingle?: 'supreme' | 'oakridge') => void;
  onNext: () => void;
}

interface TipoPropostaItem {
  tipo: TipoProposta;
  titulo: string;
  descricao: string;
  icone: any;
  documento: string;
  detalhes: string;
  metadata?: { tipoShingle?: string };
}

const TIPOS_PROPOSTA: TipoPropostaItem[] = [
  {
    tipo: 'energia-solar' as TipoProposta,
    titulo: 'Energia Solar',
    descricao: 'Sistema fotovoltaico residencial ou comercial',
    icone: Zap,
    documento: 'Conta de luz (PDF ou imagem)',
    detalhes: 'Cálculo automático baseado no consumo'
  },
  {
    tipo: 'telhas-shingle' as TipoProposta,
    titulo: 'Telhas Shingle Supreme',
    descricao: 'Cobertura Shingle linha Supreme',
    icone: Building,
    documento: 'Projeto ou especificações (PDF)',
    detalhes: 'Área, perímetro e especificações',
    metadata: { tipoShingle: 'supreme' }
  },
  {
    tipo: 'telhas-shingle' as TipoProposta,
    titulo: 'Telhas Shingle Oakridge',
    descricao: 'Cobertura Shingle linha Oakridge',
    icone: Building,
    documento: 'Projeto ou especificações (PDF)',
    detalhes: 'Área, perímetro e especificações',
    metadata: { tipoShingle: 'oakridge' }
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
  },
  {
    tipo: 'tintas-texturas' as TipoProposta,
    titulo: 'Tintas e Texturas',
    descricao: 'Tintas decorativas e texturas especiais',
    icone: Palette,
    documento: 'Projeto ou especificações (PDF)',
    detalhes: 'Área, tipo de tinta e aplicação'
  },
  {
    tipo: 'verga-fibra' as TipoProposta,
    titulo: 'Verga Fibra',
    descricao: 'Vergas pré-moldadas em fibra',
    icone: Drill,
    documento: 'Projeto estrutural (PDF)',
    detalhes: 'Medidas e especificações técnicas'
  },
  {
    tipo: 'argamassa-silentfloor' as TipoProposta,
    titulo: 'Argamassa SilentFloor',
    descricao: 'Argamassa para isolamento acústico',
    icone: Volume2,
    documento: 'Projeto acústico (PDF)',
    detalhes: 'Área e especificações de isolamento'
  },
  {
    tipo: 'light-steel-frame' as TipoProposta,
    titulo: 'Light Steel Frame',
    descricao: 'Construção em estrutura metálica leve',
    icone: Home,
    documento: 'Projeto arquitetônico (PDF)',
    detalhes: 'Área construída e especificações'
  },
  {
    tipo: 'impermeabilizacao' as TipoProposta,
    titulo: 'Impermeabilização',
    descricao: 'Sistemas de impermeabilização para lajes e paredes',
    icone: Shield,
    documento: 'Projeto ou especificações (PDF)',
    detalhes: 'Área, tipo de superfície e sistema'
  }
]

export function StepSelector({ tipoProposta, onSelect, onNext }: StepSelectorProps) {
  const { status, isLoading, obterMensagemStatus, podeCalcular } = useMapeamentosStatus();

  const getStatusIcon = (tipo: string) => {
    if (isLoading) return <Loader className="h-4 w-4 animate-spin" />;
    
    const statusTipo = status[tipo];
    if (!statusTipo) return <XCircle className="h-4 w-4 text-muted-foreground" />;

    switch (statusTipo.status) {
      case 'completo':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'parcial':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'vazio':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (tipo: string) => {
    if (isLoading) return null;
    
    const statusTipo = status[tipo];
    if (!statusTipo) return (
      <Badge variant="secondary" className="text-xs">
        Não mapeado
      </Badge>
    );

    switch (statusTipo.status) {
      case 'completo':
        return (
          <Badge variant="default" className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
            Configurado
          </Badge>
        );
      case 'parcial':
        return (
          <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Parcial
          </Badge>
        );
      case 'vazio':
        return (
          <Badge variant="secondary" className="text-xs bg-red-100 text-red-800 hover:bg-red-100">
            Não configurado
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            Indefinido
          </Badge>
        );
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Selecione o tipo de proposta</h3>
          <p className="text-muted-foreground">
            Escolha o grupo de produtos para criar a proposta
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TIPOS_PROPOSTA.map((item) => {
            const IconComponent = item.icone;
            const isSelected = tipoProposta === item.tipo;
            const podeSelecionar = podeCalcular(item.tipo) || item.tipo === 'energia-solar';
            const statusMessage = obterMensagemStatus(item.tipo);

            return (
              <Tooltip key={item.tipo}>
                <TooltipTrigger asChild>
                  <Card
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected ? 'ring-2 ring-primary border-primary' : ''
                    } ${!podeSelecionar ? 'opacity-75' : ''}`}
                    onClick={() => {
                      if (item.metadata?.tipoShingle) {
                        onSelect(item.tipo, item.metadata.tipoShingle as 'supreme' | 'oakridge');
                      } else {
                        onSelect(item.tipo);
                      }
                    }}
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
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{item.titulo}</CardTitle>
                            {getStatusIcon(item.tipo)}
                          </div>
                          <CardDescription className="text-sm">
                            {item.descricao}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">Status:</span>
                          {getStatusBadge(item.tipo)}
                        </div>
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
                </TooltipTrigger>
                <TooltipContent>
                  <p>{statusMessage}</p>
                  {!podeSelecionar && item.tipo !== 'energia-solar' && (
                    <p className="text-xs text-yellow-600 mt-1">
                      Produtos não configurados. Você pode continuar, mas não haverá cálculos automáticos.
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onNext} disabled={!tipoProposta}>
            Continuar
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}