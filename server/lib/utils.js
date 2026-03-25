import { parse } from "csv-parse";
import { Readable } from "node:stream";
import unzipper from "unzipper";

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

export async function* iterarDadosCSV(url) {
  const resposta = await fetch(url);

  if (!resposta.ok) {
    throw new Error(`Erro ao baixar: ${resposta.status}`);
  }

  // Checa se aquilo que foi baixado é um arquivo ZIP.
  const contentType = resposta.headers.get("content-type") || "";
  const temZip =
    url.endsWith(".zip") ||
    contentType.includes("zip");

  let stream = Readable.fromWeb(resposta.body);
  if (temZip) {
    stream = stream
      .pipe(unzipper.ParseOne()) // pega o primeiro arquivo dentro do zip
  }
  // Converta cada fileira num objeto cujo as propriedades são o cabeçalho
  // de cada coluna, e adiciona na lista de resultados.
  const parseador = stream.pipe(
    parse({
      columns: true,
      delimiter: ";",
    })
  );
  for await (const linha of parseador) {
    yield linha;
  }
}