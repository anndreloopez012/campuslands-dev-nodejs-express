// Middleware central de errores: traduce errores (con o sin status) a codigos HTTP.
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = status === 500 ? "Error interno del servidor" : err.message;
  res.status(status).json({ ok: false, message });
}

export { errorHandler };
