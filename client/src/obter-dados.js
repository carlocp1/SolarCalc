export async function obterLocalidades() {
  const resposta = await fetch("/api/localidades");
  if (!resposta.ok) {
    throw new Error(`Erro HTTP: ${resposta.status}`);
  }
  const localidades = await resposta.json();
  return localidades;
}