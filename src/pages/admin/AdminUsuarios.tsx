import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DryStoreSidebar } from "@/components/DryStoreSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  whatsapp?: string;
  tipo: 'administrador' | 'vendedor' | 'representante';
  ativo: boolean;
  senha?: string;
}

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [novoUsuario, setNovoUsuario] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    tipo: 'vendedor' as 'administrador' | 'vendedor' | 'representante',
    senha: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const ranking = [
    { pos: 1, nome: "Carlos Santos", valor: "R$ 45.000", meta: "R$ 50.000", falta: "R$ 5.000" },
    { pos: 2, nome: "Ana Lima", valor: "R$ 38.000", meta: "R$ 40.000", falta: "R$ 2.000" },
    { pos: 3, nome: "João Pedro", valor: "R$ 30.000", meta: "R$ 35.000", falta: "R$ 5.000" }
  ];

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('vendedores')
        .select('*')
        .order('nome');

      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive"
      });
    }
  };

  const adicionarUsuario = async () => {
    if (!novoUsuario.nome || !novoUsuario.email) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('vendedores')
        .insert([{
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          whatsapp: novoUsuario.whatsapp,
          tipo: novoUsuario.tipo,
          senha: novoUsuario.senha || '123456' // Senha padrão
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário adicionado com sucesso"
      });

      setNovoUsuario({
        nome: '',
        email: '',
        whatsapp: '',
        tipo: 'vendedor',
        senha: ''
      });

      carregarUsuarios();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar usuário",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const alterarStatus = async (id: string, ativo: boolean) => {
    try {
      const { error } = await supabase
        .from('vendedores')
        .update({ ativo })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Usuário ${ativo ? 'ativado' : 'desativado'} com sucesso`
      });

      carregarUsuarios();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status do usuário",
        variant: "destructive"
      });
    }
  };

  const getTipoBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'administrador': return 'destructive';
      case 'vendedor': return 'default';
      case 'representante': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DryStoreSidebar />
        <div className="flex-1">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 lg:px-6">
              <SidebarTrigger />
              <div className="ml-auto flex items-center space-x-4">
                <h1 className="text-lg font-semibold">Gestão de Usuários</h1>
              </div>
            </div>
          </header>

          <main className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Usuários e Ranking</h2>
              <p className="text-muted-foreground">
                Gerencie vendedores e acompanhe o desempenho da equipe
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Gestão de Usuários</CardTitle>
                <CardDescription>Cadastre e gerencie vendedores e administradores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nomeUsuario">Nome</Label>
                      <Input 
                        id="nomeUsuario" 
                        placeholder="Nome completo"
                        value={novoUsuario.nome}
                        onChange={(e) => setNovoUsuario({...novoUsuario, nome: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emailUsuario">Email</Label>
                      <Input 
                        id="emailUsuario" 
                        type="email" 
                        placeholder="email@exemplo.com"
                        value={novoUsuario.email}
                        onChange={(e) => setNovoUsuario({...novoUsuario, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="whatsappUsuario">WhatsApp</Label>
                      <Input 
                        id="whatsappUsuario" 
                        placeholder="(11) 99999-9999"
                        value={novoUsuario.whatsapp}
                        onChange={(e) => setNovoUsuario({...novoUsuario, whatsapp: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tipoUsuario">Tipo de Usuário</Label>
                      <Select 
                        value={novoUsuario.tipo} 
                        onValueChange={(value: 'administrador' | 'vendedor' | 'representante') => 
                          setNovoUsuario({...novoUsuario, tipo: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vendedor">Vendedor</SelectItem>
                          <SelectItem value="representante">Representante</SelectItem>
                          <SelectItem value="administrador">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="senhaUsuario">Senha (opcional)</Label>
                      <Input 
                        id="senhaUsuario" 
                        type="password" 
                        placeholder="Deixe vazio para usar padrão (123456)"
                        value={novoUsuario.senha}
                        onChange={(e) => setNovoUsuario({...novoUsuario, senha: e.target.value})}
                      />
                    </div>
                  </div>
                  <Button onClick={adicionarUsuario} disabled={isLoading}>
                    {isLoading ? 'Adicionando...' : 'Adicionar Usuário'}
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>WhatsApp</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell>{usuario.nome}</TableCell>
                        <TableCell>{usuario.email}</TableCell>
                        <TableCell>{usuario.whatsapp || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={getTipoBadgeVariant(usuario.tipo)}>
                            {usuario.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch 
                            checked={usuario.ativo} 
                            onCheckedChange={(checked) => alterarStatus(usuario.id, checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">Editar</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ranking de Vendedores</CardTitle>
                <CardDescription>Acompanhe o desempenho da equipe</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ranking.map((vendedor) => (
                    <div key={vendedor.pos} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl font-bold text-primary">#{vendedor.pos}</div>
                        <div>
                          <h3 className="font-semibold">{vendedor.nome}</h3>
                          <p className="text-sm text-muted-foreground">Vendido: {vendedor.valor}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Meta: {vendedor.meta}</p>
                        <p className="text-sm text-muted-foreground">Falta: {vendedor.falta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminUsuarios;