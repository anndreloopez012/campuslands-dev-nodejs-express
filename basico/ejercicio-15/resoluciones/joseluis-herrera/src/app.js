import http from "node:http";
import { comidas } from "./comidas.js";

const PORT = 3000;

const servidor = http.createServer((req, res) => {

    if (req.method === "GET" && req.url === "/comidas") {
        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify(comidas));

        return;
    }

    if (req.method === "GET" && req.url === "/") {
        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            mensaje: "API de comida urbana funcionando"
        }));

        return;
    }

    res.writeHead(404, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
        mensaje: "Ruta no encontrada"
    }));
});

servidor.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});