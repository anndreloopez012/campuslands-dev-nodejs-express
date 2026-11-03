import AppError from "../../shared/app-error.js";
import { exigirSinErrores } from "../../shared/http.js";

// torneos depende de equipos (y equipos de jugadores), siempre por su service
export function crearTorneosService({ repo, equipos }) {
    async function conInscritos(torneo) {
        const inscritos = await Promise.all(torneo.equipoIds.map((id) => equipos.buscar(id)));
        return {
            ...torneo,
            cuposLibres: torneo.cupo - torneo.equipoIds.length,
            equipos: inscritos.map(({ id, nombre, eloPromedio }) => ({ id, nombre, eloPromedio }))
        };
    }

    async function listar() {
        return Promise.all((await repo.listar()).map(conInscritos));
    }

    async function buscarCrudo(id) {
        const torneo = await repo.buscar(id);
        if (!torneo) {
            throw new AppError(404, `No existe el torneo con id ${id}`);
        }
        return torneo;
    }

    async function buscar(id) {
        return conInscritos(await buscarCrudo(id));
    }

    async function crear(body = {}) {
        const errores = [];
        if (typeof body.nombre !== "string" || body.nombre.trim().length < 3) errores.push("nombre debe tener al menos 3 letras");
        if (![4, 8, 16].includes(body.cupo)) errores.push("cupo debe ser 4, 8 o 16");
        if (body.eloMinimo !== undefined && (!Number.isInteger(body.eloMinimo) || body.eloMinimo < 0)) {
            errores.push("eloMinimo debe ser un entero de 0 para arriba");
        }
        exigirSinErrores(errores);

        const torneo = await repo.crear({ nombre: body.nombre.trim(), cupo: body.cupo, eloMinimo: body.eloMinimo ?? 0, equipoIds: [] });
        return conInscritos(torneo);
    }

    async function inscribir(torneoId, body = {}) {
        const torneo = await buscarCrudo(torneoId);

        if (!Number.isInteger(body.equipoId)) {
            throw new AppError(400, "Datos invalidos", ["equipoId debe ser un numero entero"]);
        }

        const equipo = await equipos.buscar(body.equipoId);

        if (torneo.equipoIds.includes(equipo.id)) {
            throw new AppError(409, `${equipo.nombre} ya esta inscrito`);
        }
        if (torneo.equipoIds.length >= torneo.cupo) {
            throw new AppError(409, `El torneo ${torneo.nombre} ya esta lleno`);
        }
        if (equipo.eloPromedio < torneo.eloMinimo) {
            throw new AppError(422, `${equipo.nombre} tiene elo promedio ${equipo.eloPromedio} y el minimo es ${torneo.eloMinimo}`);
        }

        const actualizado = await repo.actualizar(torneo.id, { equipoIds: [...torneo.equipoIds, equipo.id] });
        return conInscritos(actualizado);
    }

    return { listar, buscar, crear, inscribir };
}
