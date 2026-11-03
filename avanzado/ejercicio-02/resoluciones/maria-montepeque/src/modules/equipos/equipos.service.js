import AppError from "../../shared/app-error.js";
import { exigirSinErrores } from "../../shared/http.js";

const TAMANO_EQUIPO = 5;

// equipos depende de jugadores, pero solo de su service (no de su repo ni sus archivos)
export function crearEquiposService({ repo, jugadores }) {
    // el equipo guardado tiene ids, al mostrarlo le agrego los jugadores y el elo promedio
    async function conDetalle(equipo) {
        const lista = await jugadores.buscarVarios(equipo.jugadorIds);
        const eloPromedio = Math.round(lista.reduce((s, j) => s + j.elo, 0) / lista.length);
        return {
            ...equipo,
            jugadores: lista.map(({ id, gamertag, elo }) => ({ id, gamertag, elo })),
            eloPromedio
        };
    }

    async function listar() {
        const equipos = await repo.listar();
        return Promise.all(equipos.map(conDetalle));
    }

    async function buscar(id) {
        const equipo = await repo.buscar(id);
        if (!equipo) {
            throw new AppError(404, `No existe el equipo con id ${id}`);
        }
        return conDetalle(equipo);
    }

    async function crear(body = {}) {
        const errores = [];
        const ids = body.jugadorIds;

        if (typeof body.nombre !== "string" || body.nombre.trim().length < 3) errores.push("nombre debe tener al menos 3 letras");
        if (!Array.isArray(ids) || ids.length !== TAMANO_EQUIPO || !ids.every(Number.isInteger)) {
            errores.push(`jugadorIds debe ser una lista de ${TAMANO_EQUIPO} ids`);
        } else if (new Set(ids).size !== ids.length) {
            errores.push("jugadorIds tiene ids repetidos");
        }
        exigirSinErrores(errores);

        // si alguno no existe, el service de jugadores tira el 404
        await jugadores.buscarVarios(ids);

        // un jugador no puede estar en dos equipos
        const yaEnEquipo = await repo.listar((e) => e.jugadorIds.some((id) => ids.includes(id)));
        if (yaEnEquipo.length > 0) {
            throw new AppError(409, `Algun jugador ya esta en el equipo ${yaEnEquipo[0].nombre}`);
        }

        const equipo = await repo.crear({ nombre: body.nombre.trim(), jugadorIds: ids });
        return conDetalle(equipo);
    }

    return { listar, buscar, crear };
}
