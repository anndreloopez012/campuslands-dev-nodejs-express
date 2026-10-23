import express from "express";
import { obtenerPeliculas } from "./peliculas.js";

const app = express();

app.use(express.json());

app.get("/peliculas", async (req, res) => {
    try {
        const peliculas = await obtenerPeliculas();

        res.json(peliculas);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener las películas"
        });
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});