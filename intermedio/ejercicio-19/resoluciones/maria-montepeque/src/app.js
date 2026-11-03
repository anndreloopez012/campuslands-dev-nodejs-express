import express from "express";
import config from "./config/env.js";
import apiRoutes from "./routes/index.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "dotenv y config" });
});

app.use("/api", apiRoutes);

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

    // en desarrollo muestro el error real, en produccion no
    const body = { ok: false, message: "Error interno del servidor" };
    if (!config.esProduccion) body.detalle = error.message;
    res.status(500).json(body);
});

export default app;
