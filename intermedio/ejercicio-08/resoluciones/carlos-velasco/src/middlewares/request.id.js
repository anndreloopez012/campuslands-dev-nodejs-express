const { randomUUID } = require('node:crypto');

const HEADER_ENTRADA = 'x-request-id';
const HEADER_SALIDA = 'x-response-id';

/**
 * Middleware de request id.
 *
 * Responsibilities:
 * - Toma el id que llega en `x-request-id` (proxy/balancer) si es valido.
 * - Si no llega, genera uno unico con crypto.randomUUID().
 * - Expone `req.requestId` para el resto del pipeline.
 * - Devuelve el id en `x-response-id` y lo agrega a cada respuesta JSON.
 * - Loguea cada peticion con su id, metodo, ruta y duracion al finalizar.
 */
function requestId(req, res, next) {
  const entrante = req.headers[HEADER_ENTRADA];
  const valido = typeof entrante === 'string' && entrante.length > 0 && entrante.length <= 100;
  const id = valido ? entrante : randomUUID();

  req.requestId = id;
  res.setHeader(HEADER_SALIDA, id);

  const inicio = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duracionMs = Date.now() - inicio;
    console.log(`[${id}] ${method} ${originalUrl} -> ${res.statusCode} (${duracionMs} ms)`);
  });

  next();
}

function dataConId(res, datos) {
  return typeof datos === 'object' && datos !== null ? { requestId: res.getHeader(HEADER_SALIDA), ...datos } : datos;
}

module.exports = { requestId, dataConId, HEADER_ENTRADA, HEADER_SALIDA };
