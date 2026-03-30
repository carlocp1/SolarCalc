import { obterMunicipios } from "./lib/ibge.js";
import { obterIrradiacaoMediaDiaria } from "./lib/irradiacao.js";

const municipios = await obterMunicipios();
const todosMunicipios = Object.values(municipios).flat();

const campinas = todosMunicipios.find(({ nome }) => nome === "Campinas");
const { lat, lon } = campinas.coordenadas;
const irradiacaoCampinas = await obterIrradiacaoMediaDiaria(lat, lon, 2025);
console.log(irradiacaoCampinas);