import express from "express";
import { crearAlmacen } from "./idempotencia/almacen.js";
import { idempotente } from "./idempotencia/middleware.js";
import { crearEncargos, ErrorEncargo } from "./servicios/encargos.js";

export function crearApp({ ttlMs, reloj, demoraCobroMs, pasarela } = {}) {
    const almacen = crearAlmacen({ ttlMs, reloj });
    const encargos = crearEncargos({ demoraCobroMs, pasarela });

    const app = express();
    app.use(express.json());

    // usuario simulado con un header
    app.use("/api", (req, res, next) => {
        req.usuario = req.get("X-Usuario");
        if (!req.usuario) return res.status(401).json({ ok: false, message: "Manda el header X-Usuario (ana o beto)" });
        next();
    });

    app.get("/health", (req, res) => res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "idempotencia" }));

    // GET ya es idempotente por naturaleza, no necesita llave
    app.get("/api/encargos", (req, res) => res.json({ ok: true, saldo: encargos.saldo(req.usuario), data: encargos.listar(req.usuario) }));

    // POST cobra creditos: necesita Idempotency-Key
    app.post("/api/encargos", idempotente(almacen), async (req, res, next) => {
        try {
            const encargo = await encargos.crear(req.usuario, req.body);
            res.status(201).json({ ok: true, data: encargo, saldo: encargos.saldo(req.usuario) });
        } catch (err) {
            next(err);
        }
    });

    app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));
    app.use((err, req, res, next) => {
        if (err.type === "entity.parse.failed") return res.status(400).json({ ok: false, message: "El body no es un JSON valido" });
        if (err instanceof ErrorEncargo) return res.status(err.status).json({ ok: false, message: err.message, ...(err.errores && { errors: err.errores }) });
        console.error(err.message);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    });

    app.locals.almacen = almacen;
    app.locals.encargos = encargos;
    return app;
}
