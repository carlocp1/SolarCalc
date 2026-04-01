import { calcularResultados, lerValorReais} from "./utilidades.js";
import {
 criarTabela,
 formatarInputReais,
 inicializarSeletorEstado,
 inicializarSeletorMunicipio,
} from "./interface.js";


// Buscar elementos da página.
const seletorEstado = document.getElementById("estado");
const seletorMunicipio = document.getElementById("municipio");
const inputValorConta = document.getElementById("valor-conta");
const botaoCalcular = document.getElementById("botao-calcular");

// Seletores de Estado e Município.
inicializarSeletorEstado();
inicializarSeletorMunicipio();
// Formatar texto do input do valor da conta em tempo real.
inputValorConta.addEventListener("input", formatarInputReais);
// Após ter inicializado o formulário, ative o botão de calcular.
botaoCalcular.disabled = false;

botaoCalcular.addEventListener("click", (event) => {
  // O ideal seria adicionar alguma forma de indicador de "carregando".
  // porém isto está fora do escopo desse projeto.
  botaoCalcular.disabled = true;

  const gastoMensalReais = lerValorReais(inputValorConta.value);
  // const resultados = calcularResultados(gastoMensalReais, siglaEstadual);

  // const tabela = criarTabela(resultados);
  // const sessaoResultados = document.getElementById("sessao-resultados");
  // sessaoResultados.append(tabela);

  botaoCalcular.disabled = false;
});

