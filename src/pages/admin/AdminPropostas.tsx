import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DryStoreSidebar } from "@/components/DryStoreSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminPropostas = () => {
  const { toast } = useToast();

  const propostas = [
    { id: "1", cliente: "João Silva", vendedor: "Carlos Santos", valor: "R$ 25.000", status: "aberta", tipo: "energia-solar" },
    { id: "2", cliente: "Maria Costa", vendedor: "Ana Lima", valor: "R$ 8.500", status: "aceita", tipo: "telhas" },
    { id: "3", cliente: "Pedro Oliveira", vendedor: "João Pedro", valor: "R$ 15.000", status: "expirada", tipo: "energia-solar" }
  ];

  const solicitacoesDesconto = [
    { id: "1", vendedor: "Carlos Santos", cliente: "João Silva", desconto: "15%", motivo: "Cliente concorrente", status: "pendente" },
    { id: "2", vendedor: "Ana Lima", cliente: "Maria Costa", desconto: "10%", motivo: "Fidelidade", status: "pendente" }
  ];

  const handleAprovarDesconto = (id: string, aprovado: boolean) => {
    toast({
      title: aprovado ? "Desconto Aprovado" : "Desconto Rejeitado",
      description: `Solicitação ${id} foi ${aprovado ? 'aprovada' : 'rejeitada'} com sucesso.`
    });
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
                <h1 className="text-lg font-semibold">Gestão de Propostas</h1>
              </div>
            </div>
          </header>

          <main className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Propostas e Aprovações</h2>
              <p className="text-muted-foreground">
                Gerencie todas as propostas e aprove solicitações de desconto
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Todas as Propostas</CardTitle>
                <CardDescription>Gerencie todas as propostas do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {propostas.map((proposta) => (
                      <TableRow key={proposta.id}>
                        <TableCell>{proposta.cliente}</TableCell>
                        <TableCell>{proposta.vendedor}</TableCell>
                        <TableCell>{proposta.valor}</TableCell>
                        <TableCell>{proposta.tipo}</TableCell>
                        <TableCell>
                          <Badge variant={
                            proposta.status === 'aceita' ? 'default' :
                            proposta.status === 'aberta' ? 'secondary' : 'destructive'
                          }>
                            {proposta.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Solicitações de Desconto</CardTitle>
                <CardDescription>Aprove ou rejeite solicitações de desconto dos vendedores</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Desconto</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {solicitacoesDesconto.map((solicitacao) => (
                      <TableRow key={solicitacao.id}>
                        <TableCell>{solicitacao.vendedor}</TableCell>
                        <TableCell>{solicitacao.cliente}</TableCell>
                        <TableCell>{solicitacao.desconto}</TableCell>
                        <TableCell>{solicitacao.motivo}</TableCell>
                        <TableCell className="space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleAprovarDesconto(solicitacao.id, true)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleAprovarDesconto(solicitacao.id, false)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeitar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminPropostas;