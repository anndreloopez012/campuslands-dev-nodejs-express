import AppError from "../utils/app-error.js";

// solo el game master (GM) puede borrar personajes
// manda Authorization: Bearer <token del gm>
function requireGm(tokenGm) {
    return function (req, res, next) {
        const header = req.headers.authorization || "";
        const [tipo, token] = header.split(" ");

        if (tipo !== "Bearer" || !token) {
            return next(new AppError(401, "Falta el token del GM"));
        }
        if (token !== tokenGm) {
            return next(new AppError(403, "Ese token no es del GM"));
        }
        next();
    };
}

export default requireGm;
