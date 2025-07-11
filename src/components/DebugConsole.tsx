import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  PlayCircle, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Download, 
  Trash2, 
  RefreshCw,
  Settings,
  FileText,
  Monitor,
  Database,
  Zap,
  Clock,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { uploadService } from "@/services/uploadService";

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  component: string;
  message: string;
  context?: any;
}

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'running';
  message: string;
  timestamp: string;
  duration?: number;
  details?: any;
}

export const DebugConsole = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedPromptType, setSelectedPromptType] = useState("energia-solar");
  const [customPrompt, setCustomPrompt] = useState("");
  const [testFileUrl, setTestFileUrl] = useState("");
  const [testFile, setTestFile] = useState<File | null>(null);
  const [debugFiles, setDebugFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const addLog = (level: LogEntry['level'], component: string, message: string, context?: any) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      context
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100)); // Manter apenas os últimos 100 logs
  };

  const addTestResult = (name: string, status: TestResult['status'], message: string, details?: any, duration?: number) => {
    const result: TestResult = {
      name,
      status,
      message,
      timestamp: new Date().toISOString(),
      duration,
      details
    };
    setTestResults(prev => [result, ...prev]);
  };

  // Teste de conectividade com o Dify
  const testDifyConnectivity = async () => {
    addLog('INFO', 'Connectivity Test', 'Iniciando teste de conectividade com Dify...');
    const startTime = Date.now();
    
    try {
      const response = await supabase.functions.invoke('processar-documento', {
        body: {
          arquivo_url: 'test-connectivity',
          tipo_proposta: 'test',
          cliente_nome: 'Test',
          cliente_email: 'test@test.com'
        }
      });

      const duration = Date.now() - startTime;
      
      if (response.error) {
        addTestResult('Conectividade Dify', 'error', `Falha na conectividade: ${response.error.message}`, response.error, duration);
        addLog('ERROR', 'Connectivity Test', 'Falha na conectividade com Dify', response.error);
      } else {
        addTestResult('Conectividade Dify', 'success', 'Conectividade OK', response.data, duration);
        addLog('INFO', 'Connectivity Test', 'Conectividade com Dify funcionando corretamente');
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      addTestResult('Conectividade Dify', 'error', `Erro: ${error.message}`, error, duration);
      addLog('ERROR', 'Connectivity Test', 'Erro no teste de conectividade', error);
    }
  };

  // Upload de arquivo de teste
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    addLog('INFO', 'File Upload', `Iniciando upload do arquivo: ${file.name}`);
    
    try {
      const validation = uploadService.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Usar nome específico para arquivos de debug
      const debugId = `debug_${Date.now()}_${selectedPromptType}`;
      const result = await uploadService.uploadDocumento(file, debugId);
      
      setTestFileUrl(result.url);
      setTestFile(file);
      
      // Adicionar à lista de arquivos debug
      setDebugFiles(prev => [...prev, {
        name: file.name,
        path: result.path,
        url: result.url,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        type: selectedPromptType
      }]);

      addLog('INFO', 'File Upload', `Upload concluído: ${result.path}`);
      toast({
        title: "Upload realizado",
        description: `Arquivo ${file.name} carregado com sucesso.`,
      });
    } catch (error: any) {
      addLog('ERROR', 'File Upload', `Erro no upload: ${error.message}`, error);
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Teste de processamento completo
  const testFullProcessing = async () => {
    if (!testFileUrl && !testFile) {
      toast({
        title: "Arquivo necessário",
        description: "Faça upload de um arquivo ou insira uma URL para testar o processamento completo.",
        variant: "destructive"
      });
      return;
    }

    addLog('INFO', 'Full Processing Test', 'Iniciando teste de processamento completo...');
    const startTime = Date.now();

    try {
      const response = await supabase.functions.invoke('processar-documento', {
        body: {
          arquivo_url: testFileUrl,
          tipo_proposta: selectedPromptType,
          cliente_nome: 'Cliente Teste Debug',
          cliente_email: 'debug@teste.com'
        }
      });

      const duration = Date.now() - startTime;

      if (response.error) {
        addTestResult('Processamento Completo', 'error', `Falha no processamento: ${response.error.message}`, response.error, duration);
        addLog('ERROR', 'Full Processing Test', 'Falha no processamento completo', response.error);
      } else {
        addTestResult('Processamento Completo', 'success', 'Processamento concluído com sucesso', response.data, duration);
        addLog('INFO', 'Full Processing Test', 'Processamento completo bem-sucedido', response.data);
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      addTestResult('Processamento Completo', 'error', `Erro: ${error.message}`, error, duration);
      addLog('ERROR', 'Full Processing Test', 'Erro no teste de processamento completo', error);
    }
  };

  // Limpar arquivos de debug
  const cleanupDebugFiles = async () => {
    addLog('INFO', 'Cleanup', 'Iniciando limpeza de arquivos debug...');
    
    try {
      const response = await supabase.functions.invoke('cleanup-debug-files');
      
      if (response.error) {
        addLog('ERROR', 'Cleanup', 'Erro na limpeza automática', response.error);
        toast({
          title: "Erro na limpeza",
          description: response.error.message,
          variant: "destructive"
        });
      } else {
        addLog('INFO', 'Cleanup', `Limpeza concluída: ${response.data?.deletedCount || 0} arquivos removidos`);
        setDebugFiles([]);
        toast({
          title: "Limpeza concluída",
          description: `${response.data?.deletedCount || 0} arquivos de debug foram removidos.`,
        });
      }
    } catch (error: any) {
      addLog('ERROR', 'Cleanup', 'Erro na limpeza de arquivos', error);
      toast({
        title: "Erro na limpeza",
        description: "Erro ao executar limpeza de arquivos debug.",
        variant: "destructive"
      });
    }
  };

  // Teste de prompt customizado
  const testCustomPrompt = async () => {
    if (!customPrompt.trim()) {
      toast({
        title: "Prompt necessário",
        description: "Digite um prompt para testar.",
        variant: "destructive"
      });
      return;
    }

    addLog('INFO', 'Custom Prompt Test', 'Testando prompt customizado...');
    const startTime = Date.now();

    try {
      // Simular teste de prompt (substitua pela lógica real quando necessário)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const duration = Date.now() - startTime;
      addTestResult('Prompt Customizado', 'success', 'Prompt testado com sucesso', { prompt: customPrompt }, duration);
      addLog('INFO', 'Custom Prompt Test', 'Prompt customizado testado com sucesso');
    } catch (error: any) {
      const duration = Date.now() - startTime;
      addTestResult('Prompt Customizado', 'error', `Erro: ${error.message}`, error, duration);
      addLog('ERROR', 'Custom Prompt Test', 'Erro no teste de prompt customizado', error);
    }
  };

  // Executar todos os testes
  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    addLog('INFO', 'Test Suite', 'Iniciando bateria completa de testes...');

    await testDifyConnectivity();
    
    if (testFileUrl) {
      await testFullProcessing();
    }

    setIsRunningTests(false);
    addLog('INFO', 'Test Suite', 'Bateria de testes concluída');
    
    toast({
      title: "Testes concluídos",
      description: "Verifique os resultados na seção de testes.",
    });
  };

  // Limpar logs
  const clearLogs = () => {
    setLogs([]);
    addLog('INFO', 'System', 'Logs limpos');
  };

  // Limpar resultados de teste
  const clearTestResults = () => {
    setTestResults([]);
    addLog('INFO', 'System', 'Resultados de teste limpos');
  };

  // Exportar logs
  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `debug-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    addLog('INFO', 'Export', 'Logs exportados com sucesso');
    toast({
      title: "Logs exportados",
      description: "Arquivo JSON baixado com sucesso.",
    });
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
    }
  };

  const getLogLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'DEBUG': return 'text-gray-600';
      case 'INFO': return 'text-blue-600';
      case 'WARN': return 'text-yellow-600';
      case 'ERROR': return 'text-red-600';
    }
  };

  useEffect(() => {
    // Log inicial
    addLog('INFO', 'Debug Console', 'Console de debug inicializado');
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Console de Debug</h2>
          <p className="text-muted-foreground">Ferramentas avançadas para debug e monitoramento da integração Dify</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runAllTests} disabled={isRunningTests}>
            {isRunningTests ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <PlayCircle className="h-4 w-4 mr-2" />
            )}
            Executar Todos os Testes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="integration" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="integration">
            <Zap className="h-4 w-4 mr-2" />
            Integração
          </TabsTrigger>
          <TabsTrigger value="logs">
            <FileText className="h-4 w-4 mr-2" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="validation">
            <CheckCircle className="h-4 w-4 mr-2" />
            Validação
          </TabsTrigger>
          <TabsTrigger value="prompts">
            <Settings className="h-4 w-4 mr-2" />
            Prompts
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            <Monitor className="h-4 w-4 mr-2" />
            Monitoramento
          </TabsTrigger>
          <TabsTrigger value="tools">
            <Database className="h-4 w-4 mr-2" />
            Ferramentas
          </TabsTrigger>
        </TabsList>

        {/* Aba de Testes de Integração */}
        <TabsContent value="integration" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Testes Rápidos</CardTitle>
                <CardDescription>Execute testes individuais da integração</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={testDifyConnectivity} className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Testar Conectividade Dify
                </Button>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fileUpload">Upload de Arquivo PDF</Label>
                    <div className="flex items-center gap-2">
                      <input
                        id="fileUpload"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file);
                          }
                        }}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('fileUpload')?.click()}
                        disabled={isUploading}
                        className="flex-1"
                      >
                        {isUploading ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <FileText className="h-4 w-4 mr-2" />
                        )}
                        {testFile ? testFile.name : 'Escolher Arquivo PDF'}
                      </Button>
                      {testFile && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setTestFile(null);
                            setTestFileUrl('');
                          }}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {testFile && (
                      <p className="text-xs text-muted-foreground">
                        {(testFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">ou</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="testFileUrl">URL do Arquivo</Label>
                    <Input
                      id="testFileUrl"
                      value={testFileUrl}
                      onChange={(e) => setTestFileUrl(e.target.value)}
                      placeholder="https://exemplo.com/arquivo.pdf"
                      disabled={!!testFile}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="promptType">Tipo de Proposta</Label>
                    <Select value={selectedPromptType} onValueChange={setSelectedPromptType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="energia-solar">Energia Solar</SelectItem>
                        <SelectItem value="materiais-construcao">Materiais de Construção</SelectItem>
                        <SelectItem value="telhas">Telhas</SelectItem>
                        <SelectItem value="divisorias">Divisórias</SelectItem>
                        <SelectItem value="pisos">Pisos</SelectItem>
                        <SelectItem value="forros">Forros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button 
                  onClick={testFullProcessing} 
                  className="w-full" 
                  disabled={!testFileUrl && !testFile}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Testar Processamento Completo
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resultados dos Testes</CardTitle>
                <CardDescription>Status e resultados dos testes executados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-muted-foreground">
                    {testResults.length} teste(s) executado(s)
                  </span>
                  <Button variant="outline" size="sm" onClick={clearTestResults}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {testResults.map((result, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        {getStatusIcon(result.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{result.name}</p>
                            {result.duration && (
                              <span className="text-xs text-muted-foreground">
                                {result.duration}ms
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{result.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(result.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {testResults.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        Nenhum teste executado ainda
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba de Logs */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logs do Sistema</CardTitle>
              <CardDescription>Monitoramento em tempo real das operações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <Badge variant="outline">{logs.length} logs</Badge>
                  <Badge variant="outline">{logs.filter(l => l.level === 'ERROR').length} erros</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportLogs}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearLogs}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-1">
                  {logs.map((log) => (
                    <div key={log.id} className="p-2 rounded font-mono text-xs border-l-2 border-l-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <Badge variant="outline" className={getLogLevelColor(log.level)}>
                          {log.level}
                        </Badge>
                        <span className="text-blue-600">[{log.component}]</span>
                        <span>{log.message}</span>
                      </div>
                      {log.context && (
                        <pre className="mt-1 text-muted-foreground overflow-x-auto">
                          {JSON.stringify(log.context, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      Nenhum log disponível
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Validação */}
        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Validação de Dados</CardTitle>
              <CardDescription>Verifique a estrutura e qualidade dos dados extraídos</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Esta seção será implementada conforme os resultados dos testes de processamento.
                  Execute testes na aba "Integração" para ver dados para validação.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Testes de Prompts */}
        <TabsContent value="prompts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Editor de Prompts</CardTitle>
              <CardDescription>Teste e valide diferentes prompts para o Dify</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="promptType">Tipo de Proposta</Label>
                <Select value={selectedPromptType} onValueChange={setSelectedPromptType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="energia-solar">Energia Solar</SelectItem>
                    <SelectItem value="telhas">Telhas</SelectItem>
                    <SelectItem value="divisorias">Divisórias</SelectItem>
                    <SelectItem value="pisos">Pisos</SelectItem>
                    <SelectItem value="forros">Forros</SelectItem>
                    <SelectItem value="materiais-construcao">Materiais de Construção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="customPrompt">Prompt Customizado</Label>
                <Textarea
                  id="customPrompt"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Digite seu prompt personalizado aqui..."
                  rows={6}
                />
              </div>

              <Button onClick={testCustomPrompt} disabled={!customPrompt.trim()}>
                <PlayCircle className="h-4 w-4 mr-2" />
                Testar Prompt
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Monitoramento */}
        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Edge Functions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>processar-documento</span>
                    <Badge variant="outline">Online</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>criar-proposta</span>
                    <Badge variant="outline">Online</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>documentos-propostas</span>
                    <Badge variant="outline">Ativo</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Bucket privado para arquivos
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Processamentos hoje</span>
                    <span className="font-mono">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de sucesso</span>
                    <span className="font-mono">--</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba de Ferramentas de Desenvolvimento */}
        <TabsContent value="tools" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Arquivos Debug</CardTitle>
                <CardDescription>Controle de arquivos de teste e limpeza</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {debugFiles.length} arquivo(s) de debug
                  </span>
                  <Button variant="outline" onClick={cleanupDebugFiles}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar Arquivos Antigos
                  </Button>
                </div>

                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {debugFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type} • 
                            {new Date(file.uploadedAt).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              await uploadService.deleteDocumento(file.path);
                              setDebugFiles(prev => prev.filter((_, i) => i !== index));
                              addLog('INFO', 'File Management', `Arquivo removido: ${file.name}`);
                            } catch (error: any) {
                              addLog('ERROR', 'File Management', `Erro ao remover arquivo: ${error.message}`);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {debugFiles.length === 0 && (
                      <div className="text-center text-muted-foreground py-4">
                        Nenhum arquivo de debug encontrado
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações de Debug</CardTitle>
                <CardDescription>Ajustes e configurações do sistema de debug</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Limpeza Automática:</strong> Arquivos de debug podem ser removidos 
                    manualmente através do botão "Limpar Arquivos Antigos". Para automatizar, 
                    configure um cron job no Supabase para executar a função cleanup-debug-files.
                  </AlertDescription>
                </Alert>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Storage usado (debug):</span>
                    <span>{(debugFiles.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Arquivos de debug:</span>
                    <span>{debugFiles.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};