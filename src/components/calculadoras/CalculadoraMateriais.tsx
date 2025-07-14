import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Layers, 
  Shield, 
  Ruler,
  Package
} from 'lucide-react';
import { CalculadoraTelhas } from './CalculadoraTelhas';
import { CalculadoraDivisorias } from './CalculadoraDivisorias';
import { CalculadoraImpermeabilizacao } from './CalculadoraImpermeabilizacao';
import { CalculadoraForros } from './CalculadoraForros';

export const CalculadoraMateriais = () => {
  const [activeTab, setActiveTab] = useState('');

  const calculadoras = [
    {
      id: 'telhas',
      title: 'Telhas Shingle',
      description: 'Sistema completo de cobertura',
      icon: Home,
      color: 'hsl(var(--primary))',
      component: CalculadoraTelhas
    },
    {
      id: 'divisorias',
      title: 'Drywall',
      description: 'Divisórias em gesso acartonado',
      icon: Layers,
      color: 'hsl(var(--primary))',
      component: CalculadoraDivisorias
    },
    {
      id: 'impermeabilizacao',
      title: 'Impermeabilização',
      description: 'Sistemas de impermeabilização',
      icon: Shield,
      color: 'hsl(var(--primary))',
      component: CalculadoraImpermeabilizacao
    },
    {
      id: 'forros',
      title: 'Forros',
      description: 'Forros PVC e Gesso',
      icon: Package,
      color: 'hsl(var(--primary))',
      component: CalculadoraForros
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <Card className="p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Ruler className="w-8 h-8 text-primary" />
            Calculadoras de Materiais
          </h1>
          <p className="text-muted-foreground text-lg">
            Ferramentas rápidas para cálculo e orçamento de materiais de construção
          </p>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Se nenhuma tab está ativa, mostra preview cards */}
        {!activeTab ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {calculadoras.map((calc) => (
              <Card 
                key={calc.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 animate-fade-in"
                onClick={() => setActiveTab(calc.id)}
              >
                <CardHeader className="text-center pb-3">
                  <div 
                    className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center text-white mb-3"
                    style={{ backgroundColor: calc.color }}
                  >
                    <calc.icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-xl">{calc.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {calc.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="w-full justify-center">
                    Clique para acessar
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Lista de Tabs quando uma tab está ativa */}
            <TabsList className="grid w-full grid-cols-4 mb-8 h-auto">
              {calculadoras.map((calc) => (
                <TabsTrigger
                  key={calc.id}
                  value={calc.id}
                  className="flex flex-col items-center gap-2 py-4 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <calc.icon className="w-5 h-5" />
                  <div className="text-center">
                    <div className="font-medium text-sm">{calc.title}</div>
                    <div className="text-xs opacity-70 hidden sm:block">
                      {calc.description}
                    </div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Conteúdo das Tabs */}
            {calculadoras.map((calc) => (
              <TabsContent key={calc.id} value={calc.id} className="mt-0 animate-fade-in">
                <calc.component />
              </TabsContent>
            ))}
          </>
        )}
      </Tabs>
    </div>
  );
};