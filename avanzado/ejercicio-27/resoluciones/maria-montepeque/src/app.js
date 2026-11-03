import express from "express";
import { configPublica } from "./config/cargar.js";
import { crearDrafts, ErrorDraft } from "./servicios/draft.js";

// la app RECIBE la config ya cargada y validada (no lee process.env por su cuenta)
export function crearApp(config, { reloj } = {}) {
    const drafts = crearDrafts(config, { reloj });
    const app = express();
    app.use(express.json());

    const id = (texto) => {
        const n = Number(texto);
        if (!Number.isInteger(n) || n < 1) throw new ErrorDraft(400, "El id debe ser un entero positivo");
        return n;
    };

    app.get("/health", (req, res) => res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "manejo de configuracion avanzada" }));

    // para revisar que config quedo (sin secretos). En produccion no se expone
    app.get("/api/config", (req, res) => {
        if (config.entorno === "production") return res.status(404).json({ ok: false, message: "Ruta no encontrada" });
        res.json({ ok: true, data: configPublica(config) });
    });

    app.get("/api/heroes", (req, res) => res.json({ ok: true, data: drafts.heroes() }));
    app.post("/api/drafts", (req, res) => res.status(201).json({ ok: true, data: drafts.crear() }));
    app.get("/api/drafts/:id", (req, res) => res.json({ ok: true, data: drafts.ver(id(req.params.id)) }));
    app.post("/api/drafts/:id/acciones", (req, res) => res.json({ ok: true, data: drafts.accion(id(req.params.id), req.body) }));

    // feature flag: la ruta solo existe si la funcion esta prendida
    app.get("/api/ranked/temporada", (req, res) => {
        if (!config.funciones.modoRanked) return res.status(404).json({ ok: false, message: "El modo ranked no esta habilitado" });
        res.json({ ok: true, data: { temporada: "2026-T4", region: config.region, divisiones: ["Hierro", "Bronce", "Plata", "Oro", "Diamante", "Leyenda"] } });
    });

    app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));
    app.use((err, req, res, next) => {
        if (err.type === "entity.parse.failed") return res.status(400).json({ ok: false, message: "El body no es un JSON valido" });
        if (err instanceof ErrorDraft) return res.status(err.status).json({ ok: false, message: err.message });
        if (config.logNivel !== "error") console.error(err);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    });

    return app;
}
