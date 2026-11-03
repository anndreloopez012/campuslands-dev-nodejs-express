import express from "express";
import cors from "cors";
import { corsPrivado, corsPublico } from "./config/cors.js";
import obrasRoutes from "./routes/obras.routes.js";
import galeriaRoutes from "./routes/galeria.routes.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "CORS controlado" });
});

// la galeria va antes y con su propio cors abierto
app.use("/api/galeria", cors(corsPublico), galeriaRoutes);

// todo lo demas de /api usa la lista blanca
// el cors va antes de las rutas para que tambien conteste los OPTIONS (preflight)
app.use("/api", cors(corsPrivado));
app.use("/api/obras", obrasRoutes);

app.use((req, res) => {
    res.status(404).json({ ok: false, message: `La ruta ${req.originalUrl} no existe` });
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

export default app;
