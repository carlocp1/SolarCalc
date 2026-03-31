// Este módulo implementa os principais operações da calculadora.

const tarifasEstaduais = {
  AM: 0.852,
  SP: 0.730,
  RJ: 0.865,
};

const irradiaçaoPorEstado = {
  AM: 5.5,
  SP: 5.4,
  RJ: 5.1,
};

// Apenas para exemplificar o uso desta calculadora, os cálculos tem base
// em dois modelos de painel da Canadian. Um de 550W e outro de 435W.
// Links:
// https://www.minhacasasolar.com.br/painel-solar-550w-monocristalino-half-cell-canadian-cs6w-550ms-82127
// https://www.minhacasasolar.com.br/painel-solar-canadian-monocristalino-435w-half-cell-cs6r-435t-82327
// (Isto não é uma propaganda.)
// potência -> W
// área     -> m²
const paineis = [
  {potencia: 550, area: 1.95},
  {potencia: 435, area: 2.56},
];
  

// Converte o gasto (em dinheiro) em gasto energético em kW/h.
// Gasto kW/h = Gasto em R$ / tarifa estadual de energia.
function calcularGastoKWH(gastoMensalReais, siglaEstadual){
  const tarifaEstadual = tarifasEstaduais[siglaEstadual];
  return Math.round(gastoMensalReais / tarifaEstadual);
}

// Calcula a potência necessária de um sistema de painéis solares para suprir
// o gasto de energia atual.
// Potência (kWp) = Consumo Mensal (kWh) / (irradiação diária x 30 x perdas)
// 
// * Irradiação solar é a quantidade de energia solar que atinge um metro quadrado 
//   por dia, medido em kWh/m2/dia.
// * Por padrão, o valor de perda utilizado nesses calculos é de 25%, restando
//   apenas 75%.
function calcularPotNecessaria(gastoMensalKWH, siglaEstadual) {
  const irradiaçao = irradiaçaoPorEstado[siglaEstadual];
  // Consideração de perda do sistema.
  const perda = 0.75;
  return gastoMensalKWH / (irradiaçao * 30 * perda);
}

// Calcula a quantidade de painéis solares necessários para suprir o sistema.
// Por padrão, os sistemas solares calculados por essa calculadora buscam suprir
// completamente a média de gasto de energia elétrica mensal de uma residência.
// Num Painéis = Potência do Sistema / Potência de cada painél
function calcularNumPaineis(gastoMensalReais, siglaEstadual) {  
  const gastoKWH = calcularGastoKWH(gastoMensalReais, siglaEstadual);
  const potNecessaria = calcularPotNecessaria(gastoKWH, siglaEstadual);
  // Por enquanto, o cáuclo é feito apenas com painéis de potência 550 Wp.
  const potPainel = 0.55;
  // Nota, sempre arrendondar para cima, para nunca faltar painéis para cubrir a potência.
  const numPaineis = Math.ceil(potNecessaria / potPainel);
  return numPaineis
}

// Presume-se que o valor recebido da área é em m²
function calcularAreaPaineis(numPaineis, areaPainel) {
  // O 1.2 abaixo refere a margem de segurança, pois os painéis não irão ficar 
  // exatamente colados uns aos outros.
  return numPaineis * areaPainel * 1.2;
}

export function calcularResultados(gastoMensalReais, siglaEstadual) {
  const resultadosPorPainel = [];
  for (const painel of paineis) {
    const numPaineis = calcularNumPaineis(gastoMensalReais, siglaEstadual);
    resultadosPorPainel.push({
      ...painel,
      numPaineis,
      areaInstalaçao: calcularAreaPaineis(numPaineis, painel.area),
    });
  }
  return resultadosPorPainel;
}
