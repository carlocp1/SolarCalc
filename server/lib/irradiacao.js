const NASA_URL = "https://power.larc.nasa.gov/api/temporal/daily/point";

// Calcule a irradiação média diário de um ano X, nas seguintes latitudes.
// Esta função utiliza a API da NASAS para obter dados de irradiação solar.
export async function obterIrradiacaoMediaDiaria( latitude, longitude, ano ) {
  const url = new URL(NASA_URL);
  url.search = new URLSearchParams({
    parameters: "ALLSKY_SFC_SW_DWN",
    community: "RE",
    latitude: String(latitude),
    longitude: String(longitude),
    // Começar no início de janeiro até o fim de dezembro do ano escolhido.
    start: `${ano}0101`,
    end: `${ano}1231`,
    format: "JSON",
    "time-standard": "LST",
  }).toString();

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Falha na NASA POWER: HTTP ${res.status} ${res.statusText}`);
  }
  const dados = await res.json();
  const serie = dados?.properties?.parameter?.ALLSKY_SFC_SW_DWN;
  if (!serie || typeof serie !== "object") {
    throw new Error("A resposta da NASA não veio no formato esperado.");
  }

  // Obter array com valores diários de irradição em forma numérica.
  const valores = Object.values(serie)
    .map(Number)
    // A API da NASA retorna dados corrompidos ou faltantes com -999
    .filter((v) => Number.isFinite(v) && v > -900);
  if (valores.length === 0) {
    throw new Error("Nenhum valor válido de irradiação foi retornado.");
  }
  const irradiacaoMediaDiaria =
    valores.reduce((soma, valor) => soma + valor, 0) / valores.length;

  return irradiacaoMediaDiaria;
}