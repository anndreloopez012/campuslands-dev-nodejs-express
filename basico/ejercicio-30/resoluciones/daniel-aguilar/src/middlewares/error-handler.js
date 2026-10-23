const { AppError, notFound } = require('../utils/app-error');

const notFoundHandler = (req, res, next) => next(notFound(`Ruta ${req.method} ${req.originalUrl} no encontrada`));

function errorHandler(logger) {
  return (error, req, res, next) => {
    if (res.headersSent) return next(error);

    if (error.type === 'entity.parse.failed') {
      return res.status(400).json({ ok: false, error: { code: 'INVALID_JSON', message: 'El cuerpo no es un JSON valido' } });
    }
    if (error instanceof AppError) {
      return res.status(error.status).json({
        ok: false,
        error: { code: error.code, message: error.message, ...(error.details && { details: error.details }) },
      });
    }
    logger.error(`Error no controlado: ${error.message}`, { stack: error.stack });
    res.status(500).json({ ok: false, error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } });
  };
}

module.exports = { notFoundHandler, errorHandler };
