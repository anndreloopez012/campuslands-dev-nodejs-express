import express from "express";
import heroesRoutes from "./routes/heroes.routes.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "arquitectura por capas" });
});

app.use("/api/heroes", heroesRoutes);

// si ninguna ruta de arriba coincide
app.use((req, res) => {
    res.status(404).json({ ok: false, message: `La ruta ${req.originalUrl} no existe` });
});

// ultima capa: cualquier error cae aqui
app.use((error, req, res, next) => {
    console.error(error.message);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
});

export default app;
