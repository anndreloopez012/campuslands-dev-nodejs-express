const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const archivoEquipos = path.join(__dirname, "equipos.json");

// ==========================================
// LEER ARCHIVO JSON
// ==========================================

function leerEquipos() {
    try {
        const contenido = fs.readFileSync(
            archivoEquipos,
            "utf-8"
        );

        return JSON.parse(contenido);
    } catch (error) {
        console.error("Error al leer equipos.json:", error.message);

        return null;
    }
}

// ==========================================
// ENVIAR RESPUESTA JSON
// ==========================================

function enviarRespuesta(res, codigo, datos) {
    res.writeHead(codigo, {
        "Content-Type": "application/json; charset=utf-8"
    });

    res.end(JSON.stringify(datos, null, 2));
}

// ==========================================
// OBTENER ID DESDE LA RUTA
// ==========================================

function obtenerIdDesdeRuta(ruta) {
    const partes = ruta.split("/");

    if (partes.length !== 3 || partes[1] !== "equipos") {
        return null;
    }

    const id = Number(partes[2]);

    if (!Number.isInteger(id) || id <= 0) {
        return null;
    }

    return id;
}

// ==========================================
// VALIDAR EQUIPO
// ==========================================

function validarEquipo(equipo) {
    const errores = [];

    if (
        !equipo.nombre ||
        typeof equipo.nombre !== "string" ||
        equipo.nombre.trim() === ""
    ) {
        errores.push(
            "El nombre del equipo es obligatorio."
        );
    }

    if (
        !equipo.deporte ||
        typeof equipo.deporte !== "string"
    ) {
        errores.push(
            "El deporte debe ser futbol o futbol sala."
        );
    } else if (
        equipo.deporte !== "futbol" &&
        equipo.deporte !== "futbol sala"
    ) {
        errores.push(
            "El deporte debe ser futbol o futbol sala."
        );
    }

    if (
        !equipo.pais ||
        typeof equipo.pais !== "string"
    ) {
        errores.push(
            "El pais es obligatorio."
        );
    }

    return errores;
}

// ==========================================
// CREAR SERVIDOR
// ==========================================

const servidor = http.createServer((req, res) => {
    const ruta = req.url;
    const metodo = req.method;

    // ======================================
    // GET /
    // ======================================

    if (metodo === "GET" && ruta === "/") {
        enviarRespuesta(res, 200, {
            mensaje: "API de futbol y futbol sala",
            tecnologia: "Node.js",
            modulo: "fs",
            endpoints: [
                "GET /equipos",
                "GET /equipos/:id",
                "GET /futbol",
                "GET /futbol-sala"
            ]
        });

        return;
    }

    // ======================================
    // GET /equipos
    // ======================================

    if (metodo === "GET" && ruta === "/equipos") {
        const equipos = leerEquipos();

        if (!equipos) {
            enviarRespuesta(res, 500, {
                error: "No fue posible leer el archivo de equipos."
            });

            return;
        }

        enviarRespuesta(res, 200, {
            total: equipos.length,
            equipos: equipos
        });

        return;
    }

    // ======================================
    // GET /futbol
    // ======================================

    if (metodo === "GET" && ruta === "/futbol") {
        const equipos = leerEquipos();

        if (!equipos) {
            enviarRespuesta(res, 500, {
                error: "No fue posible leer el archivo de equipos."
            });

            return;
        }

        const equiposFutbol = equipos.filter(
            (equipo) => equipo.deporte === "futbol"
        );

        enviarRespuesta(res, 200, {
            deporte: "futbol",
            total: equiposFutbol.length,
            equipos: equiposFutbol
        });

        return;
    }

    // ======================================
    // GET /futbol-sala
    // ======================================

    if (metodo === "GET" && ruta === "/futbol-sala") {
        const equipos = leerEquipos();

        if (!equipos) {
            enviarRespuesta(res, 500, {
                error: "No fue posible leer el archivo de equipos."
            });

            return;
        }

        const equiposFutsal = equipos.filter(
            (equipo) => equipo.deporte === "futbol sala"
        );

        enviarRespuesta(res, 200, {
            deporte: "futbol sala",
            total: equiposFutsal.length,
            equipos: equiposFutsal
        });

        return;
    }

    // ======================================
    // GET /equipos/:id
    // ======================================

    if (metodo === "GET" && ruta.startsWith("/equipos/")) {
        const id = obtenerIdDesdeRuta(ruta);

        if (id === null) {
            enviarRespuesta(res, 400, {
                error: "El ID debe ser un numero entero positivo."
            });

            return;
        }

        const equipos = leerEquipos();

        if (!equipos) {
            enviarRespuesta(res, 500, {
                error: "No fue posible leer el archivo de equipos."
            });

            return;
        }

        const equipo = equipos.find(
            (item) => item.id === id
        );

        if (!equipo) {
            enviarRespuesta(res, 404, {
                error: "Equipo no encontrado."
            });

            return;
        }

        enviarRespuesta(res, 200, equipo);

        return;
    }

    // ======================================
    // RUTA NO ENCONTRADA
    // ======================================

    enviarRespuesta(res, 404, {
        error: "Ruta no encontrada."
    });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

servidor.listen(PORT, () => {
    console.log("------------------------------------------");
    console.log("API de Futbol y Futbol Sala");
    console.log("------------------------------------------");
    console.log(`Servidor: http://localhost:${PORT}`);
    console.log("Servidor iniciado correctamente.");
    console.log("------------------------------------------");
});