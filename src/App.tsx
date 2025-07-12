import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Propostas from "./pages/Propostas";
import Clientes from "./pages/Clientes";
import EnergiaSolar from "./pages/EnergiaSolar";
import Materiais from "./pages/Materiais";
import Ranking from "./pages/Ranking";
import Configuracoes from "./pages/Configuracoes";
import ClientePortal from "./pages/ClientePortal";
import PropostaCliente from "./pages/PropostaCliente";
import ProcessamentoProposta from "./pages/ProcessamentoProposta";
import LoginCliente from "./pages/LoginCliente";
import Admin from "./pages/Admin";
import EquipamentosSolar from "./pages/EquipamentosSolar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/propostas" element={<Propostas />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/energia-solar" element={<EnergiaSolar />} />
          <Route path="/materiais" element={<Materiais />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/equipamentos-solar" element={<EquipamentosSolar />} />
          <Route path="/cliente-portal" element={<ClientePortal />} />
          <Route path="/proposta/:urlUnica" element={<PropostaCliente />} />
          <Route path="/processamento" element={<ProcessamentoProposta />} />
          <Route path="/login-cliente" element={<LoginCliente />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
