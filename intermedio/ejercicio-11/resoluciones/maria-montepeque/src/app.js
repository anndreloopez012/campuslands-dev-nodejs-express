import express from "express";
import apiRoutes from "./routes/index.js";

const app = express();

app.use(express.json());

// ruta rapida para ver si el server esta vivo
app.get("/health", (req, res) => {
    res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "busqueda textual" });
});

app.use("/api", apiRoutes);

// si ninguna ruta coincide cae aqui
app.use((req, res) => {
    res.status(404).json({ ok: false, message: `La ruta ${req.originalUrl} no existe` });
});

// manejo de errores, si no trae status es un 500
app.use((error, req, res, next) => {
    if (error.statusCode) {
        return res.status(error.statusCode).json({ ok: false, message: error.message });
    }

    console.error(error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
});

export default app;
