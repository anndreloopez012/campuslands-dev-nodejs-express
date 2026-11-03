import AppError from "../utils/app-error.js";
import { MODALIDADES } from "../constants.js";
import { validarEquipoNuevo, validarEquipoEditado, MSG_MODALIDAD } from "../validators/equipo.validator.js";

export function crearEquiposService({ equipos, partidos }) {
    function exigirModalidad(modalidad) {
        if (!MODALIDADES.includes(modalidad)) {
            throw new AppError(400, MSG_MODALIDAD);
        }
    }

    function buscar(id) {
        const equipo = equipos.buscar(id);
        if (!equipo) {
            throw new AppError(404, `No existe el equipo con id ${id}`);
        }
        return equipo;
    }

    // antes esta comparacion estaba en POST y en PUT casi igual
    function exigirNombreLibre(nombre, modalidad, idQueSeEdita = null) {
        const repetido = equipos.existe(
            (e) => e.id !== idQueSeEdita && e.modalidad === modalidad && e.nombre.toLowerCase() === nombre.toLowerCase()
        );
        if (repetido) {
            throw new AppError(409, `Ya existe ${nombre} en ${modalidad}`);
        }
    }

    function listar(modalidad) {
        if (modalidad === undefined) return equipos.listar();
        exigirModalidad(modalidad);
        return equipos.listar((e) => e.modalidad === modalidad);
    }

    function crear(body) {
        validarEquipoNuevo(body);
        const nombre = body.nombre.trim();
        exigirNombreLibre(nombre, body.modalidad);

        return equipos.agregar({ nombre, modalidad: body.modalidad, ciudad: body.ciudad.trim() });
    }

    function editar(id, body) {
        const equipo = buscar(id);
        validarEquipoEditado(body, equipo.modalidad);
        const nombre = body.nombre.trim();
        exigirNombreLibre(nombre, equipo.modalidad, id);

        equipo.nombre = nombre;
        equipo.ciudad = body.ciudad.trim();
        return equipo;
    }

    function borrar(id) {
        buscar(id);
        const jugo = partidos.existe((p) => p.localId === id || p.visitanteId === id);
        if (jugo) {
            throw new AppError(409, "No se puede borrar un equipo que ya jugo partidos");
        }
        equipos.quitar(id);
    }

    return { listar, buscar, crear, editar, borrar, exigirModalidad };
}
