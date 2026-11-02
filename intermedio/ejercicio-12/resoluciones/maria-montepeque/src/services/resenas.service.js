import { resenas } from "../data/db.js";
import AppError from "../utils/app-error.js";
import * as peliculasService from "./peliculas.service.js";

// para darle id a las nuevas
let nextId = resenas.length + 1;

function findByPelicula(peliculaId) {
    // primero reviso que la pelicula exista, si no tira 404
    peliculasService.findById(peliculaId);
    return resenas.filter((resena) => resena.peliculaId === peliculaId);
}

function findOne(peliculaId, resenaId) {
    peliculasService.findById(peliculaId);

    if (!Number.isInteger(resenaId)) {
        throw new AppError(400, "El id de la resena debe ser un numero");
    }

    // la resena tiene que ser de esa pelicula
    const resena = resenas.find((r) => r.id === resenaId && r.peliculaId === peliculaId);

    if (!resena) {
        throw new AppError(404, `La pelicula ${peliculaId} no tiene la resena ${resenaId}`);
    }

    return resena;
}

function create(peliculaId, body) {
    peliculasService.findById(peliculaId);

    const { autor, puntuacion, comentario } = body || {};
    const errors = [];

    if (typeof autor !== "string" || autor.trim() === "") {
        errors.push("autor es obligatorio");
    }
    if (!Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
        errors.push("puntuacion debe ser un numero entero del 1 al 5");
    }
    if (comentario !== undefined && typeof comentario !== "string") {
        errors.push("comentario debe ser texto");
    }

    if (errors.length > 0) {
        throw new AppError(400, "Datos invalidos", errors);
    }

    const nueva = {
        id: nextId++,
        peliculaId,
        autor: autor.trim(),
        puntuacion,
        comentario: comentario ? comentario.trim() : ""
    };

    resenas.push(nueva);
    return nueva;
}

function remove(peliculaId, resenaId) {
    const resena = findOne(peliculaId, resenaId);
    const index = resenas.indexOf(resena);
    resenas.splice(index, 1);
}

export { findByPelicula, findOne, create, remove };
