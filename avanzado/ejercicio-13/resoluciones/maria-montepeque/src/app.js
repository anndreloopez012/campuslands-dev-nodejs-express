import express from "express";
import { crearLogger } from "./logs/logger.js";
import { contextoDePeticion, logDeAcceso, manejarErrores } from "./http/middlewares.js";
import { crearMisiones, DESTINOS } from "./servicios/misiones.js";

// logger y umbral se pueden cambiar (en los tests guardo las lineas en un arreglo)
export function crearApp({ logger = crearLogger({ nivel: process.env.LOG_LEVEL || "info" }), umbralLentoMs = 1000 } = {}) {
    const misiones = crearMisiones(logger);
    const app = express();

    // el contexto va primero para que todo lo de abajo tenga req.log
    app.use(contextoDePeticion(logger));
    app.use(logDeAcceso({ umbralLentoMs }));
    app.use(express.json());

    const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

    app.get("/health", (req, res) => {
        res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "observabilidad y logs" });
    });

    app.get("/api/destinos", (req, res) => res.json({ ok: true, data: Object.keys(DESTINOS) }));

    app.post("/api/misiones", asyncHandler(async (req, res) => {
        const mision = await misiones.crear(req.body);
        res.status(201).json({ ok: true, data: mision });
    }));

    app.get("/api/misiones/:id", (req, res) => {
        res.json({ ok: true, data: misiones.buscar(Number(req.params.id)) });
    });

    // ruta para probar el log de peticiones lentas
    app.get("/api/telemetria", asyncHandler(async (req, res) => {
        const espera = Math.min(Number(req.query.esperaMs) || 0, 5000);
        await new Promise((r) => setTimeout(r, espera));
        res.json({ ok: true, data: { senal: "estable", latenciaSimuladaMs: espera } });
    }));

    app.use((req, res) => {
        res.status(404).json({ ok: false, message: `La ruta ${req.method} ${req.originalUrl} no existe`, requestId: req.id });
    });
    app.use(manejarErrores);

    return app;
}
