import config from "../config/env.js";
import AppError from "../utils/app-error.js";

// compara el header x-api-key con la clave del .env
function requireApiKey(req, res, next) {
    const clave = req.headers["x-api-key"];

    if (!clave) {
        return next(new AppError(401, "Falta el header x-api-key"));
    }
    if (clave !== config.adminApiKey) {
        return next(new AppError(403, "La x-api-key no es correcta"));
    }
    next();
}

export default requireApiKey;
