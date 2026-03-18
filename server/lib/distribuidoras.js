import { writeFile, readFile } from "node:fs/promises";
import { obterLinkArquivoANEEL, obterDadosCSV } from "./utils.js";

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
  const url = await obterLinkArquivoANEEL(
    "tarifas-distribuidoras-energia-eletrica",
    "CSV"
  );
  const todasDistribuidoras = await obterDadosCSV(url);
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