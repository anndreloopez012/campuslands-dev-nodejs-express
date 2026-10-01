import express from "express";
import { libros, agregarLibro } from "./libros.js";

const app = express();

app.use(express.json());

app.get("/libros", (req, res) => {
    res.json(libros);
});

app.post("/libros", (req, res) => {
    const { titulo, autor, anio } = req.body;

    if (!titulo || !autor || !anio) {
        return res.status(400).json({
            mensaje: "Todos los campos son obligatorios"
        });
    }

    if (typeof titulo !== "string") {
        return res.status(400).json({
            mensaje: "El título debe ser un texto"
        });
    }

    if (typeof autor !== "string") {
        return res.status(400).json({
            mensaje: "El autor debe ser un texto"
        });
    }

    if (typeof anio !== "number") {
        return res.status(400).json({
            mensaje: "El año debe ser un número"
        });
    }

    const nuevoLibro = agregarLibro({
        titulo,
        autor,
        anio
    });

    res.status(201).json(nuevoLibro);
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});