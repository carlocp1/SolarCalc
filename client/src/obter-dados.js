export async function obterLocalidades() {
  const resposta = await fetch("/api/localidades");
  if (!resposta.ok) {
    throw new Error(`Erro HTTP: ${resposta.status}`);
  }
  const localidades = await resposta.json();
  return localidades;
}

export async function obterIrradiacao(codigoMunicipio) {
  const resposta = await fetch(`/api/irradiacao/${codigoMunicipio}`);
  if (!resposta.ok) {
    throw new Error(`Erro HTTP: ${resposta.status}`);
  }
  const irradiacao = await resposta.json();
  return irradiacao;
}

export async function obterTarifaMunicipio(codigoMunicipio) {
  const resposta = await fetch(`/api/tarifa/${codigoMunicipio}`);
  if (!resposta.ok) {
    throw new Error(`Erro HTTP: ${resposta.status}`);
  }
  const irradiacao = await resposta.json();
  return irradiacao;
}