import { obterLocalidades } from "./obter-dados.js";
import { calcularResultados} from "./utilidades.js";
import { criarTabela, preencherSelectEstado } from "./interface.js";

// Conjunto de dados das APIs.
const { estados, municipios } = await obterLocalidades();

// Buscar elementos da página.
const selectEstado = document.getElementById("estado");
const selectMunicipio = document.getElementById("municipio");
const inputValorConta = document.getElementById("valor-conta");
const botaoCalcular = document.getElementById("botao-calcular");

// Seletores de Estado e Município.
preencherSelectEstado(selectEstado, estados);
selectEstado.addEventListener("change", (event) => {
  // Remova os municípios do Estado anterior.
  while (selectMunicipio.hasChildNodes()) {
    selectMunicipio.firstChild.remove();
  }
  const siglaEstadual = selectEstado.value;
  for (const municipio of municipios[siglaEstadual]) {
    const option = document.createElement("option");
    option.value = municipio.id;
    option.textContent = municipio.nome;
    selectMunicipio.append(option);
  }
});

botaoCalcular.addEventListener("click", function(event) {
  event.preventDefault();
  const gastoMensalReais = Number(inputValorConta.value);

  const resultados = calcularResultados(gastoMensalReais, siglaEstadual);
  const tabela = criarTabela(resultados);
  const sessaoResultados = document.getElementById("sessao-resultados");
  sessaoResultados.append(tabela);
});

