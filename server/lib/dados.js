// Tornar estas funções genericas para eu poder reutiliza-las
// adiconar novo parametro com tipo de dado que quero salvar
// o argumento poderia ser do tipo string com suporte para valores
// especificos, tipo "tarifas", "municipios", etc

export async function salvarDadosTarifas(tarifasPorDist) {
  const conteudoJSON = JSON.stringify({
    dataDaBusca: new Date(),
    tarifasPorDist,
  });
  return writeFile("server/data/tarifas.json", conteudoJSON);
}

export async function lerDadosTarifas() {
  try {
    const conteudoJSON = await readFile("server/data/tarifas.json");
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