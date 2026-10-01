import express from "express";

import animacionRoutes from "./routes/animacionRoutes.js";

const app = express();

const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("API de animación 3D funcionando");
});

app.use("/proyectos", animacionRoutes);

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});