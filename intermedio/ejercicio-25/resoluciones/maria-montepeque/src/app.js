import express from "express";
import PERSONAJES_INICIALES from "./data/personajes.js";
import { crearPersonajesService } from "./services/personajes.service.js";
import { crearPersonajesRouter } from "./routes/personajes.routes.js";

// en vez de exportar una sola app exporto una funcion que crea apps
// cada test puede crear la suya con sus propios datos y no hace falta resetear
function crearApp({ personajes = PERSONAJES_INICIALES, tokenGm = process.env.GM_TOKEN || "token-del-gm" } = {}) {
    const app = express();
    const service = crearPersonajesService(personajes);

    app.use(express.json());

    app.get("/health", (req, res) => {
        res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "testing de rutas" });
    });

    app.use("/api/personajes", crearPersonajesRouter(service, tokenGm));

    app.use((req, res) => {
        res.status(404).json({ ok: false, message: `La ruta ${req.method} ${req.originalUrl} no existe` });
    });

    app.use((error, req, res, next) => {
        if (error.type === "entity.parse.failed") {
            return res.status(400).json({ ok: false, message: "El body no es un JSON valido" });
        }

        if (error.statusCode) {
            const body = { ok: false, message: error.message };
            if (error.errors) body.errors = error.errors;
            return res.status(error.statusCode).json(body);
        }

        console.error(error);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    });

    return app;
}

export { crearApp };
