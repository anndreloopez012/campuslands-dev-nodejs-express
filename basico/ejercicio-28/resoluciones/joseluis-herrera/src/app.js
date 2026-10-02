import express from "express";

import {
    PORT,
    NODE_ENV,
    API_NAME
} from "./config/env.js";

import partidaRoutes from "./routes/partidaRoutes.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        mensaje: `${API_NAME} funcionando`,
        entorno: NODE_ENV
    });
});

app.use("/partidas", partidaRoutes);

app.listen(PORT, () => {
    console.log(
        `${API_NAME} ejecutándose en el puerto ${PORT}`
    );

    console.log(
        `Entorno: ${NODE_ENV}`
    );
});