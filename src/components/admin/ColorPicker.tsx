import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { Palette, Pipette } from 'lucide-react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  presets?: { name: string; value: string; }[];
}

const defaultPresets = [
  { name: 'Primário', value: 'hsl(var(--primary))' },
  { name: 'Secundário', value: 'hsl(var(--secondary))' },
  { name: 'Accent', value: 'hsl(var(--accent))' },
  { name: 'Success', value: 'hsl(var(--success))' },
  { name: 'Warning', value: 'hsl(var(--warning))' },
  { name: 'Destructive', value: 'hsl(var(--destructive))' },
  { name: 'Branco', value: '#ffffff' },
  { name: 'Preto', value: '#000000' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Vermelho', value: '#ef4444' },
  { name: 'Amarelo', value: '#f59e0b' },
  { name: 'Roxo', value: '#8b5cf6' },
  { name: 'Rosa', value: '#ec4899' },
];

export function ColorPicker({ label, value, onChange, presets = defaultPresets }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setCustomColor(color);
    setIsOpen(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    onChange(newColor);
  };

  const getDisplayColor = () => {
    if (value.startsWith('hsl(var(--')) {
      return 'hsl(var(--primary))'; // Fallback para visualização
    }
    return value || '#000000';
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <div 
              className="w-4 h-4 rounded mr-2 border"
              style={{ backgroundColor: getDisplayColor() }}
            />
            <Palette className="h-4 w-4 mr-2" />
            {value || 'Selecionar cor'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label className="text-sm font-medium">Cores do Sistema</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {presets.filter(preset => preset.value.startsWith('hsl(var(')).map((preset) => (
                    <button
                      key={preset.name}
                      className="h-8 rounded border hover:scale-105 transition-transform"
                      style={{ backgroundColor: preset.value }}
                      onClick={() => handleColorSelect(preset.value)}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Cores Personalizadas</Label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {presets.filter(preset => !preset.value.startsWith('hsl(var(')).map((preset) => (
                    <button
                      key={preset.name}
                      className="h-8 rounded border hover:scale-105 transition-transform"
                      style={{ backgroundColor: preset.value }}
                      onClick={() => handleColorSelect(preset.value)}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Cor Customizada</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={customColor.startsWith('#') ? customColor : '#000000'}
                    onChange={handleCustomColorChange}
                    className="w-12 h-8 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      onChange(e.target.value);
                    }}
                    placeholder="#000000 ou hsl(0, 0%, 0%)"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                💡 Use cores do sistema (hsl(var(--primary))) para manter consistência com o tema
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}