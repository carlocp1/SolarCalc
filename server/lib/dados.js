import { writeFile, readFile, mkdir } from "node:fs/promises";

const DIRETORIO_DADOS = "server/data";

const conjuntoDados = {
  "tarifas-por-distribuidora": {
    arquivo: "server/data/tarifas-por-distribuidora.json",
  },
  "dists-por-municipio": {
    arquivo: "server/data/dists-por-municipio.json",
  },
  "estados-brasileiros": {
    arquivo: "server/data/estados-brasileiros.json",
  },
  "municipios-brasileiros": {
    arquivo: "server/data/municipios-brasileiros.json",
  }
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
  // Crie o diretório de dados caso ele não exista.
  // Caso ele exista, nada acontence.
  await mkdir(DIRETORIO_DADOS, { recursive: true });
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