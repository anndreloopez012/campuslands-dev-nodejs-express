import { tours, usuarios } from "../data/db.js";
import { tienePermiso } from "../config/permisos.js";
import AppError from "../utils/app-error.js";

let nextId = tours.length + 1;

function findAll() {
    return tours;
}

function findById(id) {
    if (!Number.isInteger(id)) {
        throw new AppError(400, "El id del tour debe ser un numero");
    }

    const tour = tours.find((t) => t.id === id);

    if (!tour) {
        throw new AppError(404, `No existe el tour con id ${id}`);
    }

    return tour;
}

// valida los campos, si parcial es true solo revisa los que vienen
function validar(body, parcial) {
    const { nombre, destino, precio, cupos, guiaId } = body;
    const errors = [];

    if (!parcial || nombre !== undefined) {
        if (typeof nombre !== "string" || nombre.trim() === "") errors.push("nombre es obligatorio");
    }
    if (!parcial || destino !== undefined) {
        if (typeof destino !== "string" || destino.trim() === "") errors.push("destino es obligatorio");
    }
    if (!parcial || precio !== undefined) {
        if (typeof precio !== "number" || precio <= 0) errors.push("precio debe ser mayor a 0");
    }
    if (!parcial || cupos !== undefined) {
        if (!Number.isInteger(cupos) || cupos < 0) errors.push("cupos debe ser un entero de 0 para arriba");
    }
    if (!parcial || guiaId !== undefined) {
        const esGuia = usuarios.some((u) => u.id === guiaId && u.rol === "guia");
        if (!esGuia) errors.push("guiaId tiene que ser de un usuario con rol guia");
    }

    if (errors.length > 0) {
        throw new AppError(400, "Datos invalidos", errors);
    }
}

function create(body) {
    validar(body || {}, false);
    const { nombre, destino, precio, cupos, guiaId } = body;
    const nuevo = { id: nextId++, nombre: nombre.trim(), destino: destino.trim(), precio, cupos, guiaId };
    tours.push(nuevo);
    return nuevo;
}

function update(id, body, usuario) {
    const tour = findById(id);

    // el admin edita cualquiera, el guia solo los suyos
    const puedeTodos = tienePermiso(usuario.rol, "tours:editar");
    if (!puedeTodos && tour.guiaId !== usuario.sub) {
        throw new AppError(403, "Solo puedes editar los tours donde eres el guia");
    }

    const cambios = body || {};

    // el guia no se puede cambiar de tour a si mismo ni pasarlo a otro
    if (!puedeTodos && cambios.guiaId !== undefined) {
        throw new AppError(403, "Solo el admin puede cambiar el guia de un tour");
    }

    validar(cambios, true);

    for (const campo of ["nombre", "destino", "precio", "cupos", "guiaId"]) {
        if (cambios[campo] !== undefined) tour[campo] = cambios[campo];
    }

    return tour;
}

function remove(id) {
    const tour = findById(id);
    tours.splice(tours.indexOf(tour), 1);
}

export { findAll, findById, create, update, remove };
