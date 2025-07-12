import { useAuth } from '@/contexts/AuthContext';

export const useUserRole = () => {
  const { usuario } = useAuth();

  const isAdmin = usuario?.tipo === 'administrador';
  const isVendedor = usuario?.tipo === 'vendedor';
  const isRepresentante = usuario?.tipo === 'representante';

  const hasAccess = (allowedRoles: string[]) => {
    if (!usuario) return false;
    return allowedRoles.includes(usuario.tipo);
  };

  const canAccessAdmin = () => isAdmin;
  const canManageUsers = () => isAdmin;
  const canConfigureSystem = () => isAdmin;
  const canViewAllPropostas = () => isAdmin || isVendedor;
  const canCreatePropostas = () => isAdmin || isVendedor;
  const canViewProducts = () => isAdmin || isVendedor;

  return {
    usuario,
    isAdmin,
    isVendedor,
    isRepresentante,
    hasAccess,
    canAccessAdmin,
    canManageUsers,
    canConfigureSystem,
    canViewAllPropostas,
    canCreatePropostas,
    canViewProducts
  };
};