import express from "express";

import proyectoRoutes from "./routes/proyectoRoutes.js";

const app = express();

const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("API de arquitectura 3D funcionando");
});

app.use("/proyectos", proyectoRoutes);

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});