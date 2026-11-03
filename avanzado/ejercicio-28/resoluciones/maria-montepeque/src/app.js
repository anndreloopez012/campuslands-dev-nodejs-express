import express from "express";
import { crearPartidas, ErrorPartida } from "./servicios/partidas.js";

// app.js: SOLO arma la aplicacion (rutas, middlewares, errores)
// - no hace listen
// - no lee puertos ni senales del sistema
// - asi los tests la pueden usar con supertest sin abrir ningun puerto
export function crearApp({ maxJugadores, reloj = Date.now } = {}) {
    const partidas = crearPartidas({ maxJugadores });
    const app = express();

    // el servidor prende esta bandera cuando se esta apagando
    app.locals.apagando = false;

    app.use(express.json());

    // vivo: el proceso responde (si falla, el orquestador lo reinicia)
    app.get("/health/live", (req, res) => res.json({ ok: true, estado: "vivo" }));
    // listo: puede recibir trafico (durante el apagado dice que no)
    app.get("/health/ready", (req, res) => {
        if (req.app.locals.apagando) return res.status(503).json({ ok: false, estado: "apagando" });
        res.json({ ok: true, estado: "listo" });
    });
    app.get("/health", (req, res) => res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "separacion app server" }));

    // si llega una peticion nueva mientras se apaga, se rechaza y se pide cerrar la conexion
    app.use((req, res, next) => {
        if (req.app.locals.apagando) return res.status(503).set("Connection", "close").set("Retry-After", "5").json({ ok: false, message: "El servidor se esta apagando, intenta otra vez" });
        next();
    });

    const id = (texto) => {
        const n = Number(texto);
        if (!Number.isInteger(n) || n < 1) throw new ErrorPartida(400, "El id debe ser un entero positivo");
        return n;
    };

    app.get("/api/partidas", (req, res) => res.json({ ok: true, data: partidas.listar() }));
    app.get("/api/partidas/:id", (req, res) => res.json({ ok: true, data: partidas.ver(id(req.params.id)) }));
    app.post("/api/partidas/:id/jugadores", (req, res) => res.status(201).json({ ok: true, data: partidas.unirse(id(req.params.id), req.body?.alias) }));
    app.post("/api/partidas/:id/iniciar", (req, res) => res.json({ ok: true, data: partidas.iniciar(id(req.params.id), reloj()) }));
    app.get("/api/partidas/:id/zona", (req, res) => res.json({ ok: true, data: partidas.zona(id(req.params.id), reloj()) }));

    // simula algo que tarda (armar la repeticion de una partida)
    // sirve para ver que el apagado espera a las peticiones que ya estaban en camino
    app.get("/api/partidas/:id/repeticion", async (req, res, next) => {
        try {
            const partida = partidas.ver(id(req.params.id));
            const ms = Math.min(Number(req.query.ms) || 500, 5000);
            await new Promise((r) => setTimeout(r, ms));
            res.json({ ok: true, data: { partida: partida.id, archivo: `repeticion-${partida.id}.replay`, tardoMs: ms } });
        } catch (err) {
            next(err);
        }
    });

    app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));
    app.use((err, req, res, next) => {
        if (err.type === "entity.parse.failed") return res.status(400).json({ ok: false, message: "El body no es un JSON valido" });
        if (err instanceof ErrorPartida) return res.status(err.status).json({ ok: false, message: err.message });
        console.error(err);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    });

    return app;
}
