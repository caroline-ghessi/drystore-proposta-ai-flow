import { useState } from "react"
import TelhasShinglePropostaPage from "@/components/propostas/TelhasShinglePropostaPage"
import EnergiaSolarPropostaPage from "@/components/propostas/EnergiaSolarPropostaPage"
import FluxoPagamento from "@/components/FluxoPagamento"

interface DynamicPropostaRendererProps {
  tipoProposta: string
  configuracao?: any
  estiloCustomizado?: any
  mode?: "desktop" | "mobile"
}

// Dados mockados realistas para cada tipo de proposta
const getMockData = (tipoProposta: string) => {
  const baseData = {
    id: "mock-proposal-001",
    cliente_nome: "Maria Silva",
    cliente_email: "maria.silva@email.com",
    valor_total: 25000,
    status: "enviada" as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  switch (tipoProposta) {
    case "telhas":
      return {
        ...baseData,
        valor_total: 12500,
        dados_extraidos: {
          area_telhado: 120,
          tipo_telha: "Shingle Premium",
          cor: "Charcoal Black",
          quantidade_pacotes: 48
        }
      }
    
    case "energia-solar":
      return {
        ...baseData,
        valor_total: 22500,
        dados_extraidos: {
          consumo_mensal_kwh: 450,
          potencia_kwp: 5.0,
          quantidade_paineis: 9,
          tipo_sistema: "hibrido"
        }
      }
    
    case "divisorias":
      return {
        ...baseData,
        valor_total: 8500,
        dados_extraidos: {
          area_total: 45,
          tipo_divisoria: "Drywall 70mm",
          acabamento: "Pintura Lisa"
        }
      }
    
    case "forros":
      return {
        ...baseData,
        valor_total: 6800,
        dados_extraidos: {
          area_forro: 35,
          tipo_forro: "Gesso Acartonado",
          iluminacao: "LED Embutido"
        }
      }
    
    case "pisos":
      return {
        ...baseData,
        valor_total: 15000,
        dados_extraidos: {
          area_aplicacao: 80,
          tipo_piso: "Vinílico Tarkett",
          padrao: "Madeira Carvalho"
        }
      }
    
    case "verga-fibra":
      return {
        ...baseData,
        valor_total: 4500,
        dados_extraidos: {
          quantidade_metros: 25,
          tipo_verga: "Fibra de Vidro Premium",
          vao_maximo: "2.5m"
        }
      }
    
    default:
      return baseData
  }
}

export default function DynamicPropostaRenderer({
  tipoProposta,
  configuracao,
  estiloCustomizado,
  mode = "desktop"
}: DynamicPropostaRendererProps) {
  // Obter dados mockados para o tipo de proposta
  const mockProposta = getMockData(tipoProposta)

  // Aplicar estilos customizados via CSS custom properties
  const containerStyle = estiloCustomizado ? {
    '--primary': estiloCustomizado.primary,
    '--secondary': estiloCustomizado.secondary,
    '--accent': estiloCustomizado.accent,
    '--background': estiloCustomizado.background,
    '--foreground': estiloCustomizado.foreground,
    '--muted': estiloCustomizado.muted,
    '--border': estiloCustomizado.border,
    '--success': estiloCustomizado.success,
    '--warning': estiloCustomizado.warning,
    '--destructive': estiloCustomizado.destructive,
    '--border-radius': estiloCustomizado.borderRadius || '0.5rem',
    '--font-family': estiloCustomizado.fontFamily || 'inherit'
  } as React.CSSProperties : {}

  // Wrapper com estilos customizados
  const WrapperComponent = ({ children }: { children: React.ReactNode }) => (
    <div style={containerStyle} className={mode === "mobile" ? "max-w-sm mx-auto" : ""}>
      {children}
    </div>
  )

  // Props comuns para componentes de proposta
  const commonProps = {
    proposta: mockProposta,
    onAceitarProposta: (formaPagamento: string) => {
      console.log(`Proposta aceita com: ${formaPagamento}`)
    }
  }

  // Renderizar o componente apropriado baseado no tipo
  switch (tipoProposta) {
    case "telhas":
      return (
        <WrapperComponent>
          <TelhasShinglePropostaPage {...commonProps} />
        </WrapperComponent>
      )
    
    case "energia-solar":
      return (
        <WrapperComponent>
          <EnergiaSolarPropostaPage {...commonProps} />
        </WrapperComponent>
      )
    
    default:
      return (
        <WrapperComponent>
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Preview do Layout</h2>
            <p className="text-muted-foreground mb-4">
              Tipo de proposta: <strong>{tipoProposta}</strong>
            </p>
            <div className="bg-muted rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Layout Preview Mockado</h3>
              <p className="text-sm text-muted-foreground">
                Este é um preview genérico para o tipo "{tipoProposta}". 
                O layout real será renderizado quando o componente específico estiver disponível.
              </p>
            </div>
          </div>
        </WrapperComponent>
      )
  }
}