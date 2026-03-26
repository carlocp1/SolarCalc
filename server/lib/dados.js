import { writeFile, readFile } from "node:fs/promises";

const conjuntoDados = {
  "tarifas-por-distribuidora": {
    arquivo: "server/data/tarifas-por-distribuidora.json",
  },
}

export async function salvarLocalmente(nomeDados, dados, dataModificaçao) {
  const conteudoJSON = JSON.stringify({
    nomeDados,
    dados,
    dataModificaçao,
  });
  if (!conjuntoDados[nomeDados]) {
    throw new Error(`O conjunto de dados ${nomeDados} não é válido.`);
  }
  const arquivo = conjuntoDados[nomeDados].arquivo;
  return writeFile(arquivo, conteudoJSON);
}

export async function carregarLocalmente(nomeDados) {
  if (!conjuntoDados[nomeDados]) {
    throw new Error(`O conjunto de dados ${nomeDados} não é válido.`);
  }
  const arquivo = conjuntoDados[nomeDados].arquivo;
  try {
    const conteudoJSON = await readFile(arquivo);
    return JSON.parse(conteudoJSON);
  } catch (err) {
    if (err.code === "ENOENT") {
      return null;
    }
  }
}