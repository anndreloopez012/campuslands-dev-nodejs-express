import config from "../config.js";
import { pedirStats } from "../clients/stats.client.js";

// cache: gamertag => { stats, guardado }
// uso Date.now(), en los tests se adelanta el reloj con mock.timers
const cache = new Map();

function calcularRango(kd, winrate) {
    if (kd >= 2 && winrate >= 60) return "Diamante";
    if (kd >= 1.5 && winrate >= 50) return "Platino";
    if (kd >= 1) return "Oro";
    if (kd >= 0.7) return "Plata";
    return "Bronce";
}

function resumir(stats) {
    // si nunca murio divido entre 1 para no dar infinito
    const kd = Math.round((stats.kills / Math.max(1, stats.muertes)) * 100) / 100;
    const winrate = stats.partidas === 0 ? 0 : Math.round((stats.victorias / stats.partidas) * 100);
    return { ...stats, kd, winrate, rango: calcularRango(kd, winrate) };
}

async function obtenerStats(gamertag) {
    const clave = gamertag.toLowerCase();
    const enCache = cache.get(clave);

    if (enCache && Date.now() - enCache.guardado < config.cacheMs) {
        return { ...enCache.stats, desdeCache: true };
    }

    const stats = resumir(await pedirStats(gamertag));
    cache.set(clave, { stats, guardado: Date.now() });
    return { ...stats, desdeCache: false };
}

// para los tests
function limpiarCache() {
    cache.clear();
}

export { obtenerStats, calcularRango, limpiarCache };
