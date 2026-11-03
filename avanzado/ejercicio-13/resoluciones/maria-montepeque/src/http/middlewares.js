import { randomUUID } from "node:crypto";
import { correrConContexto } from "../logs/contexto.js";

// 1. cada peticion recibe un id (o usa el que manda otro servicio)
// 2. se crea un logger hijo con ese id y se guarda en el contexto
export function contextoDePeticion(logger) {
    return (req, res, next) => {
        const recibido = req.get("X-Request-Id");
        req.id = recibido && /^[\w-]{8,64}$/.test(recibido) ? recibido : randomUUID();
        res.set("X-Request-Id", req.id);

        req.log = logger.hijo({ requestId: req.id });
        correrConContexto({ logger: req.log, requestId: req.id }, next);
    };
}

// una linea de log por peticion, cuando termina
// el nivel depende del status: 5xx error, 4xx warn, el resto info
export function logDeAcceso({ umbralLentoMs = 1000 } = {}) {
    return (req, res, next) => {
        const inicio = process.hrtime.bigint();

        res.on("finish", () => {
            const duracionMs = Number(process.hrtime.bigint() - inicio) / 1e6;
            const nivel = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : duracionMs > umbralLentoMs ? "warn" : "info";

            req.log[nivel]("peticion terminada", {
                metodo: req.method,
                ruta: req.originalUrl,
                status: res.statusCode,
                duracionMs: Math.round(duracionMs * 10) / 10,
                bytes: Number(res.get("Content-Length") || 0),
                lenta: duracionMs > umbralLentoMs,
                // el header Authorization lo tapa el redactor
                headers: { "user-agent": req.get("User-Agent"), authorization: req.get("Authorization") }
            });
        });

        next();
    };
}

export function manejarErrores(err, req, res, next) {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ ok: false, message: "El body no es un JSON valido", requestId: req.id });
    }
    if (err.status) {
        return res.status(err.status).json({ ok: false, message: err.message, requestId: req.id, ...(err.errores && { errors: err.errores }) });
    }

    // error inesperado: el detalle con el stack va SOLO al log
    req.log.error("error no controlado", { error: err, ruta: req.originalUrl });
    res.status(500).json({ ok: false, message: "Error interno. Si se repite, comparte el requestId.", requestId: req.id });
}
