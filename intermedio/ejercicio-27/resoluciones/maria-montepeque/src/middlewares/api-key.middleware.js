import AppError from "../utils/app-error.js";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "clave-de-desarrollo";

// las rutas que cambian datos piden el header x-api-key
function requireApiKey(req, res, next) {
    const clave = req.headers["x-api-key"];

    if (!clave) {
        return next(new AppError(401, "Falta el header x-api-key"));
    }
    if (clave !== ADMIN_API_KEY) {
        return next(new AppError(403, "La x-api-key no es correcta"));
    }
    next();
}

export default requireApiKey;
