import AppError from "./app-error.js";

// cosas que usan todos los modulos

// express 4 no atrapa errores async
export const asyncHandler = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

export function parsearId(texto) {
    const id = Number(texto);
    if (!Number.isInteger(id) || id < 1) {
        throw new AppError(400, "El id debe ser un numero entero positivo");
    }
    return id;
}

export function exigirSinErrores(errores) {
    if (errores.length > 0) {
        throw new AppError(400, "Datos invalidos", errores);
    }
}

export function rutaNoEncontrada(req, res) {
    res.status(404).json({ ok: false, message: `La ruta ${req.method} ${req.originalUrl} no existe` });
}

export function manejarErrores(error, req, res, next) {
    if (error.type === "entity.parse.failed") {
        return res.status(400).json({ ok: false, message: "El body no es un JSON valido" });
    }
    if (error.statusCode) {
        const body = { ok: false, message: error.message };
        if (error.errors) body.errors = error.errors;
        return res.status(error.statusCode).json(body);
    }
    console.error(error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
}
