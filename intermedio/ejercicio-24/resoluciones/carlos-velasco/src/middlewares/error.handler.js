const { AppError } = require('../errors/app.error');

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      ok: false,
      error: error.name,
      message: error.message
    });
  }

  if (error instanceof TypeError) {
    // Errores del servicio puro (formula invalida, elemento desconocido)
    return res.status(400).json({ ok: false, error: 'ValidationError', message: error.message });
  }

  console.error(`[ERROR NO MANEJADO] ${error.stack}`);
  return res.status(500).json({
    ok: false,
    error: 'InternalServerError',
    message: 'Error interno del servidor'
  });
}

module.exports = errorHandler;
