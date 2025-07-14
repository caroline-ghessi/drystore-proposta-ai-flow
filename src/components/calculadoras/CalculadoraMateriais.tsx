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
  const [activeTab, setActiveTab] = useState('telhas');

  const calculadoras = [
    {
      id: 'telhas',
      title: 'Telhas Shingle',
      description: 'Sistema completo de cobertura',
      icon: Home,
      color: 'bg-blue-500',
      component: CalculadoraTelhas
    },
    {
      id: 'divisorias',
      title: 'Drywall',
      description: 'Divisórias em gesso acartonado',
      icon: Layers,
      color: 'bg-green-500',
      component: CalculadoraDivisorias
    },
    {
      id: 'impermeabilizacao',
      title: 'Impermeabilização',
      description: 'Sistemas de impermeabilização',
      icon: Shield,
      color: 'bg-purple-500',
      component: CalculadoraImpermeabilizacao
    },
    {
      id: 'forros',
      title: 'Forros',
      description: 'Forros PVC e Gesso',
      icon: Package,
      color: 'bg-orange-500',
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

      {/* Tabs das Calculadoras */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Lista de Tabs */}
        <TabsList className="grid w-full grid-cols-4 mb-8">
          {calculadoras.map((calc) => (
            <TabsTrigger
              key={calc.id}
              value={calc.id}
              className="flex flex-col items-center gap-2 py-4 h-auto"
            >
              <div className={`p-2 rounded-lg ${calc.color} text-white`}>
                <calc.icon className="w-5 h-5" />
              </div>
              <div className="text-center">
                <div className="font-medium">{calc.title}</div>
                <div className="text-xs text-muted-foreground hidden sm:block">
                  {calc.description}
                </div>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Preview Cards (visível quando nenhuma tab está ativa) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {calculadoras.map((calc) => (
            <Card 
              key={calc.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                activeTab === calc.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setActiveTab(calc.id)}
            >
              <CardHeader className="text-center pb-3">
                <div className={`w-12 h-12 mx-auto rounded-lg ${calc.color} flex items-center justify-center text-white mb-2`}>
                  <calc.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg">{calc.title}</CardTitle>
                <CardDescription className="text-sm">
                  {calc.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="w-full justify-center">
                  {activeTab === calc.id ? 'Ativo' : 'Clique para acessar'}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Conteúdo das Tabs */}
        {calculadoras.map((calc) => (
          <TabsContent key={calc.id} value={calc.id} className="mt-0">
            <calc.component />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};