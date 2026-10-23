import express from "express";

import formulaRoutes from "./routes/formulaRoutes.js";

const app = express();

const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("API de fórmulas químicas funcionando");
});

app.use("/formulas", formulaRoutes);

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});