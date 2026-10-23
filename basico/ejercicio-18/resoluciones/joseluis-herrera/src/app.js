import express from "express";
import saltos from "./saltos.js";

const app = express();

const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("API de paracaidismo funcionando");
});

app.get("/saltos", (req, res) => {
    res.json(saltos);
});

app.post("/saltos", (req, res) => {
    const { participante, altura, tipo } = req.body;

    if (!participante || !altura || !tipo) {
        return res.status(400).json({
            mensaje: "Todos los campos son obligatorios"
        });
    }

    if (typeof participante !== "string") {
        return res.status(400).json({
            mensaje: "El participante debe ser un texto"
        });
    }

    if (typeof altura !== "number" || altura <= 0) {
        return res.status(400).json({
            mensaje: "La altura debe ser un número mayor que 0"
        });
    }

    if (typeof tipo !== "string") {
        return res.status(400).json({
            mensaje: "El tipo debe ser un texto"
        });
    }

    const nuevoSalto = {
        id: saltos.length + 1,
        participante,
        altura,
        tipo
    };

    saltos.push(nuevoSalto);

    res.status(201).json({
        mensaje: "Salto registrado correctamente",
        salto: nuevoSalto
    });
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});