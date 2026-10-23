const { randomUUID } = require('node:crypto');

// Middleware propio: agrega un id a cada peticion y lo devuelve en la cabecera X-Request-Id.
function requestId(req, res, next) {
  req.id = randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
}

module.exports = { requestId };
