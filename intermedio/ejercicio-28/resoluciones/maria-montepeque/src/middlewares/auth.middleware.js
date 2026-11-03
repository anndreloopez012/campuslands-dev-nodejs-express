import AppError from "../utils/app-error.js";
import { jugadorDelToken } from "../services/auth.service.js";

// pide Authorization: Bearer <token> y deja el gamertag en req.jugador
function requireAuth(req, res, next) {
    const [tipo, token] = (req.headers.authorization || "").split(" ");

    if (tipo !== "Bearer" || !token) {
        return next(new AppError(401, "Falta el token, haz login primero"));
    }

    const jugador = jugadorDelToken(token);
    if (!jugador) {
        return next(new AppError(401, "Token invalido"));
    }

    req.jugador = jugador;
    next();
}

export default requireAuth;
