import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Search, 
  Calendar, 
  DollarSign,
  Eye,
  Download,
  Send,
  MoreHorizontal
} from "lucide-react"
import { DryStoreSidebar } from "@/components/DryStoreSidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import NotificacaoRealTime from "@/components/NotificacaoRealTime"
import { usePropostas, type StatusProposta, type TipoProposta } from "@/hooks/usePropostas"
import { PropostaWizard, type PropostaData } from "@/components/PropostaWizard"

export function Propostas() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState("")
  const [mostrarWizard, setMostrarWizard] = useState(false)

  const { propostas, loading, criarProposta, fetchPropostas } = usePropostas()

  useEffect(() => {
    fetchPropostas()
    
    // Verificar se deve abrir o wizard automaticamente
    const searchParams = new URLSearchParams(location.search)
    if (searchParams.get('action') === 'nova') {
      setMostrarWizard(true)
      // Limpar o parâmetro da URL
      const newUrl = location.pathname
      window.history.replaceState({}, '', newUrl)
    }
  }, [location])

  const handleCriarProposta = async (data: PropostaData) => {
    try {
      const novaProposta = await criarProposta({
        cliente_nome: data.clienteNome,
        cliente_email: data.clienteEmail,
        cliente_whatsapp: data.clienteWhatsapp,
        cliente_endereco: data.clienteEndereco,
        tipo_proposta: data.tipoProposta,
        arquivo_original: data.arquivoUrl,
        dados_extraidos: data.dadosExtraidos,
        valor_total: data.valorTotal,
        observacoes: data.observacoes
      })

      if (novaProposta) {
        console.log('Proposta criada:', novaProposta)
        await fetchPropostas()
        navigate(`/proposta/${novaProposta.url_unica}`)
      }
    } catch (error) {
      console.error('Erro ao criar proposta:', error)
      throw new Error('Erro ao criar proposta. Tente novamente.')
    }
  }

  const getStatusColor = (status: StatusProposta) => {
    switch (status) {
      case "enviada": return "default"
      case "visualizada": return "secondary"
      case "aceita": return "default"
      case "processando": return "outline"
      case "expirada": return "destructive"
      default: return "outline"
    }
  }

  const getStatusText = (status: StatusProposta) => {
    switch (status) {
      case "processando": return "Processando"
      case "enviada": return "Enviada"
      case "visualizada": return "Visualizada"
      case "aceita": return "Aceita"
      case "expirada": return "Expirada"
      default: return status
    }
  }

  const formatTipoProposta = (tipo: TipoProposta) => {
    switch (tipo) {
      case "energia-solar": return "Energia Solar"
      case "telhas": return "Telhas"
      case "divisorias": return "Divisórias"
      case "pisos": return "Pisos"
      case "forros": return "Forros"
      default: return tipo
    }
  }

  const filteredPropostas = propostas.filter(proposta =>
    proposta.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formatTipoProposta(proposta.tipo_proposta).toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DryStoreSidebar />
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center">
              <SidebarTrigger className="ml-4" />
              <div className="flex-1" />
            </div>
          </header>
          
          <main className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Propostas</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar propostas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <NotificacaoRealTime />
              <Button onClick={() => setMostrarWizard(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Proposta
              </Button>
            </div>

            <div className="grid gap-4">
              {loading ? (
                <div className="text-center py-8">
                  <p>Carregando propostas...</p>
                </div>
              ) : filteredPropostas.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchTerm ? "Nenhuma proposta encontrada." : "Nenhuma proposta criada ainda."}
                  </p>
                </div>
              ) : (
                filteredPropostas.map((proposta) => (
                  <Card key={proposta.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-medium">
                        {proposta.cliente_nome}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        {proposta.data_visualizacao && (
                          <Badge variant="outline" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Visualizada
                          </Badge>
                        )}
                        <Badge variant={getStatusColor(proposta.status)}>
                          {getStatusText(proposta.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{formatTipoProposta(proposta.tipo_proposta)}</p>
                          <p className="text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            Criada em {new Date(proposta.created_at).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {proposta.cliente_email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {proposta.valor_total 
                              ? proposta.valor_total.toLocaleString('pt-BR', { 
                                  style: 'currency', 
                                  currency: 'BRL' 
                                })
                              : 'Calculando...'
                            }
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/proposta/${proposta.url_unica}`)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Enviar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </main>

          {/* Wizard de Nova Proposta */}
          <PropostaWizard
            open={mostrarWizard}
            onOpenChange={setMostrarWizard}
            onComplete={handleCriarProposta}
          />
        </div>
      </div>
    </SidebarProvider>
  )
}

export default Propostas