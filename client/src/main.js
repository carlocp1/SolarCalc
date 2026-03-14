import { calcularResultados, criarTabela } from "./utilidades.js";


const botaoCalcular = document.getElementById("botao-calcular");
botaoCalcular.addEventListener("click", function(event) {
  event.preventDefault();

  const estadoInput = document.getElementById("estado");
  const siglaEstadual = estadoInput.value.trim().toUpperCase();
  const inputValorConta = document.getElementById("valor-conta");
  const gastoMensalReais = Number(inputValorConta.value);

  const resultados = calcularResultados(gastoMensalReais, siglaEstadual);
  const tabela = criarTabela(resultados);
  const sessaoResultados = document.getElementById("sessao-resultados");
  sessaoResultados.append(tabela);
});

