import http from "http";
import { URL } from "url";

const PORT = 3000;

let jugadores = [
    {
        id: 1,
        nombre: "Shadow",
        nivel: 25,
        victorias: 8
    },
    {
        id: 2,
        nombre: "Ghost",
        nivel: 20,
        victorias: 5
    }
];

let siguienteId = 3;

// ==========================================
// ENVIAR RESPUESTAS JSON
// ==========================================

function enviarRespuesta(res, codigo, datos) {
    res.writeHead(codigo, {
        "Content-Type": "application/json; charset=utf-8"
    });

    res.end(JSON.stringify(datos, null, 2));
}

// ==========================================
// LEER EL CUERPO DE LA PETICIÓN
// ==========================================

function leerCuerpo(req) {
    return new Promise((resolve, reject) => {
        let cuerpo = "";

        req.on("data", (fragmento) => {
            cuerpo += fragmento;

            if (cuerpo.length > 10000) {
                reject(
                    new Error("El cuerpo de la petición es demasiado grande.")
                );

                req.destroy();
            }
        });

        req.on("end", () => {
            if (!cuerpo) {
                resolve({});
                return;
            }

            try {
                const datos = JSON.parse(cuerpo);

                resolve(datos);
            } catch {
                reject(
                    new Error("El cuerpo debe contener un JSON válido.")
                );
            }
        });

        req.on("error", (error) => {
            reject(error);
        });
    });
}

// ==========================================
// VALIDAR JUGADOR
// ==========================================

function validarJugador(datos) {
    const errores = [];

    if (
        !datos.nombre ||
        typeof datos.nombre !== "string" ||
        datos.nombre.trim() === ""
    ) {
        errores.push(
            "El nombre es obligatorio y debe ser texto."
        );
    }

    if (
        datos.nivel === undefined ||
        !Number.isInteger(datos.nivel) ||
        datos.nivel < 1 ||
        datos.nivel > 100
    ) {
        errores.push(
            "El nivel debe ser un número entero entre 1 y 100."
        );
    }

    if (
        datos.victorias === undefined ||
        !Number.isInteger(datos.victorias) ||
        datos.victorias < 0
    ) {
        errores.push(
            "Las victorias deben ser un número entero mayor o igual a 0."
        );
    }

    return errores;
}

// ==========================================
// OBTENER ID DESDE LA RUTA
// ==========================================

function obtenerIdDesdeRuta(ruta) {
    const partes = ruta.split("/");

    if (partes.length !== 3 || partes[1] !== "jugadores") {
        return null;
    }

    const id = Number(partes[2]);

    if (!Number.isInteger(id) || id <= 0) {
        return null;
    }

    return id;
}

// ==========================================
// CREAR SERVIDOR
// ==========================================

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
                mensaje: "API Battle Royale funcionando correctamente.",
                tecnologia: "Node.js - ES Modules",
                endpoints: [
                    "GET /jugadores",
                    "GET /jugadores/:id",
                    "POST /jugadores",
                    "PUT /jugadores/:id",
                    "DELETE /jugadores/:id"
                ]
            });

            return;
        }

        // ==========================================
        // GET /jugadores
        // ==========================================

        if (metodo === "GET" && ruta === "/jugadores") {
            enviarRespuesta(res, 200, {
                total: jugadores.length,
                jugadores: jugadores
            });

            return;
        }

        // ==========================================
        // OBTENER ID
        // ==========================================

        const id = obtenerIdDesdeRuta(ruta);

        // ==========================================
        // GET /jugadores/:id
        // ==========================================

        if (metodo === "GET" && id !== null) {
            const jugador = jugadores.find(
                (item) => item.id === id
            );

            if (!jugador) {
                enviarRespuesta(res, 404, {
                    error: "Jugador no encontrado."
                });

                return;
            }

            enviarRespuesta(res, 200, jugador);

            return;
        }

        // ==========================================
        // POST /jugadores
        // ==========================================

        if (metodo === "POST" && ruta === "/jugadores") {
            const datos = await leerCuerpo(req);

            const errores = validarJugador(datos);

            if (errores.length > 0) {
                enviarRespuesta(res, 400, {
                    error: "Los datos enviados no son válidos.",
                    detalles: errores
                });

                return;
            }

            const nuevoJugador = {
                id: siguienteId,
                nombre: datos.nombre.trim(),
                nivel: datos.nivel,
                victorias: datos.victorias
            };

            jugadores.push(nuevoJugador);

            siguienteId++;

            enviarRespuesta(res, 201, {
                mensaje: "Jugador creado correctamente.",
                jugador: nuevoJugador
            });

            return;
        }



        if (
            (metodo === "PUT" || metodo === "DELETE") &&
            id === null
        ) {
            enviarRespuesta(res, 400, {
                error: "El ID debe ser un número entero positivo."
            });

            return;
        }


        if (metodo === "PUT" && id !== null) {
            const posicion = jugadores.findIndex(
                (item) => item.id === id
            );

            if (posicion === -1) {
                enviarRespuesta(res, 404, {
                    error: "Jugador no encontrado."
                });

                return;
            }

            const datos = await leerCuerpo(req);

            const errores = validarJugador(datos);

            if (errores.length > 0) {
                enviarRespuesta(res, 400, {
                    error: "Los datos enviados no son válidos.",
                    detalles: errores
                });

                return;
            }

            jugadores[posicion] = {
                id: id,
                nombre: datos.nombre.trim(),
                nivel: datos.nivel,
                victorias: datos.victorias
            };

            enviarRespuesta(res, 200, {
                mensaje: "Jugador actualizado correctamente.",
                jugador: jugadores[posicion]
            });

            return;
        }

        // ==========================================
        // DELETE /jugadores/:id
        // ==========================================

        if (metodo === "DELETE" && id !== null) {
            const posicion = jugadores.findIndex(
                (item) => item.id === id
            );

            if (posicion === -1) {
                enviarRespuesta(res, 404, {
                    error: "Jugador no encontrado."
                });

                return;
            }

            const jugadorEliminado = jugadores.splice(
                posicion,
                1
            )[0];

            enviarRespuesta(res, 200, {
                mensaje: "Jugador eliminado correctamente.",
                jugador: jugadorEliminado
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

// ==========================================
// INICIAR SERVIDOR
// ==========================================

servidor.listen(PORT, () => {
    console.log("----------------------------------------");
    console.log("API Battle Royale");
    console.log("----------------------------------------");
    console.log(`Servidor: http://localhost:${PORT}`);
    console.log("Servidor iniciado correctamente.");
    console.log("----------------------------------------");
});