import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from './ColorPicker';
import { Palette, Type, Layout, Move } from 'lucide-react';

interface StyleEditorProps {
  estilos: any;
  onUpdate: (propriedade: string, valor: any) => void;
  tipoProposta: string;
}

export function StyleEditor({ estilos, onUpdate, tipoProposta }: StyleEditorProps) {
  const handleSliderChange = (propriedade: string, valor: number[]) => {
    onUpdate(propriedade, valor[0]);
  };

  return (
    <div className="space-y-4">
      {/* Cores e Gradientes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Cores e Gradientes
          </CardTitle>
          <CardDescription>
            Personalize as cores principais do layout
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ColorPicker
              label="Cor Primária"
              value={estilos.corPrimaria || ''}
              onChange={(value) => onUpdate('corPrimaria', value)}
            />
            
            <ColorPicker
              label="Cor Secundária"
              value={estilos.corSecundaria || ''}
              onChange={(value) => onUpdate('corSecundaria', value)}
            />
            
            <ColorPicker
              label="Cor de Fundo"
              value={estilos.corFundo || ''}
              onChange={(value) => onUpdate('corFundo', value)}
            />
            
            <ColorPicker
              label="Cor do Texto"
              value={estilos.corTexto || ''}
              onChange={(value) => onUpdate('corTexto', value)}
            />
          </div>

          <Separator />
          
          <div>
            <Label className="text-sm font-medium">Gradiente de Fundo</Label>
            <Select 
              value={estilos.gradienteFundo || 'none'} 
              onValueChange={(value) => onUpdate('gradienteFundo', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem gradiente</SelectItem>
                <SelectItem value="linear-primary">Linear Primário</SelectItem>
                <SelectItem value="linear-secondary">Linear Secundário</SelectItem>
                <SelectItem value="radial-primary">Radial Primário</SelectItem>
                <SelectItem value="sunset">Por do Sol</SelectItem>
                <SelectItem value="ocean">Oceano</SelectItem>
                <SelectItem value="forest">Floresta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tipografia */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Type className="h-5 w-5" />
            Tipografia
          </CardTitle>
          <CardDescription>
            Configure fontes, tamanhos e estilos de texto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fonte Principal</Label>
              <Select 
                value={estilos.fontePrincipal || 'inter'} 
                onValueChange={(value) => onUpdate('fontePrincipal', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inter">Inter (Moderna)</SelectItem>
                  <SelectItem value="roboto">Roboto (Limpa)</SelectItem>
                  <SelectItem value="opensans">Open Sans (Legível)</SelectItem>
                  <SelectItem value="montserrat">Montserrat (Elegante)</SelectItem>
                  <SelectItem value="poppins">Poppins (Amigável)</SelectItem>
                  <SelectItem value="playfair">Playfair (Clássica)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Peso da Fonte</Label>
              <Select 
                value={estilos.pesoFonte || 'normal'} 
                onValueChange={(value) => onUpdate('pesoFonte', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Leve (300)</SelectItem>
                  <SelectItem value="normal">Normal (400)</SelectItem>
                  <SelectItem value="medium">Médio (500)</SelectItem>
                  <SelectItem value="semibold">Semi-negrito (600)</SelectItem>
                  <SelectItem value="bold">Negrito (700)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Tamanho Título (px)</Label>
              <div className="mt-2">
                <Slider
                  value={[estilos.tamanhoTitulo || 32]}
                  onValueChange={(value) => handleSliderChange('tamanhoTitulo', value)}
                  max={64}
                  min={16}
                  step={2}
                  className="w-full"
                />
                <div className="text-center text-sm text-muted-foreground mt-1">
                  {estilos.tamanhoTitulo || 32}px
                </div>
              </div>
            </div>

            <div>
              <Label>Tamanho Subtítulo (px)</Label>
              <div className="mt-2">
                <Slider
                  value={[estilos.tamanhoSubtitulo || 20]}
                  onValueChange={(value) => handleSliderChange('tamanhoSubtitulo', value)}
                  max={32}
                  min={12}
                  step={1}
                  className="w-full"
                />
                <div className="text-center text-sm text-muted-foreground mt-1">
                  {estilos.tamanhoSubtitulo || 20}px
                </div>
              </div>
            </div>

            <div>
              <Label>Tamanho Texto (px)</Label>
              <div className="mt-2">
                <Slider
                  value={[estilos.tamanhoTexto || 16]}
                  onValueChange={(value) => handleSliderChange('tamanhoTexto', value)}
                  max={24}
                  min={12}
                  step={1}
                  className="w-full"
                />
                <div className="text-center text-sm text-muted-foreground mt-1">
                  {estilos.tamanhoTexto || 16}px
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Espaçamentos e Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Move className="h-5 w-5" />
            Espaçamentos e Layout
          </CardTitle>
          <CardDescription>
            Ajuste margens, espaçamentos e estrutura
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Espaçamento Entre Seções (px)</Label>
              <div className="mt-2">
                <Slider
                  value={[estilos.espacamentoSecoes || 64]}
                  onValueChange={(value) => handleSliderChange('espacamentoSecoes', value)}
                  max={128}
                  min={16}
                  step={8}
                  className="w-full"
                />
                <div className="text-center text-sm text-muted-foreground mt-1">
                  {estilos.espacamentoSecoes || 64}px
                </div>
              </div>
            </div>

            <div>
              <Label>Espaçamento Interno (px)</Label>
              <div className="mt-2">
                <Slider
                  value={[estilos.espacamentoInterno || 24]}
                  onValueChange={(value) => handleSliderChange('espacamentoInterno', value)}
                  max={64}
                  min={8}
                  step={4}
                  className="w-full"
                />
                <div className="text-center text-sm text-muted-foreground mt-1">
                  {estilos.espacamentoInterno || 24}px
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Largura Máxima</Label>
              <Select 
                value={estilos.larguraMaxima || 'container'} 
                onValueChange={(value) => onUpdate('larguraMaxima', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Largura Total</SelectItem>
                  <SelectItem value="container">Container Padrão</SelectItem>
                  <SelectItem value="narrow">Estreito</SelectItem>
                  <SelectItem value="wide">Largo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Bordas</Label>
              <Select 
                value={estilos.estiloBorda || 'rounded'} 
                onValueChange={(value) => onUpdate('estiloBorda', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem bordas</SelectItem>
                  <SelectItem value="rounded">Arredondado</SelectItem>
                  <SelectItem value="rounded-lg">Muito arredondado</SelectItem>
                  <SelectItem value="square">Quadrado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Sombras</Label>
              <Select 
                value={estilos.estiloSombra || 'soft'} 
                onValueChange={(value) => onUpdate('estiloSombra', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem sombras</SelectItem>
                  <SelectItem value="soft">Suave</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="strong">Forte</SelectItem>
                  <SelectItem value="glow">Brilho</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões e Interações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Botões e CTAs
          </CardTitle>
          <CardDescription>
            Personalize a aparência dos botões de ação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ColorPicker
              label="Cor Botão Primário"
              value={estilos.corBotaoPrimario || ''}
              onChange={(value) => onUpdate('corBotaoPrimario', value)}
            />
            
            <ColorPicker
              label="Cor Botão Secundário"
              value={estilos.corBotaoSecundario || ''}
              onChange={(value) => onUpdate('corBotaoSecundario', value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Tamanho dos Botões</Label>
              <Select 
                value={estilos.tamanhoBotao || 'default'} 
                onValueChange={(value) => onUpdate('tamanhoBotao', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">Pequeno</SelectItem>
                  <SelectItem value="default">Padrão</SelectItem>
                  <SelectItem value="lg">Grande</SelectItem>
                  <SelectItem value="xl">Extra Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Estilo dos Botões</Label>
              <Select 
                value={estilos.estiloBotao || 'default'} 
                onValueChange={(value) => onUpdate('estiloBotao', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Padrão</SelectItem>
                  <SelectItem value="outline">Contorno</SelectItem>
                  <SelectItem value="ghost">Fantasma</SelectItem>
                  <SelectItem value="gradient">Gradiente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Animação Hover</Label>
              <Select 
                value={estilos.animacaoHover || 'scale'} 
                onValueChange={(value) => onUpdate('animacaoHover', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem animação</SelectItem>
                  <SelectItem value="scale">Escala</SelectItem>
                  <SelectItem value="glow">Brilho</SelectItem>
                  <SelectItem value="lift">Elevação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}