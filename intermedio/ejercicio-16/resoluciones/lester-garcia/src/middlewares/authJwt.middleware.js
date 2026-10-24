import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../utils/customErrors.js";

export const verifyJwt = (req, res, next)=> {
    const authHeader = req.headers.authorization;

    if (!authHeader || typeof authHeader !== "string"){
        return next(new UnauthorizedError("Encabezado de autorizacion ausente. Formato: 'Bearer <token>'."));

    }

    const parts = authHeader.split(" ");

    if(parts.length !== 2 || parts[0] !== "Bearer"){
        return next(new UnauthorizedError("Esquema invalido.Utilice el formato Bearer"));

    }

    const token = parts[1];
    const secret = process.env.JWT_SECRET || "fallback_default_secret_jwt_2026";

    try {
        const decoded = jwt.verify(token, secret);

        req.user = {
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role
        };

        next();

    }catch (err){
        if (err.name === "TokenExpiredError"){
            return next ( new UnauthorizedError("Token JWT invalido o firma digital corrupta."));
        }

        return next(new UnauthorizedError("Fallo de autenticacion."));
    }
};