import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Variable, Plus, AlertTriangle, Info } from 'lucide-react';
import { useLayoutVariables } from '@/hooks/useLayoutVariables';

interface VariableProtectedEditorProps {
  value: string;
  onChange: (value: string) => void;
  tipoProposta?: string;
  placeholder?: string;
  multiline?: boolean;
  label?: string;
  description?: string;
}

export function VariableProtectedEditor({
  value,
  onChange,
  tipoProposta,
  placeholder,
  multiline = false,
  label,
  description
}: VariableProtectedEditorProps) {
  const { variaveisDisponiveis, validarVariaveis, formatarTextoComVariaveis } = useLayoutVariables(tipoProposta);
  const [showVariables, setShowVariables] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const { validas, invalidas } = validarVariaveis(value);
  const hasInvalidVariables = invalidas.length > 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
  };

  const inserirVariavel = (variavel: string) => {
    if (inputRef.current) {
      const start = inputRef.current.selectionStart || 0;
      const end = inputRef.current.selectionEnd || 0;
      const newValue = value.substring(0, start) + variavel + value.substring(end);
      onChange(newValue);
      
      // Reposicionar cursor após a variável inserida
      setTimeout(() => {
        if (inputRef.current) {
          const newPosition = start + variavel.length;
          inputRef.current.setSelectionRange(newPosition, newPosition);
          inputRef.current.focus();
        }
      }, 0);
    }
    setShowVariables(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Atalho Ctrl+Space para abrir lista de variáveis
    if (e.ctrlKey && e.code === 'Space') {
      e.preventDefault();
      setShowVariables(true);
    }
  };

  const renderPreview = () => {
    if (!value) return null;
    
    return (
      <div className="mt-2 p-3 bg-muted/30 rounded-lg border-l-4 border-primary">
        <div className="text-sm font-medium mb-1">Preview:</div>
        <div 
          className="text-sm"
          dangerouslySetInnerHTML={{ __html: formatarTextoComVariaveis(value) }}
        />
      </div>
    );
  };

  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
          <Popover open={showVariables} onOpenChange={setShowVariables}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Variable className="h-4 w-4 mr-1" />
                Variáveis
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <Card className="border-0 shadow-none">
                <CardHeader className="p-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Variable className="h-4 w-4" />
                    Variáveis Disponíveis
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Clique para inserir ou use Ctrl+Space
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0 max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {variaveisDisponiveis.map((variavel) => (
                      <div
                        key={variavel.key}
                        className="p-2 rounded-lg border hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => inserirVariavel(variavel.key)}
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="font-mono text-xs">
                            {variavel.key}
                          </Badge>
                          <Plus className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <div className="text-xs font-medium mt-1">{variavel.label}</div>
                        <div className="text-xs text-muted-foreground">{variavel.description}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </PopoverContent>
          </Popover>
        </div>
      )}
      
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <div className="relative">
        <InputComponent
          ref={inputRef as any}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={hasInvalidVariables ? "border-destructive" : ""}
          rows={multiline ? 4 : undefined}
        />
        
        {/* Indicador de variáveis */}
        {(validas.length > 0 || invalidas.length > 0) && (
          <div className="absolute right-2 top-2 flex gap-1">
            {validas.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                <Variable className="h-3 w-3 mr-1" />
                {validas.length}
              </Badge>
            )}
            {invalidas.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {invalidas.length}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Alertas de variáveis inválidas */}
      {hasInvalidVariables && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-destructive">Variáveis inválidas encontradas:</div>
            <div className="text-destructive/80 mt-1">
              {invalidas.join(', ')} - Essas variáveis não estão disponíveis para este tipo de proposta.
            </div>
          </div>
        </div>
      )}

      {/* Preview do texto com variáveis destacadas */}
      {renderPreview()}

      {/* Dica de uso */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Info className="h-3 w-3" />
        <span>Use Ctrl+Space para inserir variáveis ou clique no botão "Variáveis"</span>
      </div>
    </div>
  );
}