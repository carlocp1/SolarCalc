import { obterLocalidades } from "./obter-dados.js";

// Conjunto de dados das APIs.
const { estados, municipios } = await obterLocalidades();

export function inicializarSeletorEstado() {
  const label = document.createElement("label");
  label.htmlFor = "estado";
  label.textContent = "Estado";
  const seletor = document.createElement("select");
  seletor.name = "estado";
  seletor.id = "estado";
  seletor.required = true;

  for (const { sigla, nome } of estados) {
    const option = document.createElement("option");
    option.value = sigla;
    option.textContent = nome;
    seletor.append(option);
  }
  const fieldset = document.getElementById("localidade");
  fieldset.append(label, seletor);
}

export function inicializarSeletorMunicipio() {
  // Criar seletor e respectivo "label".
  const label = document.createElement("label");
  label.htmlFor = "municipio";
  label.textContent = "Município";
  const seletor = document.createElement("select");
  seletor.name = "municipio";
  seletor.id = "municipio";
  seletor.required = true;

  const seletorEstado = document.getElementById("estado");

  function atualizarSeletorMunicipio() {
    // Remova os municípios do Estado anterior.
    while (seletor.hasChildNodes()) {
      seletor.firstChild.remove();
    }
    const siglaEstadual = seletorEstado.value;
    for (const municipio of municipios[siglaEstadual]) {
      const option = document.createElement("option");
      option.value = municipio.id;
      option.textContent = municipio.nome;
      seletor.append(option);
    }
  }
  // Use a função uma vez para inicializar a opções, e a chame novamente
  // sempre que o Estado for alterado.
  atualizarSeletorMunicipio();
  seletorEstado.addEventListener("change", atualizarSeletorMunicipio);

  const fieldset = document.getElementById("localidade");
  fieldset.append(label, seletor);
}

export function criarTabela(resultados) {
  // If the table already exists, remove it first.
  const sessaoResultado = document.getElementById("sessao-resultados");
  const tabelaAnterior = sessaoResultado.querySelector("table");
  if (tabelaAnterior) {
    tabelaAnterior.remove();
  }
  const tabela = document.createElement("table");
  const legenda = document.createElement("caption");
  legenda.innerHTML = "Resultados Para Diferentes Painéis";
  tabela.appendChild(legenda);

  // Cabeçalho da tabela.
  tabela.append(document.createElement("thead"));
  const cabeçalho = document.createElement("tr");
  tabela.tHead.append(cabeçalho);
  const colunas = ["Potência do Painel (W)", "Quantidade", "Área Instalação (m²)"];
  for (const coluna of colunas) {
    const th = document.createElement("th");
    th.innerText = coluna;
    cabeçalho.append(th);
  }

  // Fileiras com os resultados.
  const tBody = document.createElement("tbody");
  tabela.append(tBody);
  for (const resultado of resultados) {
    const novaFileira = document.createElement("tr");
    const valores = [
      resultado.potencia,
      resultado.numPaineis,
      resultado.areaInstalaçao,
    ];
    for (const valor of valores) {
      const novaCelula = document.createElement("td");
      novaCelula.innerText = valor;
      novaFileira.append(novaCelula)
    }
    tBody.append(novaFileira);
  }

  return tabela;
}