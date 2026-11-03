import express from "express";
import { obtenerCanciones } from "./canciones.js";

const app = express();

app.use(express.json());

app.get("/canciones", async (req, res) => {
    try {
        const canciones = await obtenerCanciones();

        res.json(canciones);
    } catch (error) {
        res.status(500).json({
            mensaje: "Ocurrió un error al obtener las canciones"
        });
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});