import { obterTarifasPorDist } from "./lib/distribuidoras.js";

const tarifasPorDist = await obterTarifasPorDist();
console.log(tarifasPorDist);