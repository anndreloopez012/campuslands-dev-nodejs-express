import { randomUUID } from "node:crypto";
import { error } from "../dominio/errores.js";
import { aProblema } from "./problemas.js";

export function requestId(req, res, next) {
    req.id = randomUUID();
    res.set("X-Request-Id", req.id);
    next();
}

// los errores de express (JSON roto) y las rutas que no existen
// tambien salen como Problem Details, asi el cliente siempre lee el mismo formato
export function rutaNoEncontrada(req, res) {
    const problema = {
        type: "/api/errores/ruta-no-encontrada",
        title: "Ruta no encontrada",
        status: 404,
        detail: `La ruta ${req.method} ${req.originalUrl} no existe`,
        instance: req.originalUrl,
        code: "RUTA_NO_ENCONTRADA",
        requestId: req.id
    };
    res.status(404).type("application/problem+json").json(problema);
}

// guardo los errores 500 aqui para que los tests puedan revisar que se registran
export const registro = [];

export function manejarErrores(err, req, res, next) {
    // JSON mal escrito lo convierto en un error del catalogo
    if (err.type === "entity.parse.failed") {
        err = error("DATOS_INVALIDOS", "El body no es un JSON valido", { errores: ["body: JSON mal escrito"] });
    }

    const problema = aProblema(err, req);

    if (problema.status === 500) {
        // el detalle real solo va al log, con el requestId para buscarlo
        registro.push({ requestId: req.id, mensaje: err.message });
        if (process.env.NODE_ENV !== "test") {
            console.error(`[${req.id}]`, err);
        }
    }

    res.status(problema.status).type("application/problem+json").json(problema);
}
