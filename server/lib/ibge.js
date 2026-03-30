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
      .map(({ id, nome }) => ({ id, nome }));
  }
  await salvarLocalmente("municipios-brasileiros", estados, null);
  return municipios;
}