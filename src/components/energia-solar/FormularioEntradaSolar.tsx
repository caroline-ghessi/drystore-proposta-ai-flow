import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, MapPin, Zap, Home } from 'lucide-react';
import { DadosEntradaSolar } from '@/hooks/useEnergiaSolar';
import { EnergiaSolarCalculos } from '@/services/energiaSolarCalculos';

interface FormularioEntradaSolarProps {
  dados: DadosEntradaSolar;
  onChange: (dados: DadosEntradaSolar) => void;
  onCalcular: () => void;
  loading?: boolean;
}

const ESTADOS_BRASIL = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' }
];

export const FormularioEntradaSolar = ({ 
  dados, 
  onChange, 
  onCalcular, 
  loading = false 
}: FormularioEntradaSolarProps) => {
  const [validacao, setValidacao] = useState<{ valido: boolean; erros: string[]; avisos: string[] }>({
    valido: true,
    erros: [],
    avisos: []
  });
  const [estimativaRapida, setEstimativaRapida] = useState<any>(null);

  useEffect(() => {
    // Validar dados quando mudarem
    const resultadoValidacao = EnergiaSolarCalculos.validarEntrada({
      consumo_mensal_kwh: dados.consumo_mensal_kwh,
      cidade: dados.cidade,
      estado: dados.estado,
      area_disponivel: dados.area_disponivel
    });
    setValidacao(resultadoValidacao);

    // Calcular estimativa rápida se consumo válido
    if (dados.consumo_mensal_kwh > 0) {
      const estimativa = EnergiaSolarCalculos.calcularEstimativaRapida(
        dados.consumo_mensal_kwh,
        dados.estado
      );
      setEstimativaRapida(estimativa);
    }
  }, [dados]);

  const handleChange = (campo: keyof DadosEntradaSolar, valor: any) => {
    onChange({
      ...dados,
      [campo]: valor
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Dados da Instalação Solar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Consumo Mensal */}
          <div className="space-y-2">
            <Label htmlFor="consumo">Consumo Mensal (kWh/mês) *</Label>
            <Input
              id="consumo"
              type="number"
              placeholder="Ex: 350"
              value={dados.consumo_mensal_kwh || ''}
              onChange={(e) => handleChange('consumo_mensal_kwh', Number(e.target.value))}
              min="0"
              step="1"
            />
            <p className="text-sm text-muted-foreground">
              Valor encontrado na sua conta de luz
            </p>
          </div>

          {/* Localização */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estado">Estado *</Label>
              <Select value={dados.estado} onValueChange={(value) => handleChange('estado', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_BRASIL.map((estado) => (
                    <SelectItem key={estado.sigla} value={estado.sigla}>
                      {estado.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade *</Label>
              <Input
                id="cidade"
                placeholder="Ex: São Paulo"
                value={dados.cidade}
                onChange={(e) => handleChange('cidade', e.target.value)}
              />
            </div>
          </div>

          {/* Tipo de Instalação */}
          <div className="space-y-2">
            <Label>Tipo de Instalação</Label>
            <Select 
              value={dados.tipo_instalacao} 
              onValueChange={(value: 'residencial' | 'comercial' | 'industrial') => 
                handleChange('tipo_instalacao', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residencial">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Residencial
                  </div>
                </SelectItem>
                <SelectItem value="comercial">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Comercial
                  </div>
                </SelectItem>
                <SelectItem value="industrial">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Industrial
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Telha */}
          <div className="space-y-2">
            <Label>Tipo de Telha</Label>
            <Select 
              value={dados.tipo_telha} 
              onValueChange={(value: 'ceramica' | 'concreto' | 'metalica' | 'fibrocimento') => 
                handleChange('tipo_telha', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de telha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ceramica">Cerâmica</SelectItem>
                <SelectItem value="concreto">Concreto</SelectItem>
                <SelectItem value="metalica">Metálica</SelectItem>
                <SelectItem value="fibrocimento">Fibrocimento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Área Disponível */}
          <div className="space-y-2">
            <Label htmlFor="area">Área Disponível (m²) - Opcional</Label>
            <Input
              id="area"
              type="number"
              placeholder="Ex: 50"
              value={dados.area_disponivel || ''}
              onChange={(e) => handleChange('area_disponivel', Number(e.target.value) || undefined)}
              min="0"
              step="0.1"
            />
            <p className="text-sm text-muted-foreground">
              Área estimada do telhado disponível para painéis
            </p>
          </div>

          {/* Tarifa de Energia */}
          <div className="space-y-2">
            <Label htmlFor="tarifa">Tarifa de Energia (R$/kWh) - Opcional</Label>
            <Input
              id="tarifa"
              type="number"
              placeholder="Ex: 0.75"
              value={dados.tarifa_energia || ''}
              onChange={(e) => handleChange('tarifa_energia', Number(e.target.value) || undefined)}
              min="0"
              step="0.01"
            />
            <p className="text-sm text-muted-foreground">
              Valor da tarifa na sua conta de luz (padrão: R$ 0,75/kWh)
            </p>
          </div>

          {/* Alertas de Validação */}
          {validacao.erros.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {validacao.erros.map((erro, index) => (
                    <li key={index}>{erro}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {validacao.avisos.length > 0 && (
            <Alert>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {validacao.avisos.map((aviso, index) => (
                    <li key={index}>{aviso}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Estimativa Rápida */}
          {estimativaRapida && dados.consumo_mensal_kwh > 0 && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Estimativa Rápida</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Potência</p>
                  <p className="font-semibold">{estimativaRapida.potencia_estimada_kwp} kWp</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Investimento</p>
                  <p className="font-semibold">R$ {estimativaRapida.custo_estimado.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Economia/ano</p>
                  <p className="font-semibold">R$ {estimativaRapida.economia_anual_estimada.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payback</p>
                  <p className="font-semibold">{estimativaRapida.payback_estimado} anos</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botão Calcular */}
          <Button 
            onClick={onCalcular}
            disabled={!validacao.valido || loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Calculando...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4 mr-2" />
                Calcular Sistema Solar
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};