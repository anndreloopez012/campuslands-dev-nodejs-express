const { AppError } = require('../errors/app.error');

/**
 * Middleware de errores centralizado.
 *
 * Comportamiento:
 * 1. Respeta respuestas ya enviadas reenviando al siguiente handler.
 * 2. Si el error pertenece al dominio (instancia de AppError) responde
 *    con su statusCode y un cuerpo uniforme.
 * 3. Errores desconocidos se loguean y siempre responden 500 sin exponer analisis internos.
 * 4. En desarrollo (NODE_ENV != 'production') agrega `stack` al cuerpo.
 */
function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  const oculto = !(error instanceof AppError);
  if (oculto) {
    console.error(`[ERROR NO MANEJADO] ${req.method} ${req.originalUrl} -> ${error.stack}`);
  }

  const statusCode = error.statusCode || 500;
  const cuerpo = {
    ok: false,
    error: oculto ? 'InternalServerError' : error.name,
    message: oculto ? 'Error interno del servidor' : error.message
  };

  if (Array.isArray(error.detalles) && error.detalles.length > 0) {
    cuerpo.detalles = error.detalles;
  }

  if (process.env.NODE_ENV !== 'production' && typeof error.stack === 'string' && !oculto) {
    cuerpo.stack = error.stack;
  }

  return res.status(statusCode).json(cuerpo);
}

module.exports = errorHandler;
