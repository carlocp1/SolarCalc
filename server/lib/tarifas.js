import { parse } from "csv-parse"
import { Readable } from "node:stream"
import { writeFile, readFile } from "node:fs/promises";

async function salvarDadosDists(distsResidenciais) {
  const conteudoJSON = JSON.stringify({
    dataDaBusca: new Date(),
    distsResidenciais,
  });
  return writeFile("server/data/dados-dists-residenciais.json", conteudoJSON);
}

async function lerDadosDistsAnteriores() {
  try {
    const conteudoJSON = await readFile("server/data/dados-dists-residenciais.json");
    return JSON.parse(conteudoJSON);
  } catch (err) {
    if (err.code === "ENOENT") {
      return {
        // Caso o arquivo backup não exista, retorne um resultado no formato
        // apropriado, porém com uma data muito antiga.
        // Desta forma, o programa irá buscar novos dados de distribuidoras da ANEEL.
        dataDaBusca: new Date(0),
        distsResidenciais:  [],
      };
    }
  }
}

async function obterDistsResidenciais() {
  let { dataDaBusca, distsResidenciais } = await lerDadosDistsAnteriores();
  // Se uma busca bem sucedida ocorreu nas últimas 24 horas, use ela ao
  // invés da baixar os dados novamente.
  const UM_DIA_EM_MS = 1000 * 60 * 60 * 24;
  const diferençaTempo = new Date() - new Date(dataDaBusca).getTime();
  if( diferençaTempo <= UM_DIA_EM_MS) {
    return distsResidenciais;
  }
  // Faça uma nova busca na API da ANEEL caso já faça mais de 24 horas
  // desde a última.
  const todasDistribuidoras = await obterDadosDistribuidoras();
  const anoAtual = String(new Date().getFullYear());
  const siglasDistribuidoras = [];
  distsResidenciais = todasDistribuidoras
    .filter(d => (
      // Filtrar por tarifas residenciais do ano atual.
      d.DscClasse === "Residencial"
      && d.DscBaseTarifaria.includes("Tarifa")
      && d.VlrTE
      && d.SigAgente
      && d.DatInicioVigencia.includes(anoAtual)
      && d.DscUnidadeTerciaria === "MWh"
    ))
    .sort((distA, distB) => {
      // Reordenar o resultado com base no início de vigência da tarifa.
      // Tarifas mais recentes primeiro.
      const vigenciaA = new Date(distA.DatInicioVigencia);
      const vigenciaB = new Date(distB.DatInicioVigencia);
      return vigenciaB - vigenciaA;
    })
    .flatMap(d => {
      // Apenas salve a tarifa mais recente, descartando as antigas.
      if (siglasDistribuidoras.includes(d.SigAgente)) {
        return [];
      }
      siglasDistribuidoras.push(d.SigAgente);
      return [{
        nome: d.SigAgente,
        tarifaEnergiaKwh: parseFloat(d.VlrTE.replace(',', '.')) / 1000,
        tarifaUsoKwh: d.VlrTUSD ? parseFloat(d.VlrTUSD.replace(',', '.')) / 1000 : null,
        inicioVigencia: d.DatInicioVigencia,
      }];
    });
  
  await salvarDadosDists(distsResidenciais);
  return distsResidenciais;
}

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