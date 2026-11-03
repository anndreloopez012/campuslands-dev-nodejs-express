import AppError from "../utils/app-error.js";
import { getUsuarioPorToken } from "../services/auth.service.js";

// revisa el header Authorization: Bearer <token>
function requireAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const [tipo, token] = header.split(" ");

    if (tipo !== "Bearer" || !token) {
        return next(new AppError(401, "Falta el token, manda Authorization: Bearer <token>"));
    }

    const usuario = getUsuarioPorToken(token);

    if (!usuario) {
        return next(new AppError(401, "Token invalido o sesion cerrada"));
    }

    // dejo el usuario y el token en req para los controladores
    req.usuario = usuario;
    req.token = token;
    next();
}

// se usa despues de requireAuth
function requireRol(rol) {
    return function (req, res, next) {
        if (req.usuario.rol !== rol) {
            return next(new AppError(403, `Solo un usuario ${rol} puede hacer esto`));
        }
        next();
    };
}

export { requireAuth, requireRol };
