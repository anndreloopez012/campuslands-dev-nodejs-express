const METHODS_WITH_BODY = ['POST', 'PUT', 'PATCH'];

// Rechaza con 415 las peticiones con cuerpo que no declaran Content-Type: application/json.
function requireJson(req, res, next) {
  if (METHODS_WITH_BODY.includes(req.method)) {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.startsWith('application/json')) {
      return res.status(415).json({ ok: false, message: 'Content-Type debe ser application/json' });
    }
  }
  next();
}

module.exports = { requireJson };
