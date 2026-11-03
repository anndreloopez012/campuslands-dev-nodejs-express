import AppError from "../utils/app-error.js";
import { parsearId } from "../utils/validar.js";
import { validarPartidoNuevo } from "../validators/partido.validator.js";

export function crearPartidosService({ partidos, equiposService }) {
    const jugoElPartido = (id) => (p) => p.localId === id || p.visitanteId === id;

    function listar(equipoId) {
        if (equipoId === undefined) return partidos.listar();
        return partidos.listar(jugoElPartido(parsearId(equipoId)));
    }

    function registrar(body) {
        validarPartidoNuevo(body);
        const { localId, visitanteId, golesLocal, golesVisitante } = body;

        if (localId === visitanteId) {
            throw new AppError(400, "Un equipo no puede jugar contra si mismo");
        }

        // buscar ya tira el 404 con el mismo mensaje de antes
        const local = equiposService.buscar(localId);
        const visitante = equiposService.buscar(visitanteId);

        if (local.modalidad !== visitante.modalidad) {
            throw new AppError(400, "Un equipo de futbol no puede jugar contra uno de futsal");
        }

        return partidos.agregar({ localId, visitanteId, golesLocal, golesVisitante });
    }

    return { listar, registrar };
}
