import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Phone, Mail, Shield, Award, Star } from "lucide-react"

interface BasePropostaLayoutProps {
  cliente: string
  tipoProduto: string
  numeroProposta: string
  dataProposta: string
  children: ReactNode
  onAcceptProposal?: () => void
  onContactWhatsApp?: () => void
  onRequestChanges?: () => void
  totalValue?: string
}

export default function BasePropostaLayout({
  cliente,
  tipoProduto,
  numeroProposta,
  dataProposta,
  children,
  onAcceptProposal,
  onContactWhatsApp,
  onRequestChanges,
  totalValue
}: BasePropostaLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Fixo */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="font-bold text-2xl text-primary">DryStore</div>
              <div className="hidden md:block h-6 w-px bg-border" />
              <div className="hidden md:block">
                <h1 className="text-lg font-semibold">
                  Olá, {cliente}! Sua Proposta para {tipoProduto}
                </h1>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>Proposta #{numeroProposta}</div>
              <div>{dataProposta}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main>
        {children}
      </main>

      {/* Seção de Credibilidade - DryStore */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Por que escolher a DryStore?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">15+ Anos de Experiência</h3>
              <p className="text-muted-foreground text-sm">
                Mais de 5.000 projetos realizados com excelência
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-4">
                <Shield className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Garantia Estendida</h3>
              <p className="text-muted-foreground text-sm">
                Certificações ABNT, ISO e PBQP-H
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-warning/10 rounded-full mb-4">
                <Star className="h-8 w-8 text-warning" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Instalações Certificadas</h3>
              <p className="text-muted-foreground text-sm">
                Técnicos qualificados e certificados
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary/10 rounded-full mb-4">
                <MessageCircle className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Suporte 24/7</h3>
              <p className="text-muted-foreground text-sm">
                Atendimento especializado sempre disponível
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTAs Finais */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="bg-gradient-card rounded-2xl p-8 shadow-card text-center">
            <h2 className="text-2xl font-bold mb-4">Pronto para começar?</h2>
            <p className="text-muted-foreground mb-8">
              Escolha uma das opções abaixo para prosseguir com sua proposta
            </p>
            
            {totalValue && (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">Investimento Total</p>
                <p className="text-3xl font-bold text-primary">{totalValue}</p>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-4">
              <Button 
                onClick={onAcceptProposal}
                size="lg" 
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
              >
                <Shield className="h-5 w-5 mr-2" />
                Aceitar Proposta
              </Button>
              
              <Button 
                onClick={onContactWhatsApp}
                variant="outline" 
                size="lg"
                className="hover:bg-success hover:text-success-foreground hover:border-success"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Falar no WhatsApp
              </Button>
              
              <Button 
                onClick={onRequestChanges}
                variant="outline" 
                size="lg"
              >
                <Mail className="h-5 w-5 mr-2" />
                Solicitar Alterações
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Sua proposta é válida por 30 dias • Preços sujeitos a alteração
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="font-bold text-2xl mb-4">DryStore</div>
              <p className="text-background/80 text-sm">
                Sua escolha segura em materiais de construção e energia renovável.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <div className="space-y-2 text-sm text-background/80">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  (11) 3456-7890
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  (11) 99999-9999
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  contato@drystore.com.br
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Certificações</h4>
              <div className="space-y-2">
                <Badge variant="secondary">ABNT NBR 14715</Badge>
                <Badge variant="secondary">ISO 9001</Badge>
                <Badge variant="secondary">PBQP-H</Badge>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Selos de Qualidade</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-background/10 rounded p-2 text-center text-xs">
                  ANCC
                </div>
                <div className="bg-background/10 rounded p-2 text-center text-xs">
                  INMETRO
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm text-background/60">
            © 2025 DryStore. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}