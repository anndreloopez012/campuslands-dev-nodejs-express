import { ErrorApp } from "../utils/errores.js";

export function noEncontrada(req, res) {
    res.status(404).json({ ok: false, message: "Ruta no encontrada" });
}

// manejador final: todo error termina aqui con el mismo formato
export function manejarErrores(log) {
    return (err, req, res, next) => {
        if (err.type === "entity.parse.failed") return res.status(400).json({ ok: false, message: "El body no es un JSON valido" });
        if (err.type === "entity.too.large") return res.status(413).json({ ok: false, message: "El body es muy grande" });
        if (err instanceof ErrorApp) return res.status(err.status).json({ ok: false, message: err.message, ...(err.errores && { errors: err.errores }) });
        log({ nivel: "error", mensaje: err.message, stack: err.stack, ruta: req.originalUrl });
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    };
}
