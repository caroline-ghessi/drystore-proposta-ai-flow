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
import PropostasTable from "@/components/PropostasTable"
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
      console.log('Criando proposta com dados completos:', data);
      
      // Garantir que temos o nome do cliente
      if (!data.clienteNome) {
        throw new Error('Nome do cliente é obrigatório');
      }
      
      // Construir dados_extraidos corretos para fluxo manual de telhas shingle
      const dadosExtraidos = data.tipoProposta === 'telhas-shingle' && data.entradaManual
        ? {
            ...data.dadosExtraidos,
            quantitativos_aprovados: data.quantitativosAprovados,
            tipo_sistema: data.tipoShingleSelecionado,
            entrada_manual: true,
            // Incluir dados específicos de telhas shingle
            area_telhado: data.areaTelhado,
            inclinacao_telhado: data.inclinacaoTelhado,
            tipo_estrutura: data.tipoEstrutura
          }
        : data.dadosExtraidos;
      
      console.log('Dados extraídos construídos:', dadosExtraidos);
      console.log('Tipo de proposta:', data.tipoProposta);
      
      const novaProposta = await criarProposta({
        cliente_nome: data.clienteNome,
        cliente_email: data.clienteEmail,
        cliente_whatsapp: data.clienteWhatsapp || '',
        cliente_endereco: data.clienteEndereco || '',
        tipo_proposta: data.tipoProposta, // Manter tipo base
        arquivo_original: data.arquivoUrl || '',
        dados_extraidos: dadosExtraidos,
        valor_total: data.valorTotal,
        observacoes: data.observacoes || '',
        ocultar_precos_unitarios: data.ocultar_precos_unitarios || false
      })

      if (novaProposta) {
        console.log('Proposta criada com sucesso:', novaProposta)
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

  const formatTipoProposta = (tipo: TipoProposta, dadosExtraidos?: any) => {
    switch (tipo) {
      case "energia-solar": return "Energia Solar"
      case "telhas-shingle": 
        // Mostrar tipo específico se disponível nos dados extraídos
        if (dadosExtraidos?.tipo_sistema === 'supreme') return "Telhas Shingle Supreme"
        if (dadosExtraidos?.tipo_sistema === 'oakridge') return "Telhas Shingle Oakridge"
        return "Telhas Shingle"
      case "divisorias": return "Divisórias"
      case "pisos": return "Pisos"
      case "forros": return "Forros"
      default: return tipo
    }
  }

  const filteredPropostas = propostas.filter(proposta =>
    proposta.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formatTipoProposta(proposta.tipo_proposta, proposta.dados_extraidos).toLowerCase().includes(searchTerm.toLowerCase())
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

            {loading ? (
              <div className="text-center py-8">
                <p>Carregando propostas...</p>
              </div>
            ) : (
              <PropostasTable 
                propostas={filteredPropostas.map(p => ({
                  id: p.id,
                  cliente: p.cliente_nome,
                  valor: p.valor_total 
                    ? p.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    : 'Calculando...',
                  status: p.status,
                  tipo: formatTipoProposta(p.tipo_proposta, p.dados_extraidos),
                  data: new Date(p.created_at).toLocaleDateString('pt-BR'),
                  url_unica: p.url_unica
                }))}
              />
            )}
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