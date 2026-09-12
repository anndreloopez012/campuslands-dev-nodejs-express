import express from "express";

import matchRoutes from "./routes/match.routes.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).json({
        ok: true,
        message: "API funcionando correctamente",
        topic: "fs para leer archivos"
    });
});

app.use("/api/matches", matchRoutes);

export default app;