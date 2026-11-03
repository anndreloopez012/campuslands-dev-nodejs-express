import AppError from "../utils/app-error.js";
import { verificarToken, buscarUsuario } from "../services/auth.service.js";

// 401: falta el token o no sirve (ejercicio 16)
export function requireAuth(req, res, next) {
    const [tipo, token] = (req.headers.authorization || "").split(" ");

    if (tipo !== "Bearer" || !token) {
        return next(new AppError(401, "Falta el token, manda Authorization: Bearer <token>"));
    }

    try {
        const payload = verificarToken(token);

        // si borraron al usuario despues de dar el token, ya no sirve
        const usuario = buscarUsuario(payload.sub);
        if (!usuario) {
            return next(new AppError(401, "El usuario del token ya no existe"));
        }

        req.usuario = usuario;
        next();
    } catch (error) {
        next(error);
    }
}

// 403: el token esta bien pero el rol no alcanza (ejercicio 17)
export function requireRol(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.usuario.rol)) {
            return next(new AppError(403, `Necesitas ser ${roles.join(" o ")} para esto`));
        }
        next();
    };
}
