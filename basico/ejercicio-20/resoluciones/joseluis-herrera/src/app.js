import express from "express";
import dibujos from "./dibujos.js";

const app = express();

const PORT = 3000;

// Middleware para poder recibir JSON
app.use(express.json());

// Ruta principal
app.get("/", (req, res) => {
    res.send("API de dibujo digital funcionando");
});

// Obtener todos los dibujos
app.get("/dibujos", (req, res) => {
    res.json(dibujos);
});

// Crear un nuevo dibujo
app.post("/dibujos", (req, res) => {
    const { titulo, artista, tecnica } = req.body;

    if (!titulo || !artista || !tecnica) {
        return res.status(400).json({
            mensaje: "Todos los campos son obligatorios"
        });
    }

    if (
        typeof titulo !== "string" ||
        typeof artista !== "string" ||
        typeof tecnica !== "string"
    ) {
        return res.status(400).json({
            mensaje: "Los campos deben ser texto"
        });
    }

    const nuevoDibujo = {
        id: dibujos.length + 1,
        titulo,
        artista,
        tecnica
    };

    dibujos.push(nuevoDibujo);

    res.status(201).json({
        mensaje: "Dibujo registrado correctamente",
        dibujo: nuevoDibujo
    });
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});