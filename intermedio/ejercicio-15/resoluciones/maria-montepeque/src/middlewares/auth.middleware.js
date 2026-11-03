import AppError from "../utils/app-error.js";
import { verificarToken } from "../services/auth.service.js";

// lee Authorization: Bearer <token> y valida el jwt
function requireAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const [tipo, token] = header.split(" ");

    if (tipo !== "Bearer" || !token) {
        return next(new AppError(401, "Falta el token, manda Authorization: Bearer <token>"));
    }

    try {
        // dejo los datos del token en req.usuario
        req.usuario = verificarToken(token);
        next();
    } catch (error) {
        next(error);
    }
}

export default requireAuth;
