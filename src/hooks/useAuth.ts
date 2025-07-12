import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: 'administrador' | 'vendedor' | 'representante';
  whatsapp?: string;
  ativo: boolean;
}

interface AuthContextType {
  usuario: Usuario | null;
  login: (email: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se existe sessão armazenada
    const sessionData = localStorage.getItem('drystore_session');
    if (sessionData) {
      try {
        const parsedSession = JSON.parse(sessionData);
        if (parsedSession.usuario && parsedSession.expiresAt > Date.now()) {
          setUsuario(parsedSession.usuario);
        } else {
          localStorage.removeItem('drystore_session');
        }
      } catch (error) {
        localStorage.removeItem('drystore_session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      setIsLoading(true);
      
      // Buscar usuário por email
      const { data: usuarios, error } = await supabase
        .from('vendedores')
        .select('*')
        .eq('email', email)
        .eq('ativo', true)
        .single();

      if (error || !usuarios) {
        return { success: false, error: 'Usuário não encontrado ou inativo' };
      }

      // Por enquanto, verificação simples de senha (em produção usar hash)
      if (usuarios.senha !== senha) {
        return { success: false, error: 'Senha incorreta' };
      }

      const usuarioLogado: Usuario = {
        id: usuarios.id,
        nome: usuarios.nome,
        email: usuarios.email,
        tipo: usuarios.tipo,
        whatsapp: usuarios.whatsapp,
        ativo: usuarios.ativo
      };

      setUsuario(usuarioLogado);

      // Salvar sessão no localStorage (válida por 24h)
      const sessionData = {
        usuario: usuarioLogado,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000)
      };
      localStorage.setItem('drystore_session', JSON.stringify(sessionData));

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro interno do servidor' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('drystore_session');
  };

  return {
    usuario,
    login,
    logout,
    isLoading
  };
};