import express from "express";
import { readFileSync } from "node:fs";
import swaggerUi from "swagger-ui-express";
import apiRoutes from "./routes/index.js";

// la documentacion vive en un archivo aparte, aqui solo la cargo
const openapi = JSON.parse(readFileSync(new URL("../docs/openapi.json", import.meta.url), "utf8"));

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ ok: true, message: "Ejercicio ejecutado correctamente", topic: "documentacion de endpoints" });
});

// el json crudo, sirve para importarlo en Postman o Insomnia
app.get("/openapi.json", (req, res) => {
    res.json(openapi);
});

// la pagina de Swagger UI para leer y probar los endpoints desde el navegador
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi, { customSiteTitle: "Liga MOBA - API" }));

app.use("/api", apiRoutes);

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

export default app;
