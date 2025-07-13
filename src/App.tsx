import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Propostas from "./pages/Propostas";
import Clientes from "./pages/Clientes";
import EnergiaSolar from "./pages/EnergiaSolar";
import Materiais from "./pages/Materiais";
import Ranking from "./pages/Ranking";

import ClientePortal from "./pages/ClientePortal";
import PropostaCliente from "./pages/PropostaCliente";

import CalculadoraShingleCompleta from "./pages/CalculadoraShingleCompleta";
import LoginCliente from "./pages/LoginCliente";
import Admin from "./pages/Admin";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPropostas from "./pages/admin/AdminPropostas";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminProdutos from "./pages/admin/AdminProdutos";
import AdminLayoutsPropostas from "./pages/admin/AdminLayoutsPropostas";
import AdminConfiguracoes from "./pages/admin/AdminConfiguracoes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/login-cliente" element={<LoginCliente />} />
          <Route path="/proposta/:urlUnica" element={<PropostaCliente />} />
          
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/propostas" element={<ProtectedRoute><Propostas /></ProtectedRoute>} />
          <Route path="/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
          <Route path="/energia-solar" element={<ProtectedRoute><EnergiaSolar /></ProtectedRoute>} />
          <Route path="/materiais" element={<ProtectedRoute><Materiais /></ProtectedRoute>} />
          <Route path="/ranking" element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
          
          <Route path="/calculadora-shingle" element={<ProtectedRoute><CalculadoraShingleCompleta /></ProtectedRoute>} />
          <Route path="/cliente-portal" element={<ProtectedRoute><ClientePortal /></ProtectedRoute>} />
          
          
          <Route path="/admin" element={<ProtectedRoute requiredRoles={['administrador']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/propostas" element={<ProtectedRoute requiredRoles={['administrador']}><AdminPropostas /></ProtectedRoute>} />
          <Route path="/admin/usuarios" element={<ProtectedRoute requiredRoles={['administrador']}><AdminUsuarios /></ProtectedRoute>} />
          <Route path="/admin/produtos" element={<ProtectedRoute requiredRoles={['administrador']}><AdminProdutos /></ProtectedRoute>} />
          <Route path="/admin/layouts-propostas" element={<ProtectedRoute requiredRoles={['administrador']}><AdminLayoutsPropostas /></ProtectedRoute>} />
          <Route path="/admin/configuracoes" element={<ProtectedRoute requiredRoles={['administrador']}><AdminConfiguracoes /></ProtectedRoute>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
