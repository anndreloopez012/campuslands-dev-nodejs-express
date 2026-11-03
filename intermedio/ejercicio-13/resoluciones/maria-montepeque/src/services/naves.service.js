import { naves, tripulantes } from "../data/db.js";
import AppError from "../utils/app-error.js";

function findAll() {
    // le agrego cuantos tripulantes tiene cada nave
    return naves.map((nave) => ({
        ...nave,
        totalTripulantes: tripulantes.filter((t) => t.naveId === nave.id).length
    }));
}

function findById(id) {
    if (!Number.isInteger(id)) {
        throw new AppError(400, "El id de la nave debe ser un numero");
    }

    const nave = naves.find((nave) => nave.id === id);

    if (!nave) {
        throw new AppError(404, `No existe la nave con id ${id}`);
    }

    return nave;
}

// la nave con su lista de tripulantes adentro
function findWithTripulantes(id) {
    const nave = findById(id);
    const lista = tripulantes.filter((t) => t.naveId === id);
    return { ...nave, tripulantes: lista };
}

function remove(id) {
    findById(id);

    // no dejo borrar una nave que todavia tiene gente
    const tieneGente = tripulantes.some((t) => t.naveId === id);
    if (tieneGente) {
        throw new AppError(409, `La nave ${id} tiene tripulantes, primero hay que moverlos o borrarlos`);
    }

    const index = naves.findIndex((nave) => nave.id === id);
    naves.splice(index, 1);
}

export { findAll, findById, findWithTripulantes, remove };
