import { calcularResultados, lerValorReais } from "./utilidades.js";
import {
  criarTabela,
  formatarInputReais,
  inicializarSeletorEstado,
  inicializarSeletorMunicipio,
} from "./interface.js";

// Seletores de Estado e Município.
inicializarSeletorEstado();
inicializarSeletorMunicipio();

// Buscar elementos da página.
const inputValorConta = document.getElementById("valor-conta");
const formulario = document.querySelector("form");
const botaoCalcular = document.getElementById("botao-calcular");
const textoOriginalBotao = botaoCalcular.textContent;

// Formatar texto do input do valor da conta em tempo real.
inputValorConta.addEventListener("input", formatarInputReais);

formulario.addEventListener("submit", async (event) => {
  event.preventDefault();
  const dadosForm = new FormData(formulario);

  const gastoMensalReais = lerValorReais(inputValorConta.value);
  const codigoMunicipio = Number(dadosForm.get("municipio"));

  botaoCalcular.disabled = true;
  botaoCalcular.textContent = "Calculando...";

  try {
    const resultados = await calcularResultados(gastoMensalReais, codigoMunicipio);

    const tabela = criarTabela(resultados);
    const sessaoResultados = document.getElementById("sessao-resultados");
    sessaoResultados.append(tabela);
    sessaoResultados.hidden = false;
  } finally {
    botaoCalcular.disabled = false;
    botaoCalcular.textContent = textoOriginalBotao;
  }
});