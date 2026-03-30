import { carregarLocalmente, salvarLocalmente } from "./dados.js";

export async function obterEstados() {
  let local = await carregarLocalmente("estados-brasileiros");
  if (local?.dados) {
    // Retorne os dados dos estados brasileiros ja salvos da última vez.
    return local.dados;
  }
  const resposta = await fetch(
    "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
  );
  if (!resposta.ok) {
    throw new Error(`Erro HTTP: ${resposta.status}`);
  }
  const estados = await resposta.json();
  await salvarLocalmente("estados-brasileiros", estados, null);
  return estados;
}

export async function obterMunicipios() {
  let local = await carregarLocalmente("municipios-brasileiros");
  if (local?.dados) {
    // Retorne os dados dos estados brasileiros ja salvos da última vez.
    return local.dados;
  }
  const estados = await obterEstados();
  const siglasEstaduais = estados.map(e => e.sigla);
  const geojsonMunicipios = await obterGeoJSONMunicipios();
  
  const resposta = await fetch(
    "https://servicodados.ibge.gov.br/api/v1/localidades/municipios"
  );
  if (!resposta.ok) {
    throw new Error(`Erro HTTP: ${resposta.status}`);
  }
  const todosMunicipios = await resposta.json();
  const municipios = {};
  for (const sigla of siglasEstaduais) {
    // Filtre municípios por estado e apenas salve o nome e o id de cada um.
    municipios[sigla] = todosMunicipios
      .filter(m => m["regiao-imediata"]["regiao-intermediaria"]["UF"]["sigla"] === sigla)
      .map(({ id, nome }) => ({
        id,
        nome,
        // Calcular coordenadas do município para depois obter a irradiação solar.
        coordenadas: obterLocalizacaoMunicipio(geojsonMunicipios, id),
      }));
  }
  await salvarLocalmente("municipios-brasileiros", municipios, null);
  return municipios;
}

async function obterGeoJSONMunicipios() {
  // GeoJSON simplificado dos municípios (IBGE convertido)
  const resposta = await fetch(
    "https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-100-mun.json"
  );
  return resposta.json();
}

function obterLocalizacaoMunicipio(geojson, idMunicipio) {
  // Encontre dados referentes ao município com o id fornecido.
  const municipio = geojson.features.find(
    f => Number(f.properties.id) === Number(idMunicipio)
  );
  if (!municipio) {
    //throw new Error("Município não encontrado");
    return null;
  }
  // Retorna coodernadas em { lat, lon }.
  return calcularCentroide(municipio.geometry.coordinates);
}

// Calcula o centro médio "ou centroide" de um município e retorna as
// coordenadas em latitude e longitude.
function calcularCentroide(coordenadas) {
  let longitudeTotal = 0;
  let latitudeTotal = 0;
  let quantidadePontos = 0;
  // Função que processa todas as coordenadas as adiciona há um contador total.
  function processarCoordenadas(coordenadas) {
    if (typeof coordenadas[0] === "number") {
      longitudeTotal += coordenadas[0];
      latitudeTotal += coordenadas[1];
      quantidadePontos++;
    } else {
      coordenadas.forEach(processarCoordenadas);
    }
  }
  processarCoordenadas(coordenadas);
  return {
    lat: latitudeTotal / quantidadePontos,
    lon: longitudeTotal / quantidadePontos,
  };
}