import { randomUUID } from "node:crypto";
import { db } from "../data/db.js";
import AppError from "../utils/app-error.js";

// login simulado: solo se pide el gamertag, no hay password
function login(body) {
    const { gamertag } = body || {};

    if (typeof gamertag !== "string" || !/^[a-zA-Z0-9_]{3,16}$/.test(gamertag)) {
        throw new AppError(400, "gamertag debe tener de 3 a 16 letras, numeros o _");
    }

    const token = randomUUID();
    db.sesiones.set(token, gamertag);
    return { token, gamertag };
}

function jugadorDelToken(token) {
    return db.sesiones.get(token) || null;
}

export { login, jugadorDelToken };
