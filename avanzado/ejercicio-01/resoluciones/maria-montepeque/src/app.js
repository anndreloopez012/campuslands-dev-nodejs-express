import express from "express";
import v1Routes, { SUNSET_V1 } from "./versions/v1/routes.js";
import v2Routes from "./versions/v2/routes.js";

// versiones que existen y en que estado estan
const VERSIONES = [
    { version: "v1", estado: "deprecada", sunset: SUNSET_V1, base: "/api/v1" },
    { version: "v2", estado: "actual", sunset: null, base: "/api/v2" }
];

const app = express();

// express.json() va dentro de cada version, asi un JSON roto
// se responde con el formato de error de esa version

app.get("/health", (req, res) => {
    res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "diseno API versionada" });
});

// el cliente puede preguntar que versiones hay
app.get("/api", (req, res) => {
    res.json({ ok: true, actual: "v2", versiones: VERSIONES });
});

// cada version tiene su propio router, con su formato de respuestas y errores
app.use("/api/v1", v1Routes);
app.use("/api/v2", v2Routes);

// /api/v3, /api/v99... no existen
app.use("/api/:version", (req, res, next) => {
    if (!/^v\d+$/.test(req.params.version)) return next();
    res.status(404).json({
        ok: false,
        message: `La version ${req.params.version} no existe`,
        versiones: VERSIONES.map((v) => v.version)
    });
});

app.use((req, res) => {
    res.status(404).json({ ok: false, message: `La ruta ${req.method} ${req.originalUrl} no existe` });
});

// lo que no atrapo ninguna version
app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
});

export default app;
