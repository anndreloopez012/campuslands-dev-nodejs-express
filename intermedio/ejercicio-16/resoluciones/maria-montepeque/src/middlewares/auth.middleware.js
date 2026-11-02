import AppError from "../utils/app-error.js";
import { verificarToken } from "../services/auth.service.js";

// 401: no se quien eres
function requireAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const [tipo, token] = header.split(" ");

    if (tipo !== "Bearer" || !token) {
        return next(new AppError(401, "Falta el token, manda Authorization: Bearer <token>"));
    }

    try {
        req.usuario = verificarToken(token);
        next();
    } catch (error) {
        next(error);
    }
}

// 403: se quien eres pero no te toca
// se puede pasar mas de un rol, ej requireRol("admin", "vendedor")
function requireRol(...roles) {
    return function (req, res, next) {
        if (!roles.includes(req.usuario.rol)) {
            return next(new AppError(403, `Necesitas rol ${roles.join(" o ")} para entrar aqui`));
        }
        next();
    };
}

export { requireAuth, requireRol };
