import { writeFile, readFile } from "node:fs/promises";
import { obterLinkArquivoANEEL, iterarDadosCSV } from "./utils.js";

async function salvarDados(tarifasPorDist) {
  const conteudoJSON = JSON.stringify({
    dataDaBusca: new Date(),
    tarifasPorDist,
  });
  return writeFile("server/data/tarifas.json", conteudoJSON);
}

async function lerDadosAnteriores() {
  try {
    const conteudoJSON = await readFile("server/data/dados-dists-residenciais.json");
    return JSON.parse(conteudoJSON);
  } catch (err) {
    if (err.code === "ENOENT") {
      return {
        // Caso o arquivo backup não exista, retorne um resultado no formato
        // apropriado, porém com uma data muito antiga.
        // Desta forma, o programa irá buscar novos dados de tarifas da ANEEL.
        dataDaBusca: new Date(0),
        tarifasPorDist:  [],
      };
    }
  }
}

async function obterTarifasPorDist() {
  let { dataDaBusca, tarifasPorDist } = await lerDadosAnteriores();
  // Se uma busca bem sucedida ocorreu nas últimas 24 horas, use ela ao
  // invés da baixar os dados novamente.
  const UM_DIA_EM_MS = 1000 * 60 * 60 * 24;
  const diferençaTempo = new Date() - new Date(dataDaBusca).getTime();
  if( diferençaTempo <= UM_DIA_EM_MS) {
    return tarifasPorDist;
  }

  // Faça uma nova busca na API da ANEEL caso já faça mais de 24 horas
  // desde a última.
  tarifasPorDist = {};
  const url = await obterLinkArquivoANEEL(
    "tarifas-distribuidoras-energia-eletrica",
    "CSV"
  );
  for await (const dist of iterarDadosCSV(url)) {
    // Se o objeto de distribuidora atual não passar nestes critérios,
    // ignore e vá para o próximo.
    if (!(
      dist.DscClasse === "Residencial"
      && dist.DscBaseTarifaria.includes("Tarifa")
      && dist.VlrTE
      && dist.SigAgente
      && dist.DscUnidadeTerciaria === "MWh"
    )) {
      continue;
    }
    const nomeDist = dist.SigAgente;
    const tarifaAtual = {
        tarifaEnergiaKwh: parseFloat(dist.VlrTE.replace(',', '.')) / 1000,
        tarifaUsoKwh: dist.VlrTUSD ? parseFloat(dist.VlrTUSD.replace(',', '.')) / 1000 : null,
        inicioVigencia: dist.DatInicioVigencia,
    };
    // Se a tarifa atual que esta sendo examinar neste loop for de uma distribuidora
    // já avaliada anteriormente, cheque primeiro se a data de início de vigência for
    // mais recente do que a última.
    // Se for o caso, substitua a que foi salva anteriormente pela atual, pois o objetivo
    // é ficar apenas com as tarifas mais recentes de cada distribuidora.
    if (nomeDist in tarifasPorDist) {
      const vigenciaAtual = new Date(tarifaAtual.inicioVigencia);
      const vigenciaSalva = new Date(tarifasPorDist[nomeDist].inicioVigencia);
      const diferençaTempo = vigenciaAtual - vigenciaSalva;
      if (diferençaTempo > 0) {
        tarifasPorDist[nomeDist] = tarifaAtual;
      } else {
        continue;
      }
    } 
    tarifasPorDist[nomeDist] = tarifaAtual;
  }
  await salvarDados(tarifasPorDist);
  return tarifasPorDist;
}

async function obterDistPorMunicipio() {
  const url = await obterLinkArquivoANEEL(
    "base-de-dados-geografica-da-distribuidora-bdgd",
    "ZIP",
  );

  for await (const linha of iterarDadosCSV(url)) {
    console.log(linha);
  }
}