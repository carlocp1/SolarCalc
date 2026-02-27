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
export function calcularNumPaineis(gastoMensalReais, siglaEstadual) {  
  const gastoKWH = calcularGastoKWH(gastoMensalReais, siglaEstadual);
  const potNecessaria = calcularPotNecessaria(gastoKWH, siglaEstadual);
  // Por enquanto, o cáuclo é feito apenas com painéis de potência 550 Wp.
  const potPainel = 0.55;
  // Nota, sempre arrendondar para cima, para nunca faltar painéis para cubrir a potência.
  const numPaineis = Math.ceil(potNecessaria / potPainel);
  return numPaineis
}