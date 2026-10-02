import express from "express";

import equipos from "./equipos.js";

const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
    res.status(200).json({
        mensaje: "API de fútbol y fútbol sala funcionando"
    });
});

app.get("/equipos", (req, res) => {
    res.status(200).json(equipos);
});

app.get("/equipos/:id", (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            mensaje: "El ID debe ser un número"
        });
    }

    const equipo = equipos.find(
        (equipo) => equipo.id === id
    );

    if (!equipo) {
        return res.status(404).json({
            mensaje: "Equipo no encontrado"
        });
    }

    res.status(200).json(equipo);
});

app.listen(PORT, () => {
    console.log(
        `Servidor ejecutándose en http://localhost:${PORT}`
    );
});