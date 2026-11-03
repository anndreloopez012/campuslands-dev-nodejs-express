import express from "express";
import tatuajes from "./tatuajes.js";

const app = express();

const PORT = 3000;

// Ruta principal
app.get("/", (req, res) => {
    res.send("API de tatuajes funcionando");
});

// Obtener todos los tatuajes
app.get("/tatuajes", (req, res) => {
    res.json(tatuajes);
});

// Buscar tatuajes por estilo utilizando req.query
app.get("/buscar", (req, res) => {
    const { estilo } = req.query;

    if (!estilo) {
        return res.status(400).json({
            mensaje: "Debes indicar un estilo"
        });
    }

    const resultados = tatuajes.filter(
        (tatuaje) => tatuaje.estilo.toLowerCase() === estilo.toLowerCase()
    );

    res.json(resultados);
});

// Obtener un tatuaje por ID utilizando req.params
app.get("/tatuajes/:id", (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            mensaje: "El ID debe ser un número"
        });
    }

    const tatuaje = tatuajes.find((tatuaje) => tatuaje.id === id);

    if (!tatuaje) {
        return res.status(404).json({
            mensaje: "Tatuaje no encontrado"
        });
    }

    res.json(tatuaje);
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});