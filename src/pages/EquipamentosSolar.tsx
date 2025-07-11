import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Download, Upload, Edit, Trash2, Eye, AlertTriangle } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DryStoreSidebar } from "@/components/DryStoreSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface EquipamentoSolar {
  id: string;
  categoria: 'painel' | 'inversor' | 'bateria' | 'conector' | 'material_ca';
  fabricante: string;
  modelo: string;
  potencia: number;
  tensao: number;
  corrente: number;
  frequencia?: number;
  dimensoes: { largura: number; altura: number; profundidade: number };
  peso: number;
  garantia: number;
  precoUnitario: number;
  estoqueDisponivel: number;
  especificacoesTecnicas: Record<string, any>;
  compatibilidades: Record<string, any>;
  ativo: boolean;
  // Campos específicos
  eficiencia?: number;
  tipoCelula?: 'mono' | 'poli';
  fatorDimensionamento?: number;
  capacidade?: number;
  tipoConexao?: string;
  areaOcupada?: number;
  potenciaMinima?: number;
  potenciaMaxima?: number;
  cicloVida?: number;
  tempoCarregamento?: number;
  material?: string;
  resistencia?: number;
  tipoCorrente?: 'AC' | 'DC';
  comprimento?: number;
  calibre?: number;
}

const mockEquipamentos: EquipamentoSolar[] = [
  {
    id: "1",
    categoria: "painel",
    fabricante: "Canadian Solar",
    modelo: "CS3W-400P",
    potencia: 0.4,
    tensao: 24,
    corrente: 16.67,
    dimensoes: { largura: 1.0, altura: 2.0, profundidade: 0.04 },
    peso: 22.5,
    garantia: 25,
    precoUnitario: 850.00,
    estoqueDisponivel: 15,
    especificacoesTecnicas: { eficiencia: 0.205, material: "silício monocristalino" },
    compatibilidades: { tipos_telhas: ["ceramica", "metalica"], sistemas: ["residencial", "comercial"] },
    ativo: true,
    eficiencia: 20.5,
    tipoCelula: "mono",
    areaOcupada: 2.0
  },
  {
    id: "2",
    categoria: "inversor",
    fabricante: "Fronius",
    modelo: "Primo 5.0-1",
    potencia: 5.0,
    tensao: 220,
    corrente: 22.7,
    frequencia: 60,
    dimensoes: { largura: 0.43, altura: 0.65, profundidade: 0.21 },
    peso: 23.5,
    garantia: 12,
    precoUnitario: 4200.00,
    estoqueDisponivel: 8,
    especificacoesTecnicas: { eficiencia: 0.975, tipoOnda: "senoidal pura" },
    compatibilidades: { tensaoRede: ["220V"], fases: ["monofasico"] },
    ativo: true,
    fatorDimensionamento: 1.15,
    potenciaMinima: 1.0,
    potenciaMaxima: 7.5
  },
  {
    id: "3",
    categoria: "bateria",
    fabricante: "Freedom",
    modelo: "DF2000",
    potencia: 2.0,
    tensao: 12,
    corrente: 166.7,
    dimensoes: { largura: 0.33, altura: 0.17, profundidade: 0.18 },
    peso: 65.0,
    garantia: 5,
    precoUnitario: 1200.00,
    estoqueDisponivel: 5,
    especificacoesTecnicas: { tecnologia: "AGM", profundidadeDescarga: 0.8 },
    compatibilidades: { sistemas: ["off-grid", "backup"] },
    ativo: true,
    capacidade: 200,
    cicloVida: 1200,
    tempoCarregamento: 8
  },
  {
    id: "4",
    categoria: "conector",
    fabricante: "Staubli",
    modelo: "MC4-Evo 2",
    potencia: 0,
    tensao: 1500,
    corrente: 30,
    dimensoes: { largura: 0.03, altura: 0.08, profundidade: 0.03 },
    peso: 0.05,
    garantia: 25,
    precoUnitario: 25.00,
    estoqueDisponivel: 150,
    especificacoesTecnicas: { grauProtecao: "IP67", materialContatos: "cobre estanhado" },
    compatibilidades: { cabos: ["4mm2", "6mm2"] },
    ativo: true,
    tipoConexao: "MC4",
    material: "cobre",
    resistencia: 0.0002
  },
  {
    id: "5",
    categoria: "material_ca",
    fabricante: "Prysmian",
    modelo: "Cabo Solar 4mm²",
    potencia: 0,
    tensao: 1800,
    corrente: 42,
    dimensoes: { largura: 0.004, altura: 0.004, profundidade: 0 },
    peso: 0.055,
    garantia: 25,
    precoUnitario: 8.50,
    estoqueDisponivel: 500,
    especificacoesTecnicas: { isolacao: "XLPE", temperatura: "90C" },
    compatibilidades: { conectores: ["MC4"], aplicacao: ["externa"] },
    ativo: true,
    tipoCorrente: "DC",
    comprimento: 1,
    calibre: 4
  }
];

const categorias = [
  { value: "painel", label: "Painel Solar" },
  { value: "inversor", label: "Inversor" },
  { value: "bateria", label: "Bateria" },
  { value: "conector", label: "Conector" },
  { value: "material_ca", label: "Material CA" }
];

export default function EquipamentosSolar() {
  const [equipamentos, setEquipamentos] = useState<EquipamentoSolar[]>(mockEquipamentos);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [equipamentoEditando, setEquipamentoEditando] = useState<EquipamentoSolar | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<Partial<EquipamentoSolar>>({
    categoria: "painel",
    ativo: true,
    dimensoes: { largura: 0, altura: 0, profundidade: 0 },
    especificacoesTecnicas: {},
    compatibilidades: {}
  });

  const equipamentosFiltrados = useMemo(() => {
    return equipamentos.filter(eq => {
      const matchCategoria = filtroCategoria === "todos" || eq.categoria === filtroCategoria;
      const matchBusca = busca === "" || 
        eq.modelo.toLowerCase().includes(busca.toLowerCase()) ||
        eq.fabricante.toLowerCase().includes(busca.toLowerCase());
      return matchCategoria && matchBusca;
    });
  }, [equipamentos, filtroCategoria, busca]);

  const abrirModal = (equipamento?: EquipamentoSolar) => {
    if (equipamento) {
      setEquipamentoEditando(equipamento);
      setFormData(equipamento);
    } else {
      setEquipamentoEditando(null);
      setFormData({
        categoria: "painel",
        ativo: true,
        dimensoes: { largura: 0, altura: 0, profundidade: 0 },
        especificacoesTecnicas: {},
        compatibilidades: {}
      });
    }
    setModalAberto(true);
  };

  const salvarEquipamento = () => {
    if (!formData.fabricante || !formData.modelo || !formData.potencia) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const novoEquipamento: EquipamentoSolar = {
      ...formData as EquipamentoSolar,
      id: equipamentoEditando?.id || Date.now().toString()
    };

    if (equipamentoEditando) {
      setEquipamentos(prev => prev.map(eq => eq.id === equipamentoEditando.id ? novoEquipamento : eq));
      toast({ title: "Sucesso", description: "Equipamento atualizado com sucesso!" });
    } else {
      setEquipamentos(prev => [...prev, novoEquipamento]);
      toast({ title: "Sucesso", description: "Equipamento adicionado com sucesso!" });
    }

    setModalAberto(false);
  };

  const excluirEquipamento = (id: string) => {
    setEquipamentos(prev => prev.filter(eq => eq.id !== id));
    toast({ title: "Sucesso", description: "Equipamento removido com sucesso!" });
  };

  const exportarCSV = () => {
    const csv = equipamentosFiltrados.map(eq => 
      `${eq.id},${eq.categoria},${eq.fabricante},${eq.modelo},${eq.potencia},${eq.precoUnitario},${eq.estoqueDisponivel}`
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'equipamentos-solar.csv';
    a.click();
    
    toast({ title: "Sucesso", description: "Dados exportados com sucesso!" });
  };

  const renderCamposEspecificos = () => {
    const categoria = formData.categoria;
    
    switch (categoria) {
      case 'painel':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eficiencia">Eficiência (%)</Label>
                <Input
                  id="eficiencia"
                  type="number"
                  step="0.1"
                  value={formData.eficiencia || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, eficiencia: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="tipoCelula">Tipo de Célula</Label>
                <Select value={formData.tipoCelula || ""} onValueChange={(value) => setFormData(prev => ({ ...prev, tipoCelula: value as 'mono' | 'poli' }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mono">Monocristalino</SelectItem>
                    <SelectItem value="poli">Policristalino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="areaOcupada">Área Ocupada (m²)</Label>
              <Input
                id="areaOcupada"
                type="number"
                step="0.01"
                value={formData.areaOcupada || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, areaOcupada: parseFloat(e.target.value) }))}
              />
            </div>
          </>
        );
      
      case 'inversor':
        return (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fatorDimensionamento">Fator de Dimensionamento</Label>
                <Input
                  id="fatorDimensionamento"
                  type="number"
                  step="0.1"
                  value={formData.fatorDimensionamento || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, fatorDimensionamento: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="potenciaMinima">Potência Mínima (kW)</Label>
                <Input
                  id="potenciaMinima"
                  type="number"
                  step="0.1"
                  value={formData.potenciaMinima || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, potenciaMinima: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="potenciaMaxima">Potência Máxima (kW)</Label>
                <Input
                  id="potenciaMaxima"
                  type="number"
                  step="0.1"
                  value={formData.potenciaMaxima || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, potenciaMaxima: parseFloat(e.target.value) }))}
                />
              </div>
            </div>
          </>
        );
      
      case 'bateria':
        return (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="capacidade">Capacidade (Ah/Wh)</Label>
                <Input
                  id="capacidade"
                  type="number"
                  value={formData.capacidade || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacidade: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="cicloVida">Ciclo de Vida (ciclos)</Label>
                <Input
                  id="cicloVida"
                  type="number"
                  value={formData.cicloVida || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, cicloVida: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="tempoCarregamento">Tempo de Carregamento (h)</Label>
                <Input
                  id="tempoCarregamento"
                  type="number"
                  value={formData.tempoCarregamento || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, tempoCarregamento: parseFloat(e.target.value) }))}
                />
              </div>
            </div>
          </>
        );
      
      case 'conector':
        return (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tipoConexao">Tipo de Conexão</Label>
                <Input
                  id="tipoConexao"
                  value={formData.tipoConexao || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipoConexao: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="material">Material</Label>
                <Select value={formData.material || ""} onValueChange={(value) => setFormData(prev => ({ ...prev, material: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cobre">Cobre</SelectItem>
                    <SelectItem value="aluminio">Alumínio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="resistencia">Resistência (ohms)</Label>
                <Input
                  id="resistencia"
                  type="number"
                  step="0.0001"
                  value={formData.resistencia || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, resistencia: parseFloat(e.target.value) }))}
                />
              </div>
            </div>
          </>
        );
      
      case 'material_ca':
        return (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tipoCorrente">Tipo de Corrente</Label>
                <Select value={formData.tipoCorrente || ""} onValueChange={(value) => setFormData(prev => ({ ...prev, tipoCorrente: value as 'AC' | 'DC' }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AC">AC</SelectItem>
                    <SelectItem value="DC">DC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="comprimento">Comprimento (m)</Label>
                <Input
                  id="comprimento"
                  type="number"
                  step="0.1"
                  value={formData.comprimento || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, comprimento: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="calibre">Calibre (mm²)</Label>
                <Input
                  id="calibre"
                  type="number"
                  step="0.1"
                  value={formData.calibre || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, calibre: parseFloat(e.target.value) }))}
                />
              </div>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DryStoreSidebar />
        <div className="flex-1">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-6">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold">Gestão de Equipamentos Solar</h1>
            </div>
          </header>

          <main className="p-6 space-y-6">
            {/* Filtros e Ações */}
            <Card>
              <CardHeader>
                <CardTitle>Equipamentos de Energia Solar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por modelo ou fabricante..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas as categorias</SelectItem>
                      {categorias.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button onClick={() => abrirModal()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                    <Button variant="outline" onClick={exportarCSV}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar CSV
                    </Button>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Importar CSV
                    </Button>
                  </div>
                </div>

                {/* Tabela */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Fabricante</TableHead>
                        <TableHead>Modelo</TableHead>
                        <TableHead>Potência</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Estoque</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {equipamentosFiltrados.map((equipamento) => (
                        <TableRow key={equipamento.id}>
                          <TableCell className="font-mono text-sm">{equipamento.id}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {categorias.find(c => c.value === equipamento.categoria)?.label}
                            </Badge>
                          </TableCell>
                          <TableCell>{equipamento.fabricante}</TableCell>
                          <TableCell className="font-medium">{equipamento.modelo}</TableCell>
                          <TableCell>{equipamento.potencia}kW</TableCell>
                          <TableCell>R$ {equipamento.precoUnitario.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {equipamento.estoqueDisponivel < 10 && (
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              )}
                              <span className={equipamento.estoqueDisponivel < 10 ? "text-destructive font-medium" : ""}>
                                {equipamento.estoqueDisponivel}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={equipamento.ativo ? "default" : "secondary"}>
                              {equipamento.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => abrirModal(equipamento)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => excluirEquipamento(equipamento.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Modal de Cadastro/Edição */}
            <Dialog open={modalAberto} onOpenChange={setModalAberto}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {equipamentoEditando ? "Editar Equipamento" : "Adicionar Equipamento"}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Campos Básicos */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="categoria">Categoria *</Label>
                      <Select 
                        value={formData.categoria} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="fabricante">Fabricante *</Label>
                      <Input
                        id="fabricante"
                        value={formData.fabricante || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, fabricante: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="modelo">Modelo *</Label>
                      <Input
                        id="modelo"
                        value={formData.modelo || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, modelo: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="potencia">Potência (kW) *</Label>
                      <Input
                        id="potencia"
                        type="number"
                        step="0.1"
                        value={formData.potencia || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, potencia: parseFloat(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="tensao">Tensão (V)</Label>
                      <Input
                        id="tensao"
                        type="number"
                        value={formData.tensao || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, tensao: parseFloat(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="corrente">Corrente (A)</Label>
                      <Input
                        id="corrente"
                        type="number"
                        step="0.1"
                        value={formData.corrente || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, corrente: parseFloat(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="frequencia">Frequência (Hz)</Label>
                      <Input
                        id="frequencia"
                        type="number"
                        value={formData.frequencia || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, frequencia: parseFloat(e.target.value) }))}
                      />
                    </div>
                  </div>

                  {/* Campos Específicos por Categoria */}
                  {renderCamposEspecificos()}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="peso">Peso (kg)</Label>
                      <Input
                        id="peso"
                        type="number"
                        step="0.1"
                        value={formData.peso || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, peso: parseFloat(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="garantia">Garantia (anos)</Label>
                      <Input
                        id="garantia"
                        type="number"
                        value={formData.garantia || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, garantia: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="precoUnitario">Preço Unitário (R$)</Label>
                      <Input
                        id="precoUnitario"
                        type="number"
                        step="0.01"
                        value={formData.precoUnitario || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, precoUnitario: parseFloat(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="estoqueDisponivel">Estoque Disponível</Label>
                      <Input
                        id="estoqueDisponivel"
                        type="number"
                        value={formData.estoqueDisponivel || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, estoqueDisponivel: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dimensoes">Dimensões (JSON)</Label>
                    <Textarea
                      id="dimensoes"
                      placeholder='{"largura": 1.0, "altura": 2.0, "profundidade": 0.04}'
                      value={JSON.stringify(formData.dimensoes, null, 2)}
                      onChange={(e) => {
                        try {
                          const dimensoes = JSON.parse(e.target.value);
                          setFormData(prev => ({ ...prev, dimensoes }));
                        } catch (error) {
                          // Ignore JSON parsing errors while typing
                        }
                      }}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ativo"
                      checked={formData.ativo}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked as boolean }))}
                    />
                    <Label htmlFor="ativo">Equipamento ativo</Label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setModalAberto(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={salvarEquipamento}>
                      {equipamentoEditando ? "Atualizar" : "Adicionar"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}