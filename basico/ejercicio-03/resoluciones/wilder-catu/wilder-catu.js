const http = require("http");
const { URL } = require("url");

const PORT = 3000;

// Datos iniciales de equipos de MOBA esports
let equipos = [
    {
        id: 1,
        nombre: "Dragons",
        region: "LATAM",
        jugadores: 5
    },
    {
        id: 2,
        nombre: "Titans",
        region: "NA",
        jugadores: 5
    }
];

let siguienteId = 3;

// Enviar respuestas en formato JSON
function enviarRespuesta(res, codigo, datos) {
    res.writeHead(codigo, {
        "Content-Type": "application/json; charset=utf-8"
    });

    res.end(JSON.stringify(datos, null, 2));
}

// Leer el cuerpo de una petición POST o PUT
function leerCuerpo(req) {
    return new Promise((resolve, reject) => {
        let cuerpo = "";

        req.on("data", (fragmento) => {
            cuerpo += fragmento;

            // Limitar el tamaño de la petición
            if (cuerpo.length > 10000) {
                reject(new Error("El cuerpo de la petición es demasiado grande."));
                req.destroy();
            }
        });

        req.on("end", () => {
            // Si no hay información
            if (!cuerpo) {
                resolve({});
                return;
            }

            try {
                const datos = JSON.parse(cuerpo);
                resolve(datos);
            } catch (error) {
                reject(new Error("El cuerpo debe contener un JSON válido."));
            }
        });

        req.on("error", (error) => {
            reject(error);
        });
    });
}

// Validar los datos de un equipo
function validarEquipo(datos) {
    const errores = [];

    if (
        !datos.nombre ||
        typeof datos.nombre !== "string" ||
        datos.nombre.trim() === ""
    ) {
        errores.push("El nombre es obligatorio y debe ser texto.");
    }

    if (
        !datos.region ||
        typeof datos.region !== "string" ||
        datos.region.trim() === ""
    ) {
        errores.push("La región es obligatoria y debe ser texto.");
    }

    if (
        datos.jugadores === undefined ||
        !Number.isInteger(datos.jugadores) ||
        datos.jugadores < 1 ||
        datos.jugadores > 10
    ) {
        errores.push("Jugadores debe ser un número entero entre 1 y 10.");
    }

    return errores;
}

// Obtener el ID desde una ruta como /equipos/1
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

// Crear el servidor HTTP
const servidor = http.createServer(async (req, res) => {
    const url = new URL(
        req.url,
        `http://${req.headers.host || "localhost"}`
    );

    const ruta = url.pathname;
    const metodo = req.method;

    try {
        // ==========================================
        // GET /
        // ==========================================

        if (metodo === "GET" && ruta === "/") {
            enviarRespuesta(res, 200, {
                mensaje: "API de MOBA esports funcionando correctamente.",
                endpoints: [
                    "GET /equipos",
                    "GET /equipos/:id",
                    "POST /equipos",
                    "PUT /equipos/:id",
                    "DELETE /equipos/:id"
                ]
            });

            return;
        }

        // ==========================================
        // GET /equipos
        // ==========================================

        if (metodo === "GET" && ruta === "/equipos") {
            enviarRespuesta(res, 200, {
                total: equipos.length,
                equipos: equipos
            });

            return;
        }

        // Obtener ID para las rutas /equipos/:id
        const id = obtenerIdDesdeRuta(ruta);

        // ==========================================
        // GET /equipos/:id
        // ==========================================

        if (metodo === "GET" && id !== null) {
            const equipo = equipos.find((item) => item.id === id);

            if (!equipo) {
                enviarRespuesta(res, 404, {
                    error: "Equipo no encontrado."
                });

                return;
            }

            enviarRespuesta(res, 200, equipo);

            return;
        }

        // ==========================================
        // POST /equipos
        // ==========================================

        if (metodo === "POST" && ruta === "/equipos") {
            const datos = await leerCuerpo(req);

            const errores = validarEquipo(datos);

            if (errores.length > 0) {
                enviarRespuesta(res, 400, {
                    error: "Los datos enviados no son válidos.",
                    detalles: errores
                });

                return;
            }

            const nuevoEquipo = {
                id: siguienteId,
                nombre: datos.nombre.trim(),
                region: datos.region.trim(),
                jugadores: datos.jugadores
            };

            equipos.push(nuevoEquipo);
            siguienteId++;

            enviarRespuesta(res, 201, {
                mensaje: "Equipo creado correctamente.",
                equipo: nuevoEquipo
            });

            return;
        }

        // ==========================================
        // Validar ID para PUT y DELETE
        // ==========================================

        if (
            (metodo === "PUT" || metodo === "DELETE") &&
            id === null
        ) {
            enviarRespuesta(res, 400, {
                error: "El ID debe ser un número entero positivo."
            });

            return;
        }

        // ==========================================
        // PUT /equipos/:id
        // ==========================================

        if (metodo === "PUT" && id !== null) {
            const posicion = equipos.findIndex(
                (item) => item.id === id
            );

            if (posicion === -1) {
                enviarRespuesta(res, 404, {
                    error: "Equipo no encontrado."
                });

                return;
            }

            const datos = await leerCuerpo(req);

            const errores = validarEquipo(datos);

            if (errores.length > 0) {
                enviarRespuesta(res, 400, {
                    error: "Los datos enviados no son válidos.",
                    detalles: errores
                });

                return;
            }

            equipos[posicion] = {
                id: id,
                nombre: datos.nombre.trim(),
                region: datos.region.trim(),
                jugadores: datos.jugadores
            };

            enviarRespuesta(res, 200, {
                mensaje: "Equipo actualizado correctamente.",
                equipo: equipos[posicion]
            });

            return;
        }

        // ==========================================
        // DELETE /equipos/:id
        // ==========================================

        if (metodo === "DELETE" && id !== null) {
            const posicion = equipos.findIndex(
                (item) => item.id === id
            );

            if (posicion === -1) {
                enviarRespuesta(res, 404, {
                    error: "Equipo no encontrado."
                });

                return;
            }

            const equipoEliminado = equipos.splice(posicion, 1)[0];

            enviarRespuesta(res, 200, {
                mensaje: "Equipo eliminado correctamente.",
                equipo: equipoEliminado
            });

            return;
        }

        // ==========================================
        // RUTA NO ENCONTRADA
        // ==========================================

        enviarRespuesta(res, 404, {
            error: "Ruta no encontrada."
        });

    } catch (error) {
        enviarRespuesta(res, 400, {
            error: error.message
        });
    }
});

// Iniciar servidor
servidor.listen(PORT, () => {
    console.log("------------------------------------------");
    console.log("API MOBA Esports");
    console.log("------------------------------------------");
    console.log(`Servidor: http://localhost:${PORT}`);
    console.log("Servidor iniciado correctamente.");
    console.log("------------------------------------------");
});