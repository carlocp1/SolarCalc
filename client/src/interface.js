import { obterLocalidades } from "./obter-dados.js";

// ----- Input Valor da Conta -----
export function formatarInputReais(event) {
  const input = event.currentTarget;
  let value = input.value.replace(/\D/g, "");
  value = (value / 100).toFixed(2);
  let [inteiro, decimal] = value.split(".");
  // Adiciona separador de milhar (.)
  inteiro = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  input.value = `${inteiro},${decimal}`;
}

// ----- Seletores de Localidade (Estado e Município) -----

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

  // Adicionar opção padrão.
  const optPadrao = document.createElement("option");
  optPadrao.value = "";
  optPadrao.textContent = "Selecione um estado";
  optPadrao.disabled = true;
  optPadrao.selected = true;
  seletor.append(optPadrao);
      
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

  // Adicionar opção padrão.
  const optPadrao = document.createElement("option");
  optPadrao.value = "";
  optPadrao.textContent = "Selecione um município";
  optPadrao.disabled = true;
  optPadrao.selected = true;
  seletor.append(optPadrao);

  const seletorEstado = document.getElementById("estado");

  function atualizarSeletorMunicipio() {
    // Remova os municípios do Estado anterior.
    while (seletor.childNodes.length > 1) {
      seletor.childNodes[1].remove();
    }
    const siglaEstadual = seletorEstado.value;
    for (const municipio of municipios[siglaEstadual]) {
      const option = document.createElement("option");
      option.value = municipio.id;
      option.textContent = municipio.nome;
      // Na base de dados utilizadas, alguns municípios atuais não tem
      // coordenadas presentes.
      // Já que esse programa é ilustrativo e não feito para produção,
      // eles serão desativados.
      if (!municipio.coordenadas) {
        option.disabled = true;
      }
      seletor.append(option);
    }
    optPadrao.selected = true;
  }
  seletorEstado.addEventListener("change", atualizarSeletorMunicipio);

  const fieldset = document.getElementById("localidade");
  fieldset.append(label, seletor);
}


// ----- Tabela de Resultados -----

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