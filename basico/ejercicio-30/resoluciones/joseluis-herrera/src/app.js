import express from "express";

import motoRoutes from "./motoRoutes.js";

const app = express();

const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        mensaje: "API de motos y mecánica funcionando"
    });
});

app.use("/motos", motoRoutes);

app.listen(PORT, () => {
    console.log(
        `Servidor ejecutándose en http://localhost:${PORT}`
    );
});