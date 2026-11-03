const { AppError, NotFoundError } = require('../errors/app-error');

// Se ejecuta cuando ninguna ruta coincidio.
function notFoundHandler(req, res, next) {
  next(new NotFoundError(`Ruta ${req.method} ${req.originalUrl} no encontrada`));
}

// Manejador central: TODAS las respuestas de error salen de aqui con el mismo formato.
function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  // JSON mal formado enviado por el cliente (lo lanza express.json)
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      ok: false,
      error: { code: 'INVALID_JSON', message: 'El cuerpo de la peticion no es un JSON valido' },
    });
  }

  // Errores esperados
  if (error instanceof AppError) {
    return res.status(error.status).json({
      ok: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details && { details: error.details }),
      },
    });
  }

  // Errores inesperados (bugs): se registran completos, pero al cliente no se le filtran detalles.
  console.error('[ERROR NO CONTROLADO]', error);
  res.status(500).json({
    ok: false,
    error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' },
  });
}

module.exports = { notFoundHandler, errorHandler };
