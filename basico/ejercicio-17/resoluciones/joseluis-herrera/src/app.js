import express from "express";
import destinos from "./destinos.js";

const app = express();

const PORT = 3000;

// Ruta principal
app.get("/", (req, res) => {
    res.send("API de viajes y turismo funcionando");
});

// Obtener todos los destinos
app.get("/destinos", (req, res) => {
    res.json(destinos);
});

// Obtener un destino por ID
app.get("/destinos/:id", (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            mensaje: "El ID debe ser un número"
        });
    }

    const destino = destinos.find((destino) => destino.id === id);

    if (!destino) {
        return res.status(404).json({
            mensaje: "Destino no encontrado"
        });
    }

    res.json(destino);
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});