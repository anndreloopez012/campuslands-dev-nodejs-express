import { obras } from "../data/db.js";
import AppError from "../utils/app-error.js";

let nextId = obras.length + 1;

const PROGRAMAS = ["Procreate", "Krita", "Photoshop", "Aseprite", "Clip Studio"];

function findAll() {
    return obras;
}

function findPublicas() {
    // en la galeria no muestro si es publica, ya se sabe
    return obras.filter((o) => o.publica).map(({ publica, ...resto }) => resto);
}

function create(body) {
    const { titulo, artista, programa, publica } = body || {};
    const errors = [];

    if (typeof titulo !== "string" || titulo.trim() === "") errors.push("titulo es obligatorio");
    if (typeof artista !== "string" || artista.trim() === "") errors.push("artista es obligatorio");
    if (!PROGRAMAS.includes(programa)) errors.push(`programa debe ser uno de: ${PROGRAMAS.join(", ")}`);
    if (publica !== undefined && typeof publica !== "boolean") errors.push("publica debe ser true o false");

    if (errors.length > 0) {
        throw new AppError(400, "Datos invalidos", errors);
    }

    const nueva = { id: nextId++, titulo: titulo.trim(), artista: artista.trim(), programa, publica: publica ?? false };
    obras.push(nueva);
    return nueva;
}

function remove(id) {
    if (!Number.isInteger(id)) {
        throw new AppError(400, "El id de la obra debe ser un numero");
    }

    const index = obras.findIndex((o) => o.id === id);
    if (index === -1) {
        throw new AppError(404, `No existe la obra con id ${id}`);
    }

    obras.splice(index, 1);
}

export { findAll, findPublicas, create, remove };
