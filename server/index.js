import { obterDistsPorMunicipio, obterTarifasPorDist } from "./lib/distribuidoras.js";

const tarifasPorDist = await obterTarifasPorDist();
const distsPorMunicipio = await obterDistsPorMunicipio();
console.log(distsPorMunicipio);