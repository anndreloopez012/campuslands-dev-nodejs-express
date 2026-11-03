import bcrypt from "bcryptjs";
import config from "../config.js";
import AppError from "./app-error.js";

// reglas minimas para una password
function validarFuerza(password) {
    const errors = [];

    if (typeof password !== "string") {
        return ["password debe ser texto"];
    }
    if (password.length < 8) errors.push("password debe tener al menos 8 caracteres");
    if (!/[a-zA-Z]/.test(password)) errors.push("password debe tener al menos una letra");
    if (!/[0-9]/.test(password)) errors.push("password debe tener al menos un numero");

    return errors;
}

// bcrypt genera un salt nuevo cada vez, por eso la misma clave da hashes distintos
async function hashPassword(password) {
    return bcrypt.hash(password, config.bcryptRounds);
}

// bcrypt saca el salt del hash guardado y compara
async function compararPassword(password, hash) {
    return bcrypt.compare(password, hash);
}

function exigirFuerza(password) {
    const errors = validarFuerza(password);
    if (errors.length > 0) {
        throw new AppError(400, "La password no es segura", errors);
    }
}

export { validarFuerza, exigirFuerza, hashPassword, compararPassword };
