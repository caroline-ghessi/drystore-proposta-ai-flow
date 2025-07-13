import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Phone, Mail, Shield, Award, Star, Facebook, Instagram, Linkedin, Youtube } from "lucide-react"
import { useGlobalConfig } from "@/hooks/useGlobalConfig"

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
  const { getFooterConfig, getCTAs } = useGlobalConfig();
  const footerConfig = getFooterConfig();
  const ctaTexts = getCTAs();
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
                {ctaTexts.aceitar}
              </Button>
              
              <Button 
                onClick={onContactWhatsApp}
                variant="outline" 
                size="lg"
                className="hover:bg-success hover:text-success-foreground hover:border-success"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                {ctaTexts.contato}
              </Button>
              
              <Button 
                onClick={onRequestChanges}
                variant="outline" 
                size="lg"
              >
                <Mail className="h-5 w-5 mr-2" />
                {ctaTexts.alteracao}
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
              <div className="font-bold text-2xl mb-4">{footerConfig.empresa}</div>
              <p className="text-background/80 text-sm">
                {footerConfig.descricao}
              </p>
              {footerConfig.endereco && (
                <p className="text-background/80 text-sm mt-2">
                  {footerConfig.endereco}
                </p>
              )}
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <div className="space-y-2 text-sm text-background/80">
                {footerConfig.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {footerConfig.telefone}
                  </div>
                )}
                {footerConfig.whatsapp && (
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    {footerConfig.whatsapp}
                  </div>
                )}
                {footerConfig.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {footerConfig.email}
                  </div>
                )}
              </div>
            </div>
            {footerConfig.certificacoes && footerConfig.certificacoes.length > 0 && (
              <div>
                <h4 className="font-semibold mb-4">Certificações</h4>
                <div className="space-y-2">
                  {footerConfig.certificacoes.map((cert: string, index: number) => (
                    <Badge key={index} variant="secondary">{cert}</Badge>
                  ))}
                </div>
              </div>
            )}
            {footerConfig.selos_qualidade && footerConfig.selos_qualidade.length > 0 && (
              <div>
                <h4 className="font-semibold mb-4">Selos de Qualidade</h4>
                <div className="grid grid-cols-2 gap-2">
                  {footerConfig.selos_qualidade.map((selo: string, index: number) => (
                    <div key={index} className="bg-background/10 rounded p-2 text-center text-xs">
                      {selo}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Redes Sociais */}
          {footerConfig.redes_sociais && Object.values(footerConfig.redes_sociais).some((url: any) => url) && (
            <div className="border-t border-background/20 mt-8 pt-6">
              <div className="flex justify-center gap-4">
                {footerConfig.redes_sociais.facebook && (
                  <a href={footerConfig.redes_sociais.facebook} target="_blank" rel="noopener noreferrer" 
                     className="text-background/60 hover:text-background transition-colors">
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {footerConfig.redes_sociais.instagram && (
                  <a href={footerConfig.redes_sociais.instagram} target="_blank" rel="noopener noreferrer"
                     className="text-background/60 hover:text-background transition-colors">
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {footerConfig.redes_sociais.linkedin && (
                  <a href={footerConfig.redes_sociais.linkedin} target="_blank" rel="noopener noreferrer"
                     className="text-background/60 hover:text-background transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {footerConfig.redes_sociais.youtube && (
                  <a href={footerConfig.redes_sociais.youtube} target="_blank" rel="noopener noreferrer"
                     className="text-background/60 hover:text-background transition-colors">
                    <Youtube className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          )}
          
          <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm text-background/60">
            {footerConfig.copyright}
          </div>
        </div>
      </footer>
    </div>
  )
}