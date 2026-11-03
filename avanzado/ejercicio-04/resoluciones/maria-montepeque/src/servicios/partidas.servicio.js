import { db } from "../datos/db.js";
import { error } from "../dominio/errores.js";

// el servicio busca la partida y le pide que haga la accion
// las reglas estan en la partida, aqui no hay ifs del juego

function partida(id) {
    const encontrada = db.partidas.get(id);
    if (!encontrada) {
        throw error("PARTIDA_NO_ENCONTRADA", `No existe la partida ${id}`, { partidaId: id });
    }
    return encontrada;
}

export const ver = (id) => partida(id).resumen();
export const recoger = (id, gamertag, itemId) => partida(id).recoger(gamertag, itemId);
export const usar = (id, gamertag, itemId) => partida(id).usar(gamertag, itemId);

export function disparar(id, gamertag, datos) {
    const p = partida(id);
    const { victima, dano } = p.disparar(gamertag, datos);
    return {
        dano,
        objetivo: { gamertag: victima.gamertag, vida: victima.vida, escudo: victima.escudo, vivo: victima.vivo },
        estado: p.estado,
        ganador: p.ganador
    };
}
