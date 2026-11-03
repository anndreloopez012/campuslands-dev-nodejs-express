import express from "express";
import { crearAlmacen } from "./datos/almacen.js";
import { crearTorneo, ErrorTorneo } from "./servicios/torneo.js";

// el almacen se puede pasar desde afuera: los tests lo llenan con fixtures o factories
export function crearApp({ almacen = crearAlmacen() } = {}) {
    const torneo = crearTorneo(almacen);
    const app = express();
    app.use(express.json());

    const id = (texto) => {
        const n = Number(texto);
        if (!Number.isInteger(n) || n < 1) throw new ErrorTorneo(400, "El id debe ser un entero positivo");
        return n;
    };

    app.get("/health", (req, res) => res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "fixtures y factories" }));

    app.get("/api/equipos", (req, res) => res.json({ ok: true, data: almacen.listar("equipos") }));
    app.get("/api/equipos/:id", (req, res) => {
        const equipo = almacen.buscar("equipos", id(req.params.id));
        if (!equipo) throw new ErrorTorneo(404, "Equipo no encontrado");
        const jugadores = almacen.listar("jugadores").filter((j) => j.equipoId === equipo.id);
        res.json({ ok: true, data: { ...equipo, jugadores } });
    });
    app.get("/api/ranking", (req, res) => res.json({ ok: true, data: torneo.ranking() }));
    app.get("/api/jugadores/:id/estadisticas", (req, res) => res.json({ ok: true, data: torneo.estadisticasJugador(id(req.params.id)) }));
    app.post("/api/partidas", (req, res) => res.status(201).json({ ok: true, data: torneo.registrarPartida(req.body) }));

    app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));
    app.use((err, req, res, next) => {
        if (err.type === "entity.parse.failed") return res.status(400).json({ ok: false, message: "El body no es un JSON valido" });
        if (err instanceof ErrorTorneo) return res.status(err.status).json({ ok: false, message: err.message, ...(err.errores && { errors: err.errores }) });
        console.error(err);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    });

    return app;
}
