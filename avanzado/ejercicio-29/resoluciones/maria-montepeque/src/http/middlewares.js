import { randomUUID } from "node:crypto";

// id de peticion: si el proxy ya mando uno se usa, si no se crea
export function requestId(req, res, next) {
    const recibido = req.get("X-Request-Id");
    req.id = recibido && /^[\w-]{8,64}$/.test(recibido) ? recibido : randomUUID();
    res.set("X-Request-Id", req.id);
    next();
}

// log de acceso en JSON, una linea por peticion (facil de buscar en la nube)
export function logAcceso(escribir) {
    return (req, res, next) => {
        const t0 = performance.now();
        res.on("finish", () => {
            escribir({
                nivel: res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info",
                fecha: new Date().toISOString(),
                requestId: req.id,
                metodo: req.method,
                ruta: req.originalUrl.split("?")[0],
                status: res.statusCode,
                ms: Number((performance.now() - t0).toFixed(1)),
                ip: req.ip
            });
        });
        next();
    };
}

// cabeceras de seguridad basicas
export function seguridad(req, res, next) {
    res.set({
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "no-referrer",
        "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'"
    });
    res.removeHeader("X-Powered-By");
    next();
}

// limite de peticiones por ip por minuto (ventana fija, en memoria)
export function limitePorIp({ porMinuto, reloj = Date.now }) {
    const contadores = new Map();
    return (req, res, next) => {
        const ventana = Math.floor(reloj() / 60_000);
        const clave = `${req.ip}:${ventana}`;
        const usadas = (contadores.get(clave) ?? 0) + 1;
        contadores.set(clave, usadas);
        // limpio ventanas viejas para que el Map no crezca para siempre
        if (contadores.size > 10_000) for (const k of contadores.keys()) if (!k.endsWith(`:${ventana}`)) contadores.delete(k);

        res.set("RateLimit-Limit", String(porMinuto));
        res.set("RateLimit-Remaining", String(Math.max(0, porMinuto - usadas)));
        if (usadas > porMinuto) {
            res.set("Retry-After", String(60 - Math.floor((reloj() % 60_000) / 1000)));
            return res.status(429).json({ ok: false, message: "Demasiadas peticiones, espera un momento" });
        }
        next();
    };
}
