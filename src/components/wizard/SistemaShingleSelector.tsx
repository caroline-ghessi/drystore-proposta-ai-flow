
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Crown, Star } from "lucide-react"
import { SistemaShingle } from "@/hooks/useTelhasShingleCompleto"

interface SistemaShingleSelectorProps {
  sistemas: SistemaShingle[]
  sistemaSelecionado?: string
  onSelecionarSistema: (codigo: string) => void
  loading?: boolean
}

export function SistemaShingleSelector({ 
  sistemas, 
  sistemaSelecionado, 
  onSelecionarSistema,
  loading = false 
}: SistemaShingleSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Escolha o Sistema Shingle</h3>
        <p className="text-sm text-muted-foreground">
          Selecione entre as linhas disponíveis para sua proposta
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sistemas.map((sistema) => {
          const isSelected = sistemaSelecionado === sistema.codigo
          const isSupreme = sistema.linha === 'SUPREME'
          
          return (
            <Card 
              key={sistema.codigo}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'ring-2 ring-primary border-primary bg-primary/5' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => onSelecionarSistema(sistema.codigo)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isSupreme ? (
                      <Crown className="w-5 h-5 text-amber-500" />
                    ) : (
                      <Star className="w-5 h-5 text-blue-500" />
                    )}
                    <CardTitle className="text-lg">{sistema.nome}</CardTitle>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={isSupreme ? "default" : "secondary"}>
                    {sistema.linha}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Código: {sistema.codigo}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Valor por m²:</span>
                  <span className="text-lg font-bold text-primary">
                    R$ {sistema.valor_m2.toLocaleString('pt-BR', { 
                      minimumFractionDigits: 2 
                    })}
                  </span>
                </div>

                {sistema.descricao && (
                  <CardDescription className="text-xs">
                    {sistema.descricao}
                  </CardDescription>
                )}

                <div className="space-y-1 text-xs text-muted-foreground">
                  {isSupreme ? (
                    <ul className="space-y-1">
                      <li>• Linha Premium</li>
                      <li>• Maior durabilidade</li>
                      <li>• Melhor custo-benefício</li>
                    </ul>
                  ) : (
                    <ul className="space-y-1">
                      <li>• Linha Superior</li>
                      <li>• Tecnologia avançada</li>
                      <li>• Performance premium</li>
                    </ul>
                  )}
                </div>

                <Button 
                  variant={isSelected ? "default" : "outline"}
                  className="w-full"
                  disabled={loading}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelecionarSistema(sistema.codigo)
                  }}
                >
                  {isSelected ? "Selecionado" : "Selecionar"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
