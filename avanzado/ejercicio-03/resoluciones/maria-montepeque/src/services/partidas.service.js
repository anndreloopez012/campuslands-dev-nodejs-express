import { db } from "../data/db.js";
import AppError from "../shared/app-error.js";

// el schema ya reviso la forma y las reglas entre campos
// lo que falta es ver contra los datos: que los campeones existan
export function registrar(partida) {
    const ids = [
        ...partida.azul.picks.map((p) => p.campeonId),
        ...partida.rojo.picks.map((p) => p.campeonId),
        ...partida.azul.bans,
        ...partida.rojo.bans
    ];
    const noExisten = [...new Set(ids)].filter((id) => !db.campeones.some((c) => c.id === id));

    if (noExisten.length > 0) {
        throw new AppError(422, `No existen los campeones: ${noExisten.join(", ")}`);
    }

    const nueva = { id: db.partidas.length + 1, ...partida };
    db.partidas.push(nueva);
    return nueva;
}

export function buscar(id) {
    const partida = db.partidas.find((p) => p.id === id);
    if (!partida) {
        throw new AppError(404, `No existe la partida con id ${id}`);
    }
    return partida;
}
