import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { obterEstados, obterMunicipios } from "./lib/ibge.js";
import { obterIrradiacaoMediaDiaria } from "./lib/irradiacao.js";
import { obterTarifaMunicipio } from "./lib/distribuidoras.js";
import { obterDistsPorMunicipio, obterTarifasPorDist } from "./lib/distribuidoras.js";

const app = express();
const PORT = 3000;

// Conjunto de dados necessários as para operações.
console.log("Carregando conjuntos de dados necessários para a calculadora...")
const estados = await obterEstados();
const municipios = await obterMunicipios();
const distsPorMunicipio = await obterDistsPorMunicipio();
const tarifasPorDist = await obterTarifasPorDist();

// Concertar o fato de __dirname não ser presente em módulos ES.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sirva os arquivos estáticos (CSS, JS, etc.)
// Esta função também já serve o arquivo index.html em '/'.
app.use(
  express.static(
    path.join(__dirname, "..", "client")
  )
);

// Enviar dados de estados brasileiros e municípios necessários
// para o criar o <select> widget no formulário HTML.
app.get("/api/localidades", (req, res) => {
  res.json({ estados, municipios });
});

// Enviar irradiação solar referente ao município recebido.
app.get("/api/irradiacao/:municipio", async (req, res) => {
  const codigoMunicipio = Number(req.params.municipio);
  const municipio = Object.values(municipios)
    .flat()
    .find(mun => mun.id === codigoMunicipio);
  const { lat, lon } = municipio.coordenadas;
  const anoAnterior = (new Date()).getFullYear() - 1;
  const irradiacao = await obterIrradiacaoMediaDiaria(lat, lon, anoAnterior);
  res.json(irradiacao);
});

// Enviar tarifa de energia da distribuidora mais frequente no município (se existir).
app.get("/api/tarifa/:municipio", async (req, res) => {
  const codigoMunicipio = Number(req.params.municipio);
  const tarifa = await obterTarifaMunicipio(codigoMunicipio, {
    tarifasPorDist,
    distsPorMunicipio
  });
  res.json(tarifa);
});

// Iniciar servidor.
app.listen(PORT, () => {
  console.log(`Servidor está rodando em http://localhost:${PORT}`);
});