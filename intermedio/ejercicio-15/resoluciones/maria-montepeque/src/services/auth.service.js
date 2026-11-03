import jwt from "jsonwebtoken";
import config from "../config.js";
import { usuarios } from "../data/db.js";
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

    // en el payload van datos que no son secretos, el token se puede leer
    const payload = { sub: usuario.id, nombre: usuario.nombre, email: usuario.email };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

    return { token, expiresIn: config.jwtExpiresIn };
}

// devuelve el payload o tira 401
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
