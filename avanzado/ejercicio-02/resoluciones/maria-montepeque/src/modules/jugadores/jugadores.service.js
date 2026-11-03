import AppError from "../../shared/app-error.js";
import { exigirSinErrores } from "../../shared/http.js";

export const REGIONES = ["LATAM", "NA", "EU", "ASIA"];

// el service recibe su repo, no sabe si es memoria o archivo
export function crearJugadoresService({ repo }) {
    async function listar({ region } = {}) {
        if (region === undefined) return repo.listar();
        if (!REGIONES.includes(region)) {
            throw new AppError(400, `region debe ser una de: ${REGIONES.join(", ")}`);
        }
        return repo.listar((j) => j.region === region);
    }

    async function buscar(id) {
        const jugador = await repo.buscar(id);
        if (!jugador) {
            throw new AppError(404, `No existe el jugador con id ${id}`);
        }
        return jugador;
    }

    // la usa el modulo de equipos: trae varios y avisa cuales no existen
    async function buscarVarios(ids) {
        const encontrados = await repo.listar((j) => ids.includes(j.id));
        const faltan = ids.filter((id) => !encontrados.some((j) => j.id === id));
        if (faltan.length > 0) {
            throw new AppError(404, `No existen los jugadores: ${faltan.join(", ")}`);
        }
        // en el mismo orden que me pidieron
        return ids.map((id) => encontrados.find((j) => j.id === id));
    }

    async function crear(body = {}) {
        const errores = [];
        if (typeof body.gamertag !== "string" || !/^[a-zA-Z0-9_]{3,16}$/.test(body.gamertag)) {
            errores.push("gamertag debe tener de 3 a 16 letras, numeros o _");
        }
        if (!REGIONES.includes(body.region)) errores.push(`region debe ser una de: ${REGIONES.join(", ")}`);
        if (body.elo !== undefined && (!Number.isInteger(body.elo) || body.elo < 0 || body.elo > 5000)) {
            errores.push("elo debe ser un entero de 0 a 5000");
        }
        exigirSinErrores(errores);

        const repetido = await repo.listar((j) => j.gamertag.toLowerCase() === body.gamertag.toLowerCase());
        if (repetido.length > 0) {
            throw new AppError(409, `El gamertag ${body.gamertag} ya esta en uso`);
        }

        return repo.crear({ gamertag: body.gamertag, region: body.region, elo: body.elo ?? 1000 });
    }

    return { listar, buscar, buscarVarios, crear };
}
