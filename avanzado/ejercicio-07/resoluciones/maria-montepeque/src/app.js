import express from "express";
import { crearCache } from "./cache/cache.js";
import { crearCatalogo } from "./fuente/catalogo.js";
import { crearAutosServicio } from "./servicios/autos.servicio.js";

export function crearApp({ ttlMs = 30_000, maxEntradas = 100, demoraMs = 300 } = {}) {
    const cache = crearCache({ ttlMs, maxEntradas });
    const catalogo = crearCatalogo({ demoraMs });
    const autos = crearAutosServicio({ catalogo, cache });

    const app = express();
    app.use(express.json());

    const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

    // headers para que el cliente sepa si vino de la cache y que tan viejo es el dato
    function responder(res, { valor, estado, edadSeg }) {
        res.set("X-Cache", estado);
        res.set("Age", String(edadSeg));
        res.json({ ok: true, data: valor });
    }

    function leerId(texto) {
        const id = Number(texto);
        if (!Number.isInteger(id) || id < 1) throw Object.assign(new Error("El id debe ser un entero positivo"), { status: 400 });
        return id;
    }

    app.get("/health", (req, res) => {
        res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "cache en memoria" });
    });

    app.get("/api/autos", asyncHandler(async (req, res) => {
        const marca = typeof req.query.marca === "string" ? req.query.marca.trim() : undefined;
        responder(res, await autos.listar({ marca }));
    }));

    app.get("/api/autos/:id", asyncHandler(async (req, res) => {
        responder(res, await autos.buscar(leerId(req.params.id)));
    }));

    app.patch("/api/autos/:id/precio", asyncHandler(async (req, res) => {
        const id = leerId(req.params.id);
        const { precioUsd } = req.body || {};
        if (!Number.isInteger(precioUsd) || precioUsd < 1000) {
            throw Object.assign(new Error("precioUsd debe ser un entero de 1000 para arriba"), { status: 400 });
        }
        res.json({ ok: true, data: await autos.cambiarPrecio(id, precioUsd) });
    }));

    app.get("/api/cache", (req, res) => {
        res.json({ ok: true, data: { ...cache.estadisticas(), claves: cache.claves(), llamadasAlCatalogo: catalogo.llamadas() } });
    });

    app.delete("/api/cache", (req, res) => {
        cache.limpiar();
        res.status(204).send();
    });

    app.use((req, res) => {
        res.status(404).json({ ok: false, message: `La ruta ${req.method} ${req.originalUrl} no existe` });
    });

    app.use((err, req, res, next) => {
        if (err.type === "entity.parse.failed") return res.status(400).json({ ok: false, message: "El body no es un JSON valido" });
        if (err.status) return res.status(err.status).json({ ok: false, message: err.message });
        console.error(err);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    });

    app.locals = { ...app.locals, cache, catalogo };
    return app;
}
