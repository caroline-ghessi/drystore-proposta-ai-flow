
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileDown, CheckCircle, AlertTriangle, Package, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface ItemQuantitativo {
  codigo: string;
  descricao: string;
  categoria: string;
  quantidade_liquida: number;
  quebra_percentual: number;
  quantidade_com_quebra: number;
  unidade_venda: string;
  quantidade_embalagens: number;
  preco_unitario: number;
  valor_total: number;
  ordem: number;
}

export interface ResumoCategoria {
  categoria: string;
  quantidade_itens: number;
  valor_total: number;
  itens: ItemQuantitativo[];
}

interface PlanilhaQuantitativosProps {
  itens: ItemQuantitativo[];
  area_telhado: number;
  valor_total_geral: number;
  onBack: () => void;
  onApprove: () => void;
}

export function PlanilhaQuantitativos({
  itens,
  area_telhado,
  valor_total_geral,
  onBack,
  onApprove
}: PlanilhaQuantitativosProps) {
  const [observacoes, setObservacoes] = useState('');
  const { toast } = useToast();

  // Agrupar itens por categoria
  const resumoPorCategoria = itens.reduce((acc, item) => {
    if (!acc[item.categoria]) {
      acc[item.categoria] = {
        categoria: item.categoria,
        quantidade_itens: 0,
        valor_total: 0,
        itens: []
      };
    }
    acc[item.categoria].quantidade_itens += 1;
    acc[item.categoria].valor_total += item.valor_total;
    acc[item.categoria].itens.push(item);
    return acc;
  }, {} as Record<string, ResumoCategoria>);

  const categorias = Object.values(resumoPorCategoria);

  const handleExportarPlanilha = () => {
    // Preparar dados para exportação
    const csvContent = [
      ['Código', 'Descrição', 'Categoria', 'Qtd Líquida', 'Quebra %', 'Qtd c/ Quebra', 'Unidade', 'Embalagens', 'Preço Unit.', 'Valor Total'].join(','),
      ...itens.map(item => [
        item.codigo,
        `"${item.descricao}"`,
        item.categoria,
        item.quantidade_liquida.toFixed(2),
        item.quebra_percentual.toFixed(1),
        item.quantidade_com_quebra.toFixed(2),
        item.unidade_venda,
        item.quantidade_embalagens,
        item.preco_unitario.toFixed(2),
        item.valor_total.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantitativos_telha_shingle_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Planilha Exportada",
      description: "Download da planilha de quantitativos iniciado.",
    });
  };

  const formatarCategoria = (categoria: string) => {
    const labels: Record<string, string> = {
      'TELHAS_SHINGLE': 'Telhas Shingle',
      'PLACAS_OSB': 'Placas OSB',
      'SUBCOBERTURA': 'Subcobertura',
      'STARTER_SHINGLE': 'Starter',
      'ACESSORIOS_SHINGLE': 'Acessórios',
      'FIXACAO': 'Fixação',
      'VEDACAO': 'Vedação'
    };
    return labels[categoria] || categoria;
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Validação de Quantitativos
        </h3>
        <p className="text-muted-foreground">
          Confira os quantitativos calculados antes de gerar a proposta final
        </p>
      </div>

      {/* Resumo Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            Resumo Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {area_telhado.toFixed(1)}m²
              </p>
              <p className="text-sm text-muted-foreground">Área do Telhado</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {itens.length}
              </p>
              <p className="text-sm text-muted-foreground">Itens Diferentes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {categorias.length}
              </p>
              <p className="text-sm text-muted-foreground">Categorias</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {valor_total_geral.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </p>
              <p className="text-sm text-muted-foreground">Valor Total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Planilha por Categoria */}
      {categorias.map((categoria) => (
        <Card key={categoria.categoria}>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>{formatarCategoria(categoria.categoria)}</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {categoria.quantidade_itens} {categoria.quantidade_itens === 1 ? 'item' : 'itens'}
                </Badge>
                <Badge variant="outline">
                  {categoria.valor_total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Qtd Líquida</TableHead>
                  <TableHead className="text-right">Quebra %</TableHead>
                  <TableHead className="text-right">Qtd c/ Quebra</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead className="text-right">Embalagens</TableHead>
                  <TableHead className="text-right">Preço Unit.</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoria.itens.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm">{item.codigo}</TableCell>
                    <TableCell className="max-w-xs truncate" title={item.descricao}>
                      {item.descricao}
                    </TableCell>
                    <TableCell className="text-right">{item.quantidade_liquida.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      {item.quebra_percentual > 0 && (
                        <Badge variant={item.quebra_percentual > 10 ? "destructive" : "secondary"}>
                          {item.quebra_percentual.toFixed(1)}%
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {item.quantidade_com_quebra.toFixed(2)}
                    </TableCell>
                    <TableCell>{item.unidade_venda}</TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {item.quantidade_embalagens}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.preco_unitario.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {item.valor_total.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Observações sobre Quantitativos</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Digite observações sobre os quantitativos calculados (opcional)..."
            className="w-full h-20 p-3 border rounded-md resize-none"
          />
        </CardContent>
      </Card>

      {/* Alertas */}
      <div className="space-y-2">
        {itens.some(item => item.quebra_percentual > 15) && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">
                  Alguns itens possuem quebra superior a 15%. Verifique se os quantitativos estão corretos.
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack}>
            Voltar para Ajustes
          </Button>
          <Button variant="outline" onClick={handleExportarPlanilha}>
            <FileDown className="h-4 w-4 mr-2" />
            Exportar Planilha
          </Button>
        </div>
        <Button 
          onClick={onApprove}
          className="bg-green-600 hover:bg-green-700 text-white"
          size="lg"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Aprovar e Gerar Proposta
        </Button>
      </div>
    </div>
  );
}
