#!/usr/bin/env node

/**
 * Wilder Catú
 * Ejercicio: JSON y persistencia simple
 * Temática: Kickboxing
 *
 * API REST sencilla utilizando únicamente Node.js.
 *
 * Persistencia:
 * Los datos se almacenan en el archivo kickboxers.json.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const ARCHIVO_DATOS = path.join(__dirname, "kickboxers.json");

/**
 * Datos iniciales utilizados únicamente si
 * kickboxers.json todavía no existe.
 */
const datosIniciales = [
  {
    id: 1,
    nombre: "Alex Pereira",
    nacionalidad: "Brasil",
    categoria: "Peso semipesado",
    victorias: 35,
    derrotas: 7
  },
  {
    id: 2,
    nombre: "Rico Verhoeven",
    nacionalidad: "Países Bajos",
    categoria: "Peso pesado",
    victorias: 65,
    derrotas: 10
  },
  {
    id: 3,
    nombre: "Badr Hari",
    nacionalidad: "Marruecos",
    categoria: "Peso pesado",
    victorias: 106,
    derrotas: 17
  }
];

/**
 * Crea el archivo JSON inicial si no existe.
 */
function inicializarArchivo() {
  if (!fs.existsSync(ARCHIVO_DATOS)) {
    fs.writeFileSync(
      ARCHIVO_DATOS,
      JSON.stringify(datosIniciales, null, 2),
      "utf-8"
    );

    console.log("Archivo kickboxers.json creado.");
  }
}

/**
 * Lee los datos almacenados en el archivo JSON.
 *
 * @returns {Array}
 */
function leerDatos() {
  try {
    const contenido = fs.readFileSync(
      ARCHIVO_DATOS,
      "utf-8"
    );

    return JSON.parse(contenido);
  } catch (error) {
    console.error("Error al leer kickboxers.json:", error.message);
    return [];
  }
}

/**
 * Guarda los datos en el archivo JSON.
 *
 * @param {Array} datos
 */
function guardarDatos(datos) {
  try {
    fs.writeFileSync(
      ARCHIVO_DATOS,
      JSON.stringify(datos, null, 2),
      "utf-8"
    );

    return true;
  } catch (error) {
    console.error(
      "Error al guardar los datos:",
      error.message
    );

    return false;
  }
}

/**
 * Envía una respuesta JSON.
 */
function enviarJSON(res, statusCode, datos) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });

  res.end(JSON.stringify(datos, null, 2));
}

/**
 * Lee el body de una petición HTTP.
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
        const datos = JSON.parse(body);
        resolve(datos);
      } catch (error) {
        reject(new Error("El body debe contener JSON válido."));
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
    mensaje: "API de Kickboxing",
    descripcion: "API con persistencia simple mediante JSON",
    rutas: [
      "GET /api/kickboxers",
      "GET /api/kickboxers/:id",
      "POST /api/kickboxers",
      "PUT /api/kickboxers/:id"
    ]
  });
}

/**
 * GET /api/kickboxers
 */
function listarKickboxers(req, res) {
  const datos = leerDatos();

  enviarJSON(res, 200, {
    total: datos.length,
    kickboxers: datos
  });
}

/**
 * GET /api/kickboxers/:id
 */
function obtenerKickboxer(req, res, id) {
  const datos = leerDatos();
  const idNumerico = Number(id);

  if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
    enviarJSON(res, 400, {
      error: "El ID debe ser un número entero positivo."
    });

    return;
  }

  const kickboxer = datos.find(
    (item) => item.id === idNumerico
  );

  if (!kickboxer) {
    enviarJSON(res, 404, {
      error: `No existe un kickboxer con el ID ${idNumerico}.`
    });

    return;
  }

  enviarJSON(res, 200, kickboxer);
}

/**
 * POST /api/kickboxers
 */
async function crearKickboxer(req, res) {
  try {
    const body = await leerBody(req);

    const {
      nombre,
      nacionalidad,
      categoria,
      victorias,
      derrotas
    } = body;

    if (
      !nombre ||
      !nacionalidad ||
      !categoria ||
      victorias === undefined ||
      derrotas === undefined
    ) {
      enviarJSON(res, 400, {
        error:
          "Los campos nombre, nacionalidad, categoria, victorias y derrotas son obligatorios."
      });

      return;
    }

    if (
      !Number.isInteger(victorias) ||
      victorias < 0 ||
      !Number.isInteger(derrotas) ||
      derrotas < 0
    ) {
      enviarJSON(res, 400, {
        error:
          "Victorias y derrotas deben ser números enteros mayores o iguales a 0."
      });

      return;
    }

    const datos = leerDatos();

    const nuevoId =
      datos.length > 0
        ? Math.max(...datos.map((item) => item.id)) + 1
        : 1;

    const nuevoKickboxer = {
      id: nuevoId,
      nombre: String(nombre).trim(),
      nacionalidad: String(nacionalidad).trim(),
      categoria: String(categoria).trim(),
      victorias,
      derrotas
    };

    datos.push(nuevoKickboxer);

    const guardado = guardarDatos(datos);

    if (!guardado) {
      enviarJSON(res, 500, {
        error: "No fue posible guardar el kickboxer."
      });

      return;
    }

    enviarJSON(res, 201, {
      mensaje: "Kickboxer creado correctamente.",
      kickboxer: nuevoKickboxer
    });
  } catch (error) {
    enviarJSON(res, 400, {
      error: error.message
    });
  }
}

/**
 * PUT /api/kickboxers/:id
 */
async function actualizarKickboxer(req, res, id) {
  try {
    const idNumerico = Number(id);

    if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
      enviarJSON(res, 400, {
        error: "El ID debe ser un número entero positivo."
      });

      return;
    }

    const body = await leerBody(req);
    const datos = leerDatos();

    const indice = datos.findIndex(
      (item) => item.id === idNumerico
    );

    if (indice === -1) {
      enviarJSON(res, 404, {
        error: `No existe un kickboxer con el ID ${idNumerico}.`
      });

      return;
    }

    const kickboxerActualizado = {
      ...datos[indice],
      ...body,
      id: idNumerico
    };

    if (
      typeof kickboxerActualizado.victorias !== "number" ||
      !Number.isInteger(kickboxerActualizado.victorias) ||
      kickboxerActualizado.victorias < 0
    ) {
      enviarJSON(res, 400, {
        error: "Victorias debe ser un entero mayor o igual a 0."
      });

      return;
    }

    if (
      typeof kickboxerActualizado.derrotas !== "number" ||
      !Number.isInteger(kickboxerActualizado.derrotas) ||
      kickboxerActualizado.derrotas < 0
    ) {
      enviarJSON(res, 400, {
        error: "Derrotas debe ser un entero mayor o igual a 0."
      });

      return;
    }

    datos[indice] = kickboxerActualizado;

    const guardado = guardarDatos(datos);

    if (!guardado) {
      enviarJSON(res, 500, {
        error: "No fue posible guardar los cambios."
      });

      return;
    }

    enviarJSON(res, 200, {
      mensaje: "Kickboxer actualizado correctamente.",
      kickboxer: kickboxerActualizado
    });
  } catch (error) {
    enviarJSON(res, 400, {
      error: error.message
    });
  }
}

/**
 * Router principal.
 */
function manejarRutas(req, res) {
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
    ruta === "/api/kickboxers"
  ) {
    listarKickboxers(req, res);
    return;
  }

  const coincidencia = ruta.match(
    /^\/api\/kickboxers\/(\d+)$/
  );

  if (
    req.method === "GET" &&
    coincidencia
  ) {
    obtenerKickboxer(
      req,
      res,
      coincidencia[1]
    );
    return;
  }

  if (
    req.method === "POST" &&
    ruta === "/api/kickboxers"
  ) {
    crearKickboxer(req, res);
    return;
  }

  if (
    req.method === "PUT" &&
    coincidencia
  ) {
    actualizarKickboxer(
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
 * Inicia la aplicación.
 */
function iniciarServidor() {
  inicializarArchivo();

  const servidor = http.createServer(manejarRutas);

  servidor.listen(PORT, () => {
    console.log("========================================");
    console.log("          API DE KICKBOXING");
    console.log("========================================");
    console.log(`Servidor: http://localhost:${PORT}`);
    console.log(`Datos: ${ARCHIVO_DATOS}`);
    console.log("========================================");
  });
}

iniciarServidor();