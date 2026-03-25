import { writeFile, readFile } from "node:fs/promises";
import { obterLinkArquivoANEEL, iterarDadosCSV } from "./utils.js";
import { lerDadosTarifas, salvarDadosTarifas } from "./dados.js";

// A base BDGD de dados usa um código DIST para identificar a distribuidora
// de uma determinada instalação.
// Esta lista está no fim do PDF de manual que vem acompanhado com o banco
// de dados.
const distPorCodigo = {
  396: "RGE SUL",
  7019: "AmE",
  383: "ENEL RJ",
  391: "EDP SP",
  370: "RORAIMA ENERGIA",
  5216: "ESS",
  31: "CEA",
  44: "Equatorial AL (CEAL)",
  5160: "CEB-DIS",
  5707: "CEEE-D",
  5697: "CELESC-DIS",
  6072: "ENEL GO (CELG-D)",
  371: "CELPA",
  43: "CELPE",
  32: "ETO",
  37: "Equatorial MA (CEMAR)",
  405: "EMT",
  4950: "CEMIG-D",
  38: "Equatorial PI (CEPISA)",
  369: "ERO (CERON)",
  28: "CERR",
  84: "CFLO",
  103: "CHESP",
  69: "CPFL Santa Cruz (Jaguari)",
  70: "CPFL Mococa",
  75: "CNEE",
  82: "COCEL",
  47: "COELBA",
  39: "ENEL CE",
  2904: "COOPERALIANÇA",
  2866: "COPEL-DIS",
  40: "COSERN",
  71: "CPFL Leste Paulista",
  72: "CPFL Santa Cruz",
  63: "CPFL Paulista",
  2937: "CPFL Piratininga",
  73: "CPFL Sul Paulista",
  95: "DEMEI",
  51: "DMED",
  6611: "EBO",
  386: "EEB",
  5217: "EDEVP",
  88: "EFLJC",
  86: "EFLUL",
  385: "ELEKTRO",
  26: "EAC (ELETROACRE)",
  398: "ELETROCAR",
  390: "ENEL SP (ELETROPAULO)",
  381: "ELFSM",
  6585: "EMG",
  404: "EMS",
  6612: "ENF",
  6600: "EPB",
  380: "EDP ES",
  6587: "ESE",
  83: "FORCEL",
  399: "HIDROPAN",
  87: "DCELT (IENERGIA)",
  382: "LIGHT",
  401: "MUXENERGIA",
  397: "RGE",
  46: "SULGIPE",
  400: "UHENPAL",
  5352: "CEREJ",
  5351: "CERAL",
  7016: "COORSEL",
  6898: "CERBRANORTE",
  6897: "CERAÇÁ",
  5365: "CERPALO",
  5363: "CERGRAL",
  6896: "CEJAMA*",
  5368: "CERSUL",
  5370: "COOPERA",
  5373: "COOPERMILA",
  5353: "CERGAL",
  3223: "CERTAJA",
  4248: "CERAL DIS",
  5385: "CERRP",
  6609: "CERNHE",
  5274: "CERES",
  5377: "CERCOS",
  5379: "CETRIL",
  5384: "CERPRO",
  6610: "CERMC",
  5382: "CERIS",
  5378: "CERIPA",
  5386: "CERIM",
  5366: "CEDRI",
  5381: "CEDRAP",
  5367: "CEPRAG",
  5355: "CERGAPA",
  2763: "CERILUZ",
  2381: "CERMISSÕES",
  5364: "CERMOFUL",
  7371: "CERTEL",
  5369: "CERTREL",
  5371: "COOPERCOCAL",
  3627: "COOPERLUZ",
  2351: "COPREL",
  598: "CRELUZ-D",
  2783: "CRERAL",
  5372: "CEJAMA",
  11825: "CASTRO-DIS",
  5356: "CEGERO",
  5343: "CELETRO",
  7467: "CEMIRIM",
  9160: "CERAL ARARUAMA",
  5279: "CERCI",
  504: "CERFOX",
  7883: "CERSAD",
  527: "CERTHIL",
  5375: "CERVAM",
  11763: "CODESAM",
  5345: "COOPERNORTE",
  5346: "COOPERSUL",
  5374: "COOPERZEM"
};

async function obterTarifasPorDist() {
  let { dataDaBusca, tarifasPorDist } = await lerDadosTarifas();
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
  await salvarDadosTarifas(tarifasPorDist);
  return tarifasPorDist;
}

async function obterDistPorMunicipio() {
  const url = await obterLinkArquivoANEEL(
    "base-de-dados-geografica-da-distribuidora-bdgd",
    "ZIP",
  );

  const distPorMunicipio = Object.create(null);
  // Base de dado geográfica, onde cada valor se refere a um ponto
  // no mapa com dados associados sobre da rede elétrica.
  for await (const ponto of iterarDadosCSV(url)) {
    // Código do município na malha municipal digital do IBGE.
    const municipio = ponto.MUN;
    // Código da distribuidora no cadastro ANEEL
    const codigoDist = ponto.DIST;

    // Adicione um "slot" para o município se ele ainda não foi listado.
    if (!(municipio in distPorMunicipio)) {
      distPorMunicipio[municipio] = [];
    }
    // Caso ambos o município e a distribuidora já estejam listados, apenas
    // aumente o contador de vezes que a distribuidora apareceu do banco de dados.
    if (distPorCodigo[municipio].some(dist => dist.codigoDist === codigoDist)) {
      const distribuidora = distPorMunicipio[municipio].find(
        dist => dist.codigoDist === codigoDist
      );
      distribuidora.numPontos++;
    }
    else {
      // Caso contrário, crie um "slot" para a distribuidora no município.
      distPorMunicipio[municipio].push({
        codigoDist,
        // O número de vezes na base de dados que esta distribuidora aparece
        // listada para este município.
        // Isto é importante para saber qual é a distribuidora principal do município.
        numPontos: 1,
      });
    }
  }
  return distPorMunicipio;
}

const distPorMunicipio = await obterDistPorMunicipio();
console.log("Something");