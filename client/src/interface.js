export function preencherSelectEstado(select, estados) {
  for (const { sigla, nome } of estados) {
    const option = document.createElement("option");
    option.value = sigla;
    option.textContent = nome;
    select.append(option);
  }
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