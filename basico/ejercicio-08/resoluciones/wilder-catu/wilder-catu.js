
const http = require("http");

const hiperdeportivos = [
  {
    id: 1,
    marca: "Bugatti",
    modelo: "Chiron Super Sport",
    anio: 2024,
    velocidadMaxima: 440
  },
  {
    id: 2,
    marca: "Koenigsegg",
    modelo: "Jesko Absolut",
    anio: 2024,
    velocidadMaxima: 531
  },
  {
    id: 3,
    marca: "Pagani",
    modelo: "Utopia",
    anio: 2024,
    velocidadMaxima: 350
  },
  {
    id: 4,
    marca: "McLaren",
    modelo: "Speedtail",
    anio: 2024,
    velocidadMaxima: 403
  }
];

/**
 * Obtiene y valida el puerto desde las variables de entorno.
 *
 * Si PORT no existe, se utiliza 3000 como valor predeterminado.
 */
function obtenerPuerto() {
  const puerto = process.env.PORT || "3000";
  const puertoNumerico = Number(puerto);

  if (
    !Number.isInteger(puertoNumerico) ||
    puertoNumerico <= 0 ||
    puertoNumerico > 65535
  ) {
    console.error("Error: PORT debe ser un número entre 1 y 65535.");
    process.exit(1);
  }

  return puertoNumerico;
}

/**
 * Obtiene el entorno de ejecución.
 */
function obtenerEntorno() {
  return process.env.NODE_ENV || "development";
}

/**
 * Devuelve información en formato JSON.
 */
function enviarJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });

  res.end(JSON.stringify(data, null, 2));
}

/**
 * Ruta principal.
 */
function rutaInicio(req, res) {
  enviarJSON(res, 200, {
    mensaje: "API de Hiperdeportivos",
    entorno: obtenerEntorno(),
    puerto: obtenerPuerto(),
    rutas: [
      "GET /",
      "GET /api/hiperdeportivos",
      "GET /api/hiperdeportivos/:id",
      "GET /api/config"
    ]
  });
}

/**
 * Devuelve todos los hiperdeportivos.
 */
function listarHiperdeportivos(req, res) {
  enviarJSON(res, 200, {
    total: hiperdeportivos.length,
    datos: hiperdeportivos
  });
}

/**
 * Devuelve un hiperdeportivo por ID.
 */
function obtenerHiperdeportivo(req, res, id) {
  const idNumerico = Number(id);

  if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
    enviarJSON(res, 400, {
      error: "El ID debe ser un número entero positivo."
    });

    return;
  }

  const hiperdeportivo = hiperdeportivos.find(
    (auto) => auto.id === idNumerico
  );

  if (!hiperdeportivo) {
    enviarJSON(res, 404, {
      error: `No existe un hiperdeportivo con el ID ${idNumerico}.`
    });

    return;
  }

  enviarJSON(res, 200, hiperdeportivo);
}

/**
 * Muestra únicamente configuración no sensible.
 *
 * Importante:
 * Nunca se debe devolver una API_KEY real en una respuesta.
 */
function mostrarConfiguracion(req, res) {
  enviarJSON(res, 200, {
    entorno: obtenerEntorno(),
    puerto: obtenerPuerto(),
    apiKeyConfigurada: Boolean(process.env.API_KEY)
  });
}

/**
 * Procesa las rutas de la API.
 */
function manejarRutas(req, res) {
  const url = new URL(
    req.url,
    `http://${req.headers.host || "localhost"}`
  );

  const ruta = url.pathname;

  if (req.method !== "GET") {
    enviarJSON(res, 405, {
      error: "Método no permitido. Utiliza GET."
    });

    return;
  }

  if (ruta === "/") {
    rutaInicio(req, res);
    return;
  }

  if (ruta === "/api/hiperdeportivos") {
    listarHiperdeportivos(req, res);
    return;
  }

  if (ruta === "/api/config") {
    mostrarConfiguracion(req, res);
    return;
  }

  const coincidencia = ruta.match(
    /^\/api\/hiperdeportivos\/(\d+)$/
  );

  if (coincidencia) {
    obtenerHiperdeportivo(req, res, coincidencia[1]);
    return;
  }

  enviarJSON(res, 404, {
    error: "Ruta no encontrada."
  });
}

/**
 * Punto de entrada de la aplicación.
 */
function iniciarServidor() {
  const puerto = obtenerPuerto();
  const entorno = obtenerEntorno();

  const servidor = http.createServer(manejarRutas);

  servidor.listen(puerto, () => {
    console.log("========================================");
    console.log("       API DE HIPERDEPORTIVOS");
    console.log("========================================");
    console.log(`Servidor: http://localhost:${puerto}`);
    console.log(`Entorno: ${entorno}`);
    console.log(
      `API_KEY configurada: ${Boolean(process.env.API_KEY)}`
    );
    console.log("========================================");
  });
}

iniciarServidor();