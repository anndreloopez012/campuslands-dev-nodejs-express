/**
 * Rate limiter de ventana deslizante (sliding window) en memoria.
 *
 * Para cada clave guarda las marcas de tiempo de las peticiones dentro de la ventana:
 *   { clave: [t1, t2, ...] }
 * Si las marcas activas alcanzan el maximo, rechaza con 429 y `Retry-After`.
 *
 * Por que ventana deslizante y no contador fijo: una ventana fija dejaria pasar
 * hasta 2x el maximo justo en el borde entre dos ventanas consecutivas;
 * la ventana deslizante mira "los ultimos N ms" de verdad.
 */
function crearRateLimiter({ maximo = 5, ventanaMs = 10000, resolverClave } = {}) {
  const marcas = new Map();

  function limpiar(ahora) {
    for (const [clave, lista] of marcas) {
      const activos = lista.filter((t) => t > ahora - ventanaMs);
      if (activos.length === 0) {
        marcas.delete(clave);
      } else {
        marcas.set(clave, activos);
      }
    }
  }

  function middleware(req, res, next) {
    const ahora = Date.now();
    limpiar(ahora);

    const clave = resolverClave ? resolverClave(req) : req.ip || 'desconocido';
    const lista = marcas.get(clave) || [];

    if (lista.length >= maximo) {
      const masAntiguo = Math.min(...lista);
      const reintentarEn = Math.max(1, Math.ceil((masAntiguo + ventanaMs - ahora) / 1000));

      res.set({
        'RateLimit-Limit': String(maximo),
        'RateLimit-Reset': String(reintentarEn),
        'Retry-After': String(reintentarEn)
      });

      // 429 directo: este middleware es el dueño del limite
      return res.status(429).json({
        ok: false,
        error: 'RateLimitExceeded',
        message: `Demasiadas peticiones: limite de ${maximo} cada ${ventanaMs / 1000} s. Reintenta en ${reintentarEn} s`,
        limit: maximo,
        ventana_segundos: ventanaMs / 1000,
        reintenta_en_segundos: reintentarEn
      });
    }

    lista.push(ahora);
    marcas.set(clave, lista);

    res.set('RateLimit-Limit', String(maximo));
    res.set('RateLimit-Remaining', String(maximo - lista.length));

    return next();
  }

  return middleware;
}

module.exports = { crearRateLimiter };
