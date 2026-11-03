import express from "express";
import { ColaLlena, crearLimitador } from "./concurrencia/limitador.js";
import { crearEscenas, ErrorEscena } from "./servicios/escenas.js";
import { crearRenders } from "./servicios/renders.js";

export function crearApp({ max = 2, maxCola = 4, msPorFrame = 2, maxPorUsuario = 2 } = {}) {
    const limitador = crearLimitador({ max, maxCola });
    const escenas = crearEscenas();
    const renders = crearRenders({ limitador, escenas, msPorFrame, maxPorUsuario });

    const app = express();
    app.use(express.json());

    const id = (texto) => {
        const n = Number(texto);
        if (!Number.isInteger(n) || n < 1) throw new ErrorEscena(400, "El id debe ser un entero positivo");
        return n;
    };

    app.get("/health", (req, res) => res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "concurrencia controlada" }));

    // ---- escenas con bloqueo optimista ----
    app.get("/api/escenas/:id", (req, res) => {
        const escena = escenas.ver(id(req.params.id));
        // la version va en el ETag para que el cliente la devuelva en If-Match
        res.set("ETag", `"${escena.version}"`).json({ ok: true, data: escena });
    });

    app.patch("/api/escenas/:id", (req, res) => {
        const ifMatch = req.get("If-Match");
        const version = ifMatch === undefined ? undefined : Number(ifMatch.replaceAll('"', ""));
        const escena = escenas.actualizar(id(req.params.id), req.body, version);
        res.set("ETag", `"${escena.version}"`).json({ ok: true, data: escena });
    });

    // ---- renders con limite de concurrencia ----
    app.post("/api/escenas/:id/renders", (req, res) => {
        const usuario = req.get("X-Usuario") || "anonimo";
        const trabajo = renders.encolar(usuario, id(req.params.id));
        res.status(202).set("Location", `/api/renders/${trabajo.id}`).json({ ok: true, data: trabajo });
    });

    app.get("/api/renders/:id", (req, res) => res.json({ ok: true, data: renders.ver(id(req.params.id)) }));
    app.get("/api/renders-estado", (req, res) => res.json({ ok: true, data: limitador.estado() }));

    app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));
    app.use((err, req, res, next) => {
        if (err.type === "entity.parse.failed") return res.status(400).json({ ok: false, message: "El body no es un JSON valido" });
        if (err instanceof ColaLlena) return res.status(503).set("Retry-After", "5").json({ ok: false, message: `${err.message}, intenta en unos segundos` });
        if (err instanceof ErrorEscena) {
            const { retryAfter, ...extra } = err.extra;
            if (retryAfter) res.set("Retry-After", String(retryAfter));
            return res.status(err.status).json({ ok: false, message: err.message, ...extra });
        }
        console.error(err);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    });

    app.locals.limitador = limitador;
    return app;
}
