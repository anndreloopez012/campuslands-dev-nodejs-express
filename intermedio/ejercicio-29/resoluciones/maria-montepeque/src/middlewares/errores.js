// antes cada ruta armaba su propio res.status(...).json({ ok: false ... })
// ahora los services tiran AppError y todo se responde aqui

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
