import { naves, tripulantes } from "../data/db.js";
import AppError from "../utils/app-error.js";

let nextId = tripulantes.length + 1;

// cambio naveId por el objeto nave (como un join)
function conNave(tripulante) {
    const nave = naves.find((nave) => nave.id === tripulante.naveId);
    return {
        id: tripulante.id,
        nombre: tripulante.nombre,
        rol: tripulante.rol,
        nave: nave ? { id: nave.id, nombre: nave.nombre } : null
    };
}

function findAll() {
    return tripulantes.map(conNave);
}

function findById(id) {
    if (!Number.isInteger(id)) {
        throw new AppError(400, "El id del tripulante debe ser un numero");
    }

    const tripulante = tripulantes.find((t) => t.id === id);

    if (!tripulante) {
        throw new AppError(404, `No existe el tripulante con id ${id}`);
    }

    return conNave(tripulante);
}

function create(body) {
    const { nombre, rol, naveId } = body || {};
    const errors = [];

    if (typeof nombre !== "string" || nombre.trim() === "") {
        errors.push("nombre es obligatorio");
    }
    if (typeof rol !== "string" || rol.trim() === "") {
        errors.push("rol es obligatorio");
    }
    if (!Number.isInteger(naveId)) {
        errors.push("naveId debe ser un numero entero");
    }

    if (errors.length > 0) {
        throw new AppError(400, "Datos invalidos", errors);
    }

    // la relacion tiene que apuntar a una nave que exista
    const existeNave = naves.some((nave) => nave.id === naveId);
    if (!existeNave) {
        throw new AppError(400, `No se puede asignar a la nave ${naveId} porque no existe`);
    }

    const nuevo = { id: nextId++, nombre: nombre.trim(), rol: rol.trim(), naveId };
    tripulantes.push(nuevo);
    return conNave(nuevo);
}

function remove(id) {
    findById(id);
    const index = tripulantes.findIndex((t) => t.id === id);
    tripulantes.splice(index, 1);
}

export { findAll, findById, create, remove };
