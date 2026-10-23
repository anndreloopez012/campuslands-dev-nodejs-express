import express from "express";
import { personajes, buscarPersonaje } from "./personajes.js";

const app = express();

app.use(express.json());

app.get("/personajes", (req, res) => {
    res.json(personajes);
});

app.get("/personajes/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                mensaje: "El ID debe ser un número"
            });
        }

        const personaje = buscarPersonaje(id);

        res.json(personaje);
    } catch (error) {
        res.status(404).json({
            mensaje: error.message
        });
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});