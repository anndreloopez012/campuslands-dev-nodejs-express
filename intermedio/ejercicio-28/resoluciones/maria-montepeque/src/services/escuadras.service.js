import { db } from "../data/db.js";
import AppError from "../utils/app-error.js";

const MAX_MIEMBROS = 4;

function idValido(id) {
    if (!Number.isInteger(id) || id < 1) {
        throw new AppError(400, "El id debe ser un numero entero positivo");
    }
}

function findById(id) {
    idValido(id);
    const escuadra = db.escuadras.find((e) => e.id === id);
    if (!escuadra) {
        throw new AppError(404, `No existe la escuadra con id ${id}`);
    }
    return escuadra;
}

// un jugador solo puede estar en una escuadra
function escuadraDe(gamertag) {
    return db.escuadras.find((e) => e.miembros.includes(gamertag)) || null;
}

function crear(body, gamertag) {
    const { nombre } = body || {};

    if (typeof nombre !== "string" || nombre.trim().length < 3 || nombre.trim().length > 20) {
        throw new AppError(400, "nombre debe tener entre 3 y 20 letras");
    }
    if (escuadraDe(gamertag)) {
        throw new AppError(409, `${gamertag} ya esta en otra escuadra`);
    }

    // el que la crea es el lider y el primer miembro
    const escuadra = { id: db.siguienteEscuadra++, nombre: nombre.trim(), lider: gamertag, miembros: [gamertag] };
    db.escuadras.push(escuadra);
    return escuadra;
}

function unirse(id, gamertag) {
    const escuadra = findById(id);

    if (escuadraDe(gamertag)) {
        throw new AppError(409, `${gamertag} ya esta en otra escuadra`);
    }
    if (escuadra.miembros.length >= MAX_MIEMBROS) {
        throw new AppError(409, `La escuadra ${escuadra.nombre} esta llena (${MAX_MIEMBROS})`);
    }

    escuadra.miembros.push(gamertag);
    return escuadra;
}

export { findById, crear, unirse, MAX_MIEMBROS };
