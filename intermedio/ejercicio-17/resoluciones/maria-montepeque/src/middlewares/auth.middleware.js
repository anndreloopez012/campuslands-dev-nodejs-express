import AppError from "../utils/app-error.js";
import { verificarToken } from "../services/auth.service.js";
import { tienePermiso } from "../config/permisos.js";

// 401 si no hay token o no sirve
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

// 403 si el rol no tiene ninguno de los permisos que pide la ruta
// basta con tener uno, ej requirePermiso("tours:editar", "tours:editar_propios")
function requirePermiso(...permisos) {
    return function (req, res, next) {
        const loTiene = permisos.some((p) => tienePermiso(req.usuario.rol, p));

        if (!loTiene) {
            return next(new AppError(403, `Tu rol (${req.usuario.rol}) no tiene permiso: ${permisos.join(" o ")}`));
        }
        next();
    };
}

export { requireAuth, requirePermiso };
