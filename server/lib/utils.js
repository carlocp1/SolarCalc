import { parse } from "csv-parse"
import { Readable } from "node:stream"

// Conjutos de dados no site da ANEEL possuem arquivos de diferentes formatos
// associados a eles. Essa função permite que buscar o link de um arquivo de
// formato específico.
// Até o momento, eu sei que estes formatos são suportados: "ZIP", "CSV"
export async function obterLinkArquivoANEEL(conjuntoDados, formato) {
  const url = "https://dadosabertos.aneel.gov.br/api/3/action/package_show";
  const resposta = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      //id: "tarifas-distribuidoras-energia-eletrica",
      id: conjuntoDados,
    }),
  });

  const dados = await resposta.json();
  if (!dados.success) {
    throw dados.error;
  }
  const recursos = dados.result.resources;
  const arquivo = recursos.find(r => r.format === formato);

  if (!arquivo) {
    throw new Error (`Arquivo ${formato} não foi encontrado.`);
  }
  return arquivo.url;
}

export async function obterDadosCSV(url) {
  const resposta = await fetch(url);

  return new Promise((resolve, reject) => {
    const resultados = [];
    // Converta cada fileira num objeto cujo as propriedades são o cabeçalho
    // de cada coluna, e adiciona na lista de resultados.
    Readable.fromWeb(resposta.body)
      .pipe(parse({ columns: true, delimiter: ";" }))
      .on("data", (fileira) => resultados.push(fileira))
      .on("end", () => resolve(resultados))
      .on("error", (err) => reject(err));
  });
}