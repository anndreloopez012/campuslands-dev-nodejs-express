import express from "express";

import videojuegoRoutes from "./routes/videojuegoRoutes.js";

const app = express();

const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).send("API de videojuegos RPG funcionando");
});

app.use("/videojuegos", videojuegoRoutes);

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});