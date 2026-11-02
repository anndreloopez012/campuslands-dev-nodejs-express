import { libros } from "../data/db.js";
import AppError from "../utils/app-error.js";

let nextId = libros.length + 1;

function findAll() {
    return libros;
}

function findById(id) {
    if (!Number.isInteger(id)) {
        throw new AppError(400, "El id del libro debe ser un numero");
    }

    const libro = libros.find((libro) => libro.id === id);

    if (!libro) {
        throw new AppError(404, `No existe el libro con id ${id}`);
    }

    return libro;
}

function create(body, usuarioId) {
    const { titulo, autor, anio } = body || {};
    const errors = [];

    if (typeof titulo !== "string" || titulo.trim() === "") {
        errors.push("titulo es obligatorio");
    }
    if (typeof autor !== "string" || autor.trim() === "") {
        errors.push("autor es obligatorio");
    }
    if (anio !== undefined && !Number.isInteger(anio)) {
        errors.push("anio debe ser un numero entero");
    }

    if (errors.length > 0) {
        throw new AppError(400, "Datos invalidos", errors);
    }

    // guardo quien lo creo, sale del token
    const nuevo = {
        id: nextId++,
        titulo: titulo.trim(),
        autor: autor.trim(),
        anio: anio ?? null,
        creadoPor: usuarioId
    };

    libros.push(nuevo);
    return nuevo;
}

function remove(id) {
    const libro = findById(id);
    libros.splice(libros.indexOf(libro), 1);
}

export { findAll, findById, create, remove };
