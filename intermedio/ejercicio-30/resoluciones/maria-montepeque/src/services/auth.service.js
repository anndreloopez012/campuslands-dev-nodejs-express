import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config.js";
import { db } from "../data/db.js";
import AppError from "../utils/app-error.js";

export const ROLES = ["recepcion", "mecanico", "admin"];

function publico({ passwordHash, ...usuario }) {
    return usuario;
}

// si un email ya fallo muchas veces seguidas lo bloqueo un rato (ejercicio 21)
function revisarBloqueo(email) {
    const intento = db.intentosLogin.get(email);
    if (!intento) return;

    const pasado = Date.now() - intento.desde;
    if (pasado >= config.loginBloqueoMs) {
        db.intentosLogin.delete(email);
        return;
    }

    if (intento.fallidos >= config.loginMaxIntentos) {
        const segundos = Math.ceil((config.loginBloqueoMs - pasado) / 1000);
        const error = new AppError(429, `Demasiados intentos fallidos, espera ${Math.ceil(segundos / 60)} minutos`);
        error.retryAfter = segundos;
        throw error;
    }
}

function sumarFallo(email) {
    const intento = db.intentosLogin.get(email) || { fallidos: 0, desde: Date.now() };
    intento.fallidos++;
    db.intentosLogin.set(email, intento);
}

export async function login(body) {
    const { email, password } = body || {};

    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
        throw new AppError(400, "email y password son obligatorios");
    }

    const emailLimpio = email.trim().toLowerCase();
    revisarBloqueo(emailLimpio);

    const usuario = db.usuarios.find((u) => u.email === emailLimpio);
    // comparo contra el hash (ejercicio 18), mismo mensaje si no existe el email
    const coincide = usuario ? await bcrypt.compare(password, usuario.passwordHash) : false;

    if (!coincide) {
        sumarFallo(emailLimpio);
        throw new AppError(401, "Credenciales incorrectas");
    }

    db.intentosLogin.delete(emailLimpio);

    // en el token va lo minimo para saber quien es y su rol (ejercicio 15)
    const token = jwt.sign({ sub: usuario.id, rol: usuario.rol, nombre: usuario.nombre }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn
    });

    return { token, usuario: publico(usuario) };
}

export function verificarToken(token) {
    try {
        return jwt.verify(token, config.jwtSecret);
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new AppError(401, "El token expiro, vuelve a hacer login");
        }
        throw new AppError(401, "Token invalido");
    }
}

export function buscarUsuario(id) {
    const usuario = db.usuarios.find((u) => u.id === id);
    return usuario ? publico(usuario) : null;
}
