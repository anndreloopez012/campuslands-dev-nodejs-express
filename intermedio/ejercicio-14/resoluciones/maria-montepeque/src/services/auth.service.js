import { randomUUID } from "node:crypto";
import { usuarios, sesiones } from "../data/db.js";
import AppError from "../utils/app-error.js";

// quito la password antes de devolver el usuario
function sinPassword(usuario) {
    const { password, ...resto } = usuario;
    return resto;
}

function login(body) {
    const { email, password } = body || {};

    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
        throw new AppError(400, "email y password son obligatorios");
    }

    const usuario = usuarios.find((u) => u.email === email.trim().toLowerCase());

    // mismo mensaje para los dos casos, asi no se sabe si el email existe
    if (!usuario || usuario.password !== password) {
        throw new AppError(401, "Credenciales incorrectas");
    }

    // el token es solo un uuid guardado en memoria
    const token = randomUUID();
    sesiones.set(token, usuario.id);

    return { token, usuario: sinPassword(usuario) };
}

function getUsuarioPorToken(token) {
    const usuarioId = sesiones.get(token);
    if (!usuarioId) return null;

    const usuario = usuarios.find((u) => u.id === usuarioId);
    return usuario ? sinPassword(usuario) : null;
}

function logout(token) {
    sesiones.delete(token);
}

export { login, getUsuarioPorToken, logout };
