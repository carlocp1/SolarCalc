import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

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

// Iniciar servidor.
app.listen(PORT, () => {
  console.log(`Servidor está rodando em http://localhost:${PORT}`);
});