import { calcularNumPaineis } from "./utilidades.js";


const botaoCalcular = document.getElementById("botao-calcular");
botaoCalcular.addEventListener("click", function(event) {
  event.preventDefault();

  const estadoInput = document.getElementById("estado");
  const siglaEstadual = estadoInput.value.trim().toUpperCase();
  const inputValorConta = document.getElementById("valor-conta");
  const gastoMensalReais = Number(inputValorConta.value);

  const numPaineis = calcularNumPaineis(gastoMensalReais, siglaEstadual)
  const resultadoTexto = `Você vai precisa de ${numPaineis} solares para a sua instalação!`;
  const paragrafoResultado = document.getElementById("num-paineis-texto");
  paragrafoResultado.innerText = resultadoTexto;
});

