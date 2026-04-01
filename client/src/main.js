import { calcularResultados} from "./utilidades.js";
import { criarTabela, inicializarSeletorEstado, inicializarSeletorMunicipio } from "./interface.js";


// Buscar elementos da página.
const seletorEstado = document.getElementById("estado");
const seletorMunicipio = document.getElementById("municipio");
const inputValorConta = document.getElementById("valor-conta");
const botaoCalcular = document.getElementById("botao-calcular");

// Seletores de Estado e Município.
inicializarSeletorEstado();
inicializarSeletorMunicipio();

botaoCalcular.addEventListener("click", function(event) {
  event.preventDefault();
  const gastoMensalReais = Number(inputValorConta.value);

  const resultados = calcularResultados(gastoMensalReais, siglaEstadual);
  const tabela = criarTabela(resultados);
  const sessaoResultados = document.getElementById("sessao-resultados");
  sessaoResultados.append(tabela);
});

