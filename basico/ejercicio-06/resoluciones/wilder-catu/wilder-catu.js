const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

// Construir la ruta del archivo de forma segura
const archivoMotos = path.join(__dirname, "data", "motos.json");

// Leer las motos desde el archivo JSON
function obtenerMotos() {
    try {
        const contenido = fs.readFileSync(archivoMotos, "utf-8");
        return JSON.parse(contenido);
    } catch (error) {
        console.error("Error al leer el archivo de motos:", error.message);
        return null;
    }
}

// Enviar respuesta JSON
function responder(res, estado, datos) {
    res.writeHead(estado, {
        "Content-Type": "application/json; charset=utf-8"
    });

    res.end(JSON.stringify(datos, null, 2));
}

// Crear servidor
const servidor = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // Ruta principal
    if (req.method === "GET" && url.pathname === "/") {
        return responder(res, 200, {
            mensaje: "API de motos y mecánica",
            rutas: [
                "GET /",
                "GET /motos",
                "GET /motos/:id"
            ]
        });
    }

    // Obtener todas las motos
    if (req.method === "GET" && url.pathname === "/motos") {
        const motos = obtenerMotos();

        if (!motos) {
            return responder(res, 500, {
                error: "No se pudo leer la información de las motos"
            });
        }

        return responder(res, 200, motos);
    }

    // Obtener una moto por ID
    if (req.method === "GET" && url.pathname.startsWith("/motos/")) {
        const id = url.pathname.split("/")[2];

        // Validación básica del ID
        if (!id || !/^\d+$/.test(id)) {
            return responder(res, 400, {
                error: "El ID de la moto debe ser un número"
            });
        }

        const motos = obtenerMotos();

        if (!motos) {
            return responder(res, 500, {
                error: "No se pudo leer la información de las motos"
            });
        }

        const moto = motos.find((moto) => moto.id === Number(id));

        if (!moto) {
            return responder(res, 404, {
                error: "Moto no encontrada"
            });
        }

        return responder(res, 200, moto);
    }

    // Ruta no encontrada
    responder(res, 404, {
        error: "Ruta no encontrada"
    });
});

// Iniciar servidor
servidor.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`Archivo utilizado: ${archivoMotos}`);
});