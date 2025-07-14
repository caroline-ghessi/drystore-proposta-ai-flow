import { useMemo } from 'react';

// Definição das variáveis disponíveis por tipo de proposta
export const VARIAVEIS_GLOBAIS = [
  { key: '{cliente}', label: 'Nome do Cliente', description: 'Nome completo do cliente' },
  { key: '{numeroProposta}', label: 'Número da Proposta', description: 'ID único da proposta' },
  { key: '{dataProposta}', label: 'Data da Proposta', description: 'Data de criação formatada' },
  { key: '{valor_total}', label: 'Valor Total', description: 'Valor total formatado em moeda' },
  { key: '{tipoProduto}', label: 'Tipo de Produto', description: 'Categoria do produto/serviço' }
];

export const VARIAVEIS_POR_TIPO = {
  'energia-solar': [
    { key: '{potencia_kwp}', label: 'Potência (kWp)', description: 'Potência do sistema em quilowatts-pico' },
    { key: '{economia_percent}', label: 'Economia (%)', description: 'Percentual de economia na conta de luz' },
    { key: '{payback_anos}', label: 'Payback (anos)', description: 'Tempo de retorno do investimento' },
    { key: '{geracao_anual_kwh}', label: 'Geração Anual (kWh)', description: 'Energia gerada por ano' },
    { key: '{economia_anual}', label: 'Economia Anual (R$)', description: 'Valor economizado por ano' },
    { key: '{quantidade_paineis}', label: 'Quantidade de Painéis', description: 'Número total de painéis solares' },
    { key: '{area_ocupada}', label: 'Área Ocupada (m²)', description: 'Área necessária para instalação' }
  ],
  'telhas': [
    { key: '{areaTelhado}', label: 'Área do Telhado (m²)', description: 'Área total a ser coberta' },
    { key: '{qtdTelhas}', label: 'Quantidade de Telhas', description: 'Número de pacotes/unidades' },
    { key: '{corEscolhida}', label: 'Cor Escolhida', description: 'Cor selecionada para as telhas' },
    { key: '{resistenciaVento}', label: 'Resistência ao Vento', description: 'Resistência em km/h' },
    { key: '{garantia_anos}', label: 'Garantia (anos)', description: 'Período de garantia do produto' },
    { key: '{peso_total}', label: 'Peso Total (kg)', description: 'Peso total dos materiais' }
  ],
  'divisorias': [
    { key: '{area_parede}', label: 'Área da Parede (m²)', description: 'Área total das divisórias' },
    { key: '{tipo_parede}', label: 'Tipo de Parede', description: 'Especificação técnica da divisória' },
    { key: '{pe_direito}', label: 'Pé Direito (m)', description: 'Altura das divisórias' },
    { key: '{espessura}', label: 'Espessura (mm)', description: 'Espessura total da divisória' },
    { key: '{isolamento_acustico}', label: 'Isolamento Acústico', description: 'Nível de isolamento em dB' }
  ],
  'pisos': [
    { key: '{area_aplicacao}', label: 'Área de Aplicação (m²)', description: 'Área total do piso' },
    { key: '{tipo_piso}', label: 'Tipo de Piso', description: 'Material e especificação do piso' },
    { key: '{resistencia_abrasao}', label: 'Resistência à Abrasão', description: 'Classe de resistência PEI' },
    { key: '{espessura_mm}', label: 'Espessura (mm)', description: 'Espessura do revestimento' }
  ],
  'forros': [
    { key: '{area_forro}', label: 'Área do Forro (m²)', description: 'Área total do forro' },
    { key: '{tipo_forro}', label: 'Tipo de Forro', description: 'Material e especificação técnica' },
    { key: '{coeficiente_acustico}', label: 'Coeficiente Acústico', description: 'Índice de absorção sonora' },
    { key: '{resistencia_fogo}', label: 'Resistência ao Fogo', description: 'Classificação de resistência' }
  ],
  'impermeabilizacao': [
    { key: '{area_aplicacao}', label: 'Área de Aplicação (m²)', description: 'Área total a ser impermeabilizada' },
    { key: '{sistema_impermeabilizacao}', label: 'Sistema', description: 'Tipo de sistema de impermeabilização' },
    { key: '{numero_demaos}', label: 'Número de Demãos', description: 'Quantidade de camadas aplicadas' },
    { key: '{resistencia_agua}', label: 'Resistência à Água', description: 'Classificação de estanqueidade' }
  ]
};

export const useLayoutVariables = (tipoProposta?: string) => {
  const variaveisDisponiveis = useMemo(() => {
    const variaveis = [...VARIAVEIS_GLOBAIS];
    
    if (tipoProposta && VARIAVEIS_POR_TIPO[tipoProposta as keyof typeof VARIAVEIS_POR_TIPO]) {
      variaveis.push(...VARIAVEIS_POR_TIPO[tipoProposta as keyof typeof VARIAVEIS_POR_TIPO]);
    }
    
    return variaveis;
  }, [tipoProposta]);

  const detectarVariaveis = (texto: string): string[] => {
    const regex = /\{[^}]+\}/g;
    const matches = texto.match(regex) || [];
    return matches.filter(match => 
      variaveisDisponiveis.some(v => v.key === match)
    );
  };

  const validarVariaveis = (texto: string): { validas: string[], invalidas: string[] } => {
    const regex = /\{[^}]+\}/g;
    const matches = texto.match(regex) || [];
    const chavesValidas = variaveisDisponiveis.map(v => v.key);
    
    const validas = matches.filter(match => chavesValidas.includes(match));
    const invalidas = matches.filter(match => !chavesValidas.includes(match));
    
    return { validas, invalidas };
  };

  const formatarTextoComVariaveis = (texto: string): string => {
    const { validas, invalidas } = validarVariaveis(texto);
    
    let textoFormatado = texto;
    
    // Destacar variáveis válidas
    validas.forEach(variavel => {
      textoFormatado = textoFormatado.replace(
        new RegExp(escapeRegex(variavel), 'g'),
        `<span class="bg-blue-100 text-blue-800 px-1 rounded font-medium">${variavel}</span>`
      );
    });
    
    // Destacar variáveis inválidas
    invalidas.forEach(variavel => {
      textoFormatado = textoFormatado.replace(
        new RegExp(escapeRegex(variavel), 'g'),
        `<span class="bg-red-100 text-red-800 px-1 rounded font-medium">${variavel}</span>`
      );
    });
    
    return textoFormatado;
  };

  const substituirVariaveis = (texto: string, valores: Record<string, any>): string => {
    let textoSubstituido = texto;
    
    variaveisDisponiveis.forEach(variavel => {
      if (valores[variavel.key]) {
        textoSubstituido = textoSubstituido.replace(
          new RegExp(escapeRegex(variavel.key), 'g'),
          valores[variavel.key]
        );
      }
    });
    
    return textoSubstituido;
  };

  return {
    variaveisDisponiveis,
    detectarVariaveis,
    validarVariaveis,
    formatarTextoComVariaveis,
    substituirVariaveis
  };
};

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}