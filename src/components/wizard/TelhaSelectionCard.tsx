import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, Palette, DollarSign, Edit3 } from 'lucide-react';
import { ProdutoShingleCompleto } from '@/hooks/useProdutos';

interface TelhaSelectionCardProps {
  telha: ProdutoShingleCompleto | undefined;
  onEdit: () => void;
}

export function TelhaSelectionCard({ telha, onEdit }: TelhaSelectionCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!telha) {
    return (
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4 text-center">
          <Home className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Nenhuma telha selecionada</p>
          <Button variant="outline" size="sm" onClick={onEdit} className="mt-2">
            Selecionar Telha
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Extrair informações da descrição
  const descricaoParts = telha.descricao.split(' ');
  const modelo = descricaoParts.slice(0, 3).join(' '); // Ex: "SHINGLE LP SUPREME"
  const cor = descricaoParts.slice(3).join(' '); // Ex: "CINZA GRAFITE"

  return (
    <Card className="bg-background border-2 hover:border-primary/20 transition-colors">
      <CardContent className="p-4 space-y-3">
        {/* Header com linha */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <Home className="w-3 h-3 mr-1" />
            {telha.linha || 'LINHA'}
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onEdit}
            className="h-8 w-8 p-0 hover:bg-primary/10"
          >
            <Edit3 className="w-3 h-3" />
          </Button>
        </div>

        {/* Modelo da telha */}
        <div>
          <h3 className="font-semibold text-foreground leading-tight">
            {modelo}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Código: {telha.codigo}
          </p>
        </div>

        {/* Cor */}
        {cor && (
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {cor}
            </span>
          </div>
        )}

        {/* Preço */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-bold text-emerald-600">
            {formatCurrency(telha.preco_unitario)}/pct
          </span>
        </div>

        {/* Especificações técnicas se disponíveis */}
        {telha.especificacoes_tecnicas && (
          <div className="text-xs text-muted-foreground pt-1">
            <p>{telha.conteudo_unidade}m² por pacote</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}