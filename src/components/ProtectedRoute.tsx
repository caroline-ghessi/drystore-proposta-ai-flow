import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const { usuario, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !usuario) {
      navigate('/login');
    }
  }, [usuario, isLoading, navigate]);

  useEffect(() => {
    if (usuario && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.includes(usuario.tipo);
      if (!hasRequiredRole) {
        navigate('/'); // Redirecionar para dashboard se não tiver acesso
      }
    }
  }, [usuario, requiredRoles, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return null; // Será redirecionado para login
  }

  return <>{children}</>;
};