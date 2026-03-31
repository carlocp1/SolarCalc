import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { obterEstados, obterMunicipios } from "./lib/ibge.js";

const app = express();
const PORT = 3000;

// Conjunto de dados necessários as para operações.
const estados = await obterEstados();
const municipios = await obterMunicipios();

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

// Iniciar servidor.
app.listen(PORT, () => {
  console.log(`Servidor está rodando em http://localhost:${PORT}`);
});