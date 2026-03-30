import { obterIrradiacaoMediaDiaria } from "./lib/irradiacao.js";

const irradiacao = await obterIrradiacaoMediaDiaria(-22.9056, -47.0608, 2026);
console.log(irradiacao);