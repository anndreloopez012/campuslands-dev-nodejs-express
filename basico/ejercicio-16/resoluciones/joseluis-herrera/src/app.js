import express from "express";

const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
    res.send("API de ropa y sneakers funcionando");
});

app.get("/productos", (req, res) => {
    res.json([
        {
            id: 1,
            nombre: "Nike Air Force 1",
            tipo: "Sneaker",
            precio: 120
        },
        {
            id: 2,
            nombre: "Sudadera negra",
            tipo: "Ropa",
            precio: 45
        },
        {
            id: 3,
            nombre: "Nike Dunk Low",
            tipo: "Sneaker",
            precio: 130
        }
    ]);
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});