import { useState } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { useUserRole } from "@/hooks/useUserRole"
import { 
  Home, 
  FileText, 
  Users, 
  Settings, 
  BarChart3, 
  Sun, 
  Building2,
  Bell,
  PlusCircle,
  ChevronRight,
  Zap,
  Shield,
  Trophy,
  Bot
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Propostas", url: "/propostas", icon: FileText },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Ranking", url: "/ranking", icon: Trophy },
]

const productsItems = [
  { title: "Energia Solar", url: "/energia-solar", icon: Sun },
  { title: "Materiais", url: "/materiais", icon: Building2 },
]

const toolsItems = [
  { title: "Notificações", url: "/notificacoes", icon: Bell, badge: "3" },
]

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: Settings },
  { title: "Propostas", url: "/admin/propostas", icon: FileText },
  { title: "Usuários", url: "/admin/usuarios", icon: Users },
  { title: "Produtos", url: "/admin/produtos", icon: Building2 },
  { title: "Layouts", url: "/admin/layouts-propostas", icon: Zap },
  { title: "Treinamento IA", url: "/admin/treinamento-ia", icon: Bot },
  { title: "Configurações", url: "/admin/configuracoes", icon: Shield },
]

export function DryStoreSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"
  
  const { 
    canAccessAdmin, 
    canViewProducts, 
    canViewAllPropostas,
    usuario,
    isAdmin,
    isVendedor,
    isRepresentante 
  } = useUserRole()

  // Se não há usuário carregado ainda, mostra loading
  if (!usuario) {
    return (
      <Sidebar
        className={`${collapsed ? "w-16" : "w-64"} border-r border-border bg-card transition-all duration-300`}
        collapsible="icon"
      >
        <SidebarContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  const isActive = (path: string) => currentPath === path
  const handleNavigation = (url: string) => {
    navigate(url);
  };

  const getButtonStyles = (isActive: boolean) => ({
    backgroundColor: isActive ? 'hsl(var(--gradient-primary))' : 'transparent',
    color: isActive ? 'white' : 'hsl(var(--sidebar-foreground))',
    fontWeight: isActive ? '600' : '400'
  });

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-gradient-primary text-white shadow-elegant font-medium" 
      : "hover:bg-sidebar-accent transition-all duration-300"

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} border-r border-border bg-card transition-all duration-300`}
      collapsible="icon"
    >
      <div className="p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-hero">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">DryStore</h2>
              <p className="text-xs text-muted-foreground">Portal de Propostas</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="p-2 rounded-lg bg-gradient-hero">
              <Zap className="h-6 w-6 text-white" />
            </div>
          </div>
        )}
      </div>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel 
            className={collapsed ? "sr-only" : "font-semibold text-sm"}
            style={{ color: 'hsl(var(--sidebar-foreground))' }}
          >
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => {
                // Controle de acesso para itens principais
                if (item.url === '/propostas' && !canViewAllPropostas()) return null;
                if (isRepresentante && item.url === '/clientes') return null; // Representantes só veem clientes limitados
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      onClick={() => handleNavigation(item.url)}
                      className={getNavCls({ isActive: isActive(item.url) })}
                      style={getButtonStyles(isActive(item.url))}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span style={{ color: 'inherit' }}>{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {canViewProducts() && (
          <SidebarGroup>
            <SidebarGroupLabel 
              className={collapsed ? "sr-only" : "font-semibold text-sm"}
              style={{ color: 'hsl(var(--sidebar-foreground))' }}
            >
              Produtos
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {productsItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      onClick={() => handleNavigation(item.url)}
                      className={getNavCls({ isActive: isActive(item.url) })}
                      style={getButtonStyles(isActive(item.url))}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span style={{ color: 'inherit' }}>{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel 
            className={collapsed ? "sr-only" : "font-semibold text-sm"}
            style={{ color: 'hsl(var(--sidebar-foreground))' }}
          >
            Ferramentas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => handleNavigation(item.url)}
                    className={getNavCls({ isActive: isActive(item.url) })}
                    style={getButtonStyles(isActive(item.url))}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span style={{ color: 'inherit' }}>{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {canAccessAdmin() && (
          <SidebarGroup>
            <SidebarGroupLabel 
              className={collapsed ? "sr-only" : "font-semibold text-sm"}
              style={{ color: 'hsl(var(--sidebar-foreground))' }}
            >
              Administração
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      onClick={() => handleNavigation(item.url)}
                      className={getNavCls({ isActive: isActive(item.url) })}
                      style={getButtonStyles(isActive(item.url))}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span style={{ color: 'inherit' }}>{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {!collapsed && (
          <div className="mt-6 p-4 bg-gradient-card rounded-lg border border-border shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Upgrade Pro</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Desbloqueie recursos avançados de AI e automação.
            </p>
            <button className="w-full py-2 px-3 bg-gradient-primary text-white text-sm rounded-md hover:shadow-glow transition-all duration-300">
              Upgrade
            </button>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  )
}