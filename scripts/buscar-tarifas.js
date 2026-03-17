import { parse } from "csv-parse"
import { Readable } from "node:stream"

async function obterDadosDistribuidoras() {
  const url = await obterLinkArquivoCSV();
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

async function obterLinkArquivoCSV() {
  // Obtenha o URL que aponta pro arquivo CSV mais recente deste conjunto de dados.
  const url = "https://dadosabertos.aneel.gov.br/api/3/action/package_show";
  const resposta = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: "tarifas-distribuidoras-energia-eletrica",
    }),
  });

  const dados = await resposta.json();
  if (!dados.success) {
    throw dados.error;
  }
  const recursos = dados.result.resources;
  const recursoCSV = recursos.find(r => r.format === "CSV");

  if (!recursoCSV) {
    throw new Error ("Arquivo CSV de tarifas não foi encontrado.");
  }
  return recursoCSV.url;
}


const todasDistribuidoras = await obterDadosDistribuidoras();

const distResidenciais = [];
const anoAtual = String(new Date().getFullYear());
const siglasDistribuidoras = [];
todasDistribuidoras
  .filter(d => (
    // Filtrar por tarifas residenciais do ano atual.
    d.DscClasse === "Residencial"
    && d.DscBaseTarifaria.includes("Tarifa")
    && d.VlrTE
    && d.SigAgente
    && d.DatInicioVigencia.includes(anoAtual)
  ))
  .sort((distA, distB) => {
    // Reordenar o resultado com base no início de vigência da tarifa.
    // Tarifas mais recentes primeiro.
    const vigenciaA = new Date(distA.DatInicioVigencia);
    const vigenciaB = new Date(distB.DatInicioVigencia);
    return vigenciaB - vigenciaA;
  })
  .forEach(d => {
    // Apenas salve a tarifa mais recente, descartando as antigas.
    if (siglasDistribuidoras.includes(d.SigAgente)) {
      return;
    }
    distResidenciais.push(d);
    siglasDistribuidoras.push(d.SigAgente);
  })
