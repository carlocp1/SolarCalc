import { obterEstados } from "./lib/ibge.js";

const estados = await obterEstados();
console.log(estados);