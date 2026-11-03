import jwt from "jsonwebtoken";
import config from "../config.js";
import { usuarios } from "../data/db.js";
import { permisosDe } from "../config/permisos.js";
import AppError from "../utils/app-error.js";

function login(body) {
    const { email, password } = body || {};

    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
        throw new AppError(400, "email y password son obligatorios");
    }

    const usuario = usuarios.find((u) => u.email === email.trim().toLowerCase());

    if (!usuario || usuario.password !== password) {
        throw new AppError(401, "Credenciales incorrectas");
    }

    // en el token solo va el rol, los permisos se buscan en el servidor
    const payload = { sub: usuario.id, nombre: usuario.nombre, rol: usuario.rol };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

    return { token, rol: usuario.rol, permisos: permisosDe(usuario.rol) };
}

function verificarToken(token) {
    try {
        return jwt.verify(token, config.jwtSecret);
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new AppError(401, "El token expiro, vuelve a hacer login");
        }
        throw new AppError(401, "Token invalido");
    }
}

export { login, verificarToken };
