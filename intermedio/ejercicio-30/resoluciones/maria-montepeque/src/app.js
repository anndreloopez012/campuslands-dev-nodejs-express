import express from "express";
import requestId from "./middlewares/request-id.js";
import { rutaNoEncontrada, manejarErrores } from "./middlewares/errores.js";
import apiRoutes from "./routes/index.js";

const app = express();

// limite al tamano del body para que no manden algo gigante
app.use(express.json({ limit: "20kb" }));
app.use(requestId);

app.get("/health", (req, res) => {
    res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "proyecto integrador intermedio" });
});

app.use("/api", apiRoutes);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

export default app;
