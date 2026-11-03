import express from "express";
import rutas from "./http/rutas.js";
import { requestId, rutaNoEncontrada, manejarErrores } from "./http/middlewares.js";

const app = express();

app.use(requestId);
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "errores de dominio" });
});

app.use("/api", rutas);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

export default app;
