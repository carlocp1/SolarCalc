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