import express from "express";

import jugadorRoutes from "./routes/jugadorRoutes.js";

const app = express();

const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).send(
        "API de shooters competitivos funcionando"
    );
});

app.use("/jugadores", jugadorRoutes);

app.listen(PORT, () => {
    console.log(
        `Servidor ejecutándose en http://localhost:${PORT}`
    );
});