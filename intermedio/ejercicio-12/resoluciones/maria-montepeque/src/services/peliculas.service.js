import { peliculas } from "../data/db.js";
import AppError from "../utils/app-error.js";

function findAll() {
    return peliculas;
}

function findById(id) {
    // si mandan /peliculas/abc el id queda NaN
    if (!Number.isInteger(id)) {
        throw new AppError(400, "El id de la pelicula debe ser un numero");
    }

    const pelicula = peliculas.find((pelicula) => pelicula.id === id);

    if (!pelicula) {
        throw new AppError(404, `No existe la pelicula con id ${id}`);
    }

    return pelicula;
}

export { findAll, findById };
