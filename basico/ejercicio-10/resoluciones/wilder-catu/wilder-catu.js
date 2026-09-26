

const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const PORT = 3000;
const ARCHIVO_DATOS = path.join(__dirname, "players.json");

const jugadoresIniciales = [
  {
    id: 1,
    nombre: "Carlos Méndez",
    pais: "Guatemala",
    ranking: 1,
    victorias: 18,
    derrotas: 3
  },
  {
    id: 2,
    nombre: "Daniel López",
    pais: "México",
    ranking: 2,
    victorias: 16,
    derrotas: 5
  },
  {
    id: 3,
    nombre: "Andrés García",
    pais: "España",
    ranking: 3,
    victorias: 14,
    derrotas: 6
  }
];

/**
 * Crea el archivo de jugadores si todavía no existe.
 *
 * Esta función es asíncrona porque utiliza
 * fs/promises.
 */
async function inicializarArchivo() {
  try {
    await fs.access(ARCHIVO_DATOS);
  } catch {
    await fs.writeFile(
      ARCHIVO_DATOS,
      JSON.stringify(jugadoresIniciales, null, 2),
      "utf-8"
    );

    console.log("Archivo players.json creado.");
  }
}

/**
 * Lee los jugadores desde el archivo JSON.
 *
 * @returns {Promise<Array>}
 */
async function leerJugadores() {
  const contenido = await fs.readFile(
    ARCHIVO_DATOS,
    "utf-8"
  );

  return JSON.parse(contenido);
}

/**
 * Guarda los jugadores en el archivo JSON.
 *
 * @param {Array} jugadores
 * @returns {Promise<void>}
 */
async function guardarJugadores(jugadores) {
  await fs.writeFile(
    ARCHIVO_DATOS,
    JSON.stringify(jugadores, null, 2),
    "utf-8"
  );
}

/**
 * Envía una respuesta JSON.
 *
 * @param {http.ServerResponse} res
 * @param {number} statusCode
 * @param {Object} datos
 */
function enviarJSON(res, statusCode, datos) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });

  res.end(JSON.stringify(datos, null, 2));
}

/**
 * Lee el body de una petición de manera asíncrona.
 *
 * @param {http.IncomingMessage} req
 * @returns {Promise<Object>}
 */
function leerBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (parte) => {
      body += parte;
    });

    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(
          new Error("El body debe contener JSON válido.")
        );
      }
    });

    req.on("error", reject);
  });
}

/**
 * GET /
 */
function inicio(req, res) {
  enviarJSON(res, 200, {
    mensaje: "API de Ping Pong",
    descripcion:
      "API educativa para practicar funciones asíncronas",
    rutas: [
      "GET /api/jugadores",
      "GET /api/jugadores/:id",
      "POST /api/jugadores",
      "PUT /api/jugadores/:id"
    ]
  });
}

/**
 * GET /api/jugadores
 *
 * Utiliza await para obtener los datos.
 */
async function listarJugadores(req, res) {
  try {
    const jugadores = await leerJugadores();

    enviarJSON(res, 200, {
      total: jugadores.length,
      jugadores
    });
  } catch (error) {
    console.error(
      "Error al listar jugadores:",
      error.message
    );

    enviarJSON(res, 500, {
      error: "No fue posible obtener los jugadores."
    });
  }
}

/**
 * GET /api/jugadores/:id
 */
async function obtenerJugador(req, res, id) {
  try {
    const idNumerico = Number(id);

    if (
      !Number.isInteger(idNumerico) ||
      idNumerico <= 0
    ) {
      enviarJSON(res, 400, {
        error:
          "El ID debe ser un número entero positivo."
      });

      return;
    }

    const jugadores = await leerJugadores();

    const jugador = jugadores.find(
      (item) => item.id === idNumerico
    );

    if (!jugador) {
      enviarJSON(res, 404, {
        error:
          `No existe un jugador con el ID ${idNumerico}.`
      });

      return;
    }

    enviarJSON(res, 200, jugador);
  } catch (error) {
    console.error(
      "Error al obtener jugador:",
      error.message
    );

    enviarJSON(res, 500, {
      error: "No fue posible obtener el jugador."
    });
  }
}

/**
 * POST /api/jugadores
 */
async function crearJugador(req, res) {
  try {
    const body = await leerBody(req);

    const {
      nombre,
      pais,
      ranking,
      victorias,
      derrotas
    } = body;

    if (
      !nombre ||
      !pais ||
      ranking === undefined ||
      victorias === undefined ||
      derrotas === undefined
    ) {
      enviarJSON(res, 400, {
        error:
          "Los campos nombre, pais, ranking, victorias y derrotas son obligatorios."
      });

      return;
    }

    if (
      !Number.isInteger(ranking) ||
      ranking <= 0
    ) {
      enviarJSON(res, 400, {
        error:
          "El ranking debe ser un número entero positivo."
      });

      return;
    }

    if (
      !Number.isInteger(victorias) ||
      victorias < 0
    ) {
      enviarJSON(res, 400, {
        error:
          "Las victorias deben ser un número entero mayor o igual a 0."
      });

      return;
    }

    if (
      !Number.isInteger(derrotas) ||
      derrotas < 0
    ) {
      enviarJSON(res, 400, {
        error:
          "Las derrotas deben ser un número entero mayor o igual a 0."
      });

      return;
    }

    const jugadores = await leerJugadores();

    const nuevoId =
      jugadores.length > 0
        ? Math.max(
            ...jugadores.map((jugador) => jugador.id)
          ) + 1
        : 1;

    const nuevoJugador = {
      id: nuevoId,
      nombre: String(nombre).trim(),
      pais: String(pais).trim(),
      ranking,
      victorias,
      derrotas
    };

    jugadores.push(nuevoJugador);

    await guardarJugadores(jugadores);

    enviarJSON(res, 201, {
      mensaje: "Jugador creado correctamente.",
      jugador: nuevoJugador
    });
  } catch (error) {
    console.error(
      "Error al crear jugador:",
      error.message
    );

    enviarJSON(res, 400, {
      error: error.message
    });
  }
}

/**
 * PUT /api/jugadores/:id
 */
async function actualizarJugador(req, res, id) {
  try {
    const idNumerico = Number(id);

    if (
      !Number.isInteger(idNumerico) ||
      idNumerico <= 0
    ) {
      enviarJSON(res, 400, {
        error:
          "El ID debe ser un número entero positivo."
      });

      return;
    }

    const body = await leerBody(req);
    const jugadores = await leerJugadores();

    const indice = jugadores.findIndex(
      (jugador) => jugador.id === idNumerico
    );

    if (indice === -1) {
      enviarJSON(res, 404, {
        error:
          `No existe un jugador con el ID ${idNumerico}.`
      });

      return;
    }

    const jugadorActualizado = {
      ...jugadores[indice],
      ...body,
      id: idNumerico
    };

    if (
      !Number.isInteger(jugadorActualizado.ranking) ||
      jugadorActualizado.ranking <= 0
    ) {
      enviarJSON(res, 400, {
        error:
          "El ranking debe ser un número entero positivo."
      });

      return;
    }

    if (
      !Number.isInteger(jugadorActualizado.victorias) ||
      jugadorActualizado.victorias < 0
    ) {
      enviarJSON(res, 400, {
        error:
          "Las victorias deben ser un número entero mayor o igual a 0."
      });

      return;
    }

    if (
      !Number.isInteger(jugadorActualizado.derrotas) ||
      jugadorActualizado.derrotas < 0
    ) {
      enviarJSON(res, 400, {
        error:
          "Las derrotas deben ser un número entero mayor o igual a 0."
      });

      return;
    }

    jugadores[indice] = jugadorActualizado;

    await guardarJugadores(jugadores);

    enviarJSON(res, 200, {
      mensaje: "Jugador actualizado correctamente.",
      jugador: jugadorActualizado
    });
  } catch (error) {
    console.error(
      "Error al actualizar jugador:",
      error.message
    );

    enviarJSON(res, 400, {
      error: error.message
    });
  }
}

/**
 * Router principal.
 *
 * Las funciones async son utilizadas para manejar
 * operaciones que dependen de datos externos.
 */
async function manejarRutas(req, res) {
  const url = new URL(
    req.url,
    `http://${req.headers.host || "localhost"}`
  );

  const ruta = url.pathname;

  if (req.method === "GET" && ruta === "/") {
    inicio(req, res);
    return;
  }

  if (
    req.method === "GET" &&
    ruta === "/api/jugadores"
  ) {
    await listarJugadores(req, res);
    return;
  }

  const coincidencia = ruta.match(
    /^\/api\/jugadores\/(\d+)$/
  );

  if (
    req.method === "GET" &&
    coincidencia
  ) {
    await obtenerJugador(
      req,
      res,
      coincidencia[1]
    );
    return;
  }

  if (
    req.method === "POST" &&
    ruta === "/api/jugadores"
  ) {
    await crearJugador(req, res);
    return;
  }

  if (
    req.method === "PUT" &&
    coincidencia
  ) {
    await actualizarJugador(
      req,
      res,
      coincidencia[1]
    );
    return;
  }

  enviarJSON(res, 404, {
    error: "Ruta o método no encontrado."
  });
}

/**
 * Inicia el servidor de forma asíncrona.
 */
async function iniciarServidor() {
  try {
    await inicializarArchivo();

    const servidor = http.createServer(
      (req, res) => {
        manejarRutas(req, res).catch((error) => {
          console.error(
            "Error inesperado:",
            error.message
          );

          enviarJSON(res, 500, {
            error: "Error interno del servidor."
          });
        });
      }
    );

    servidor.listen(PORT, () => {
      console.log("========================================");
      console.log("           API DE PING PONG");
      console.log("========================================");
      console.log(
        `Servidor: http://localhost:${PORT}`
      );
      console.log(
        "Funciones asíncronas: async/await"
      );
      console.log("========================================");
    });
  } catch (error) {
    console.error(
      "No fue posible iniciar el servidor:",
      error.message
    );

    process.exit(1);
  }
}

iniciarServidor();