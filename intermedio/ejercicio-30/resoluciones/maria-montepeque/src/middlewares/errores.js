import config from "../config.js";

// todos los errores pasan por aqui (ejercicio 07)
// la respuesta siempre tiene la misma forma y lleva el requestId

export function rutaNoEncontrada(req, res) {
    res.status(404).json({ ok: false, message: `La ruta ${req.method} ${req.originalUrl} no existe`, requestId: req.id });
}

export function manejarErrores(error, req, res, next) {
    if (error.type === "entity.parse.failed") {
        return res.status(400).json({ ok: false, message: "El body no es un JSON valido", requestId: req.id });
    }

    if (error.type === "entity.too.large") {
        return res.status(413).json({ ok: false, message: "El body es demasiado grande (maximo 20kb)", requestId: req.id });
    }

    if (error.statusCode) {
        // en el 429 del login le digo al cliente cuantos segundos esperar
        if (error.retryAfter) res.set("Retry-After", String(error.retryAfter));

        const body = { ok: false, message: error.message, requestId: req.id };
        if (error.errors) body.errors = error.errors;
        return res.status(error.statusCode).json(body);
    }

    // error que no esperaba: lo dejo en consola con el id para encontrarlo
    if (config.nodeEnv !== "test") {
        console.error(`[${req.id}]`, error);
    }
    res.status(500).json({ ok: false, message: "Error interno del servidor", requestId: req.id });
}
