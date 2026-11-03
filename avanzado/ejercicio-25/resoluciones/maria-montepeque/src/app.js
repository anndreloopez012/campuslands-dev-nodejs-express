import express from "express";
import path from "node:path";
import { crearRepositorioJson, ErrorDatos } from "./repositorio/archivoJson.js";
import { crearServicioPersonajes, ErrorJuego } from "./servicios/personajes.js";

// la ruta del archivo se puede cambiar: en los tests cada uno usa una carpeta temporal
export function crearApp({ carpetaDatos = path.resolve("data"), aleatorio } = {}) {
    const repo = crearRepositorioJson(path.join(carpetaDatos, "partida.json"), { inicial: { siguienteId: 1, personajes: [] } });
    const personajes = crearServicioPersonajes(repo, { aleatorio });

    const app = express();
    app.use(express.json());

    // para no repetir try/catch en cada ruta async
    const manejar = (fn) => (req, res, next) => fn(req, res).catch(next);
    const id = (texto) => {
        const n = Number(texto);
        if (!Number.isInteger(n) || n < 1) throw new ErrorJuego(400, "El id debe ser un entero positivo");
        return n;
    };

    app.get("/health", (req, res) => res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "testing de integracion" }));

    app.get("/api/personajes", manejar(async (req, res) => res.json({ ok: true, data: await personajes.listar() })));
    app.get("/api/personajes/:id", manejar(async (req, res) => res.json({ ok: true, data: await personajes.ver(id(req.params.id)) })));
    app.post("/api/personajes", manejar(async (req, res) => res.status(201).json({ ok: true, data: await personajes.crear(req.body) })));
    app.post("/api/personajes/:id/equipo", manejar(async (req, res) => res.json({ ok: true, data: await personajes.equipar(id(req.params.id), req.body?.objeto) })));
    app.post("/api/personajes/:id/batallas", manejar(async (req, res) => res.json({ ok: true, data: await personajes.batalla(id(req.params.id), req.body?.monstruo) })));

    app.use((req, res) => res.status(404).json({ ok: false, message: "Ruta no encontrada" }));
    app.use((err, req, res, next) => {
        if (err.type === "entity.parse.failed") return res.status(400).json({ ok: false, message: "El body no es un JSON valido" });
        if (err instanceof ErrorJuego) return res.status(err.status).json({ ok: false, message: err.message, ...(err.errores && { errors: err.errores }) });
        if (err instanceof ErrorDatos) return res.status(500).json({ ok: false, message: "No se pudo leer la partida guardada" });
        console.error(err);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    });

    return app;
}
