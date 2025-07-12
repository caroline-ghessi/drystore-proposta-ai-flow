import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, Zap, DollarSign, Building, BarChart3 } from "lucide-react"
import { DadosContaLuz } from "@/services/difyService"

interface DadosContaLuzDisplayProps {
  dados: DadosContaLuz;
}

export function DadosContaLuzDisplay({ dados }: DadosContaLuzDisplayProps) {
  const dadosContaLuz = dados;

  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getConsumosPorMes = () => {
    const consumos: Array<{ mes: string; ano: number; consumo: number | null }> = [];
    
    // Adicionar consumos do ano atual
    Object.entries(dadosContaLuz.historico_consumo.dados_ano_atual.meses).forEach(([mes, consumo]) => {
      consumos.push({
        mes: mes.charAt(0).toUpperCase() + mes.slice(1),
        ano: dadosContaLuz.historico_consumo.dados_ano_atual.ano,
        consumo
      });
    });
    
    // Adicionar consumos do ano anterior
    Object.entries(dadosContaLuz.historico_consumo.dados_ano_anterior.meses).forEach(([mes, consumo]) => {
      consumos.push({
        mes: mes.charAt(0).toUpperCase() + mes.slice(1),
        ano: dadosContaLuz.historico_consumo.dados_ano_anterior.ano,
        consumo
      });
    });
    
    return consumos.filter(c => c.consumo && c.consumo > 0);
  };

  const consumosHistorico = getConsumosPorMes();
  
  // Calcular consumo médio
  const consumoMedio = consumosHistorico.length > 0 
    ? Math.round(consumosHistorico.reduce((acc, curr) => acc + (curr.consumo || 0), 0) / consumosHistorico.length)
    : dadosContaLuz.consumo_atual || 0;

  // Extrair cidade e estado do endereço
  const extrairCidadeEstado = (endereco: string) => {
    const partes = endereco.split(',').map(p => p.trim());
    if (partes.length >= 2) {
      const estado = partes[partes.length - 1];
      const cidade = partes[partes.length - 2];
      return { cidade, estado };
    }
    return { cidade: 'São Paulo', estado: 'SP' };
  };

  const { cidade, estado } = extrairCidadeEstado(dadosContaLuz.endereco || '');
  const tipoInstalacao = consumoMedio <= 500 ? 'residencial' : consumoMedio <= 2000 ? 'comercial' : 'industrial';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dados do Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building className="h-4 w-4" />
              Informações do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Nome:</span>
              <p className="text-sm">{dadosContaLuz.nome_cliente}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Endereço:</span>
              <p className="text-sm">{dadosContaLuz.endereco}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">UC:</span>
              <p className="text-sm">{dadosContaLuz.numero_instalacao}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Concessionária:</span>
              <p className="text-sm">{dadosContaLuz.concessionaria}</p>
            </div>
          </CardContent>
        </Card>

        {/* Dados da Conta */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Dados de Consumo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Consumo Atual:</span>
              <p className="text-sm">{dadosContaLuz.consumo_atual || 0} kWh</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Consumo Médio (24 meses):</span>
              <p className="text-sm font-semibold text-primary">{consumoMedio} kWh</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Valor da Conta:</span>
              <p className="text-sm">{formatCurrency(dadosContaLuz.valor_total)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Tarifa kWh:</span>
              <p className="text-sm">{formatCurrency(dadosContaLuz.preco_kw)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dados Calculados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Informações para Dimensionamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Localização:</span>
              <p className="text-sm">{cidade}, {estado}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Tipo de Instalação:</span>
              <Badge variant="outline" className="text-xs">
                {tipoInstalacao.charAt(0).toUpperCase() + tipoInstalacao.slice(1)}
              </Badge>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Mês Referência:</span>
              <p className="text-sm">{dadosContaLuz.mes_referencia}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Consumo */}
      {consumosHistorico.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Histórico de Consumo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {consumosHistorico.slice(0, 12).map((item, index) => (
                <div key={index} className="text-center p-2 bg-muted/50 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground">
                    {item.mes} {item.ano}
                  </p>
                  <p className="text-sm font-semibold">
                    {item.consumo} kWh
                  </p>
                </div>
              ))}
            </div>
            {consumosHistorico.length > 12 && (
              <div className="mt-3 text-center">
                <p className="text-xs text-muted-foreground">
                  E mais {consumosHistorico.length - 12} meses de histórico...
                </p>
              </div>
            )}
            <Separator className="my-4" />
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Observação:</strong> {dadosContaLuz.historico_consumo.observacao}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}