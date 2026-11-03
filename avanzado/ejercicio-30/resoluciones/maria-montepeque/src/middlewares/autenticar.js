import { ErrorApp } from "../utils/errores.js";

// lee "Authorization: Bearer <token>" y deja el usuario en req.usuario
export function autenticar(authService) {
    return (req, res, next) => {
        const [tipo, token] = (req.get("Authorization") ?? "").split(" ");
        if (tipo !== "Bearer" || !token) return next(new ErrorApp(401, "Falta el token (Authorization: Bearer ...)"));
        try {
            req.usuario = authService.verificar(token);
            next();
        } catch (err) {
            next(err);
        }
    };
}

// deja pasar solo a ciertos roles (admin siempre pasa)
export const permitir = (...roles) => (req, res, next) => {
    if (req.usuario.rol === "admin" || roles.includes(req.usuario.rol)) return next();
    next(new ErrorApp(403, `Esta accion es para: ${roles.join(", ")}`));
};
