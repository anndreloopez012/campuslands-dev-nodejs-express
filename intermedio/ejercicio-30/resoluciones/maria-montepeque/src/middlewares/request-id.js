import { randomUUID } from "node:crypto";

// cada peticion lleva un id para poder buscarla en los logs (ejercicio 08)
// si el cliente manda uno valido lo reuso, si no creo uno nuevo
export default function requestId(req, res, next) {
    const recibido = req.headers["x-request-id"];
    req.id = typeof recibido === "string" && /^[\w-]{8,64}$/.test(recibido) ? recibido : randomUUID();
    res.set("X-Request-Id", req.id);
    next();
}
