import express from "express";

import soldaduraRoutes from "./routes/soldaduraRoutes.js";

const app = express();

const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("API de soldadura funcionando");
});

app.use("/trabajos", soldaduraRoutes);

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});