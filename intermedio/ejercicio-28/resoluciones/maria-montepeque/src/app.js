import express from "express";
import apiRoutes from "./routes/index.js";
import { resetDb } from "./data/db.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "coleccion de ejemplos HTTP" });
});

// borra todo para que la coleccion se pueda correr varias veces
// en produccion esta ruta no existe
if (process.env.NODE_ENV !== "production") {
    app.post("/api/dev/reset", (req, res) => {
        resetDb();
        res.json({ ok: true, message: "Datos reiniciados" });
    });
}

app.use("/api", apiRoutes);

app.use((req, res) => {
    res.status(404).json({ ok: false, message: `La ruta ${req.method} ${req.originalUrl} no existe` });
});

app.use((error, req, res, next) => {
    if (error.type === "entity.parse.failed") {
        return res.status(400).json({ ok: false, message: "El body no es un JSON valido" });
    }

    if (error.statusCode) {
        return res.status(error.statusCode).json({ ok: false, message: error.message });
    }

    console.error(error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
});

export default app;
