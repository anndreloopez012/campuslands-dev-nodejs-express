import express from "express";
import apiRoutes from "./routes/index.js";

const app = express();

app.use(express.json());

// para ver si el server responde
app.get("/health", (req, res) => {
    res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "subrecursos REST" });
});

app.use("/api", apiRoutes);

// ruta que no existe
app.use((req, res) => {
    res.status(404).json({ ok: false, message: `La ruta ${req.originalUrl} no existe` });
});

// aqui llegan todos los errores
app.use((error, req, res, next) => {
    // json mal escrito en el body
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
