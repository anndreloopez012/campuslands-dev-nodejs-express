/**
 * Middleware CORS implementado a mano para entender el mecanismo.
 *
 * Un navegador, antes de una peticion "no simple" (como POST con JSON),
 * envia una peticion previa OPTIONS (preflight). El servidor debe responder:
 *   - Access-Control-Allow-Origin:   quien puede usar esta API
 *   - Access-Control-Allow-Methods:  metodos permitidos
 *   - Access-Control-Allow-Headers:  headers permitidos (p.ej. Content-Type)
 *   - Access-Control-Max-Age:        cuanto tiempo el navegador recuerda el permiso
 *
 * Para peticiones "simples" (GET con aceptacion) solo se necesita Allow-Origin.
 *
 * El comportamiento se controla con whitelist de origenes; si no coincide,
 * NO se emiten headers CORS y el navegador bloquea la respuesta (no es el caso del servidor rechazando con 403).
 */
const DEFAULTS = {
  allowOrigins: [],
  allowMethods: ['GET', 'POST'],
  allowHeaders: ['Content-Type'],
  maxAge: 600
};

function corsMiddleware({ allowOrigins, allowMethods, allowHeaders, maxAge } = DEFAULTS) {
  return (req, res, next) => {
    const origen = req.headers.origin;

    if (origen && (allowOrigins.includes('*') || allowOrigins.includes(origen))) {
      res.setHeader('Access-Control-Allow-Origin', origen);
      res.setHeader('Vary', 'Origin');

      // Solo credenciales si el origen es explicito (con '*' no se permite credentials)
      if (!allowOrigins.includes('*')) {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
    }

    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', allowMethods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', String(maxAge));
      return res.status(204).end();
    }

    return next();
  };
}

module.exports = { corsMiddleware, DEFAULTS };
