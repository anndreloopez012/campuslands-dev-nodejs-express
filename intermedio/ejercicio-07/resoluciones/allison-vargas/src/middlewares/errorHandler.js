import { AppError, ValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

function normalizar(err) {
  if (err instanceof AppError) return err;

  if (err.type === 'entity.parse.failed') {
    return new ValidationError('El body no es un JSON valido', undefined, 'JSON_INVALIDO');
  }
  if (err.type === 'entity.too.large') {
    return new AppError('El body supera el tamano permitido', 413, 'BODY_MUY_GRANDE');
  }

  const inesperado = new AppError('Error interno del servidor', 500, 'ERROR_INTERNO');
  inesperado.isOperational = false;
  inesperado.causa = err;
  return inesperado;
}

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const error = normalizar(err);
  const contexto = { solicitudId: req.id, metodo: req.method, ruta: req.originalUrl };

  if (error.statusCode >= 500) {
    logger.error(error.causa?.stack ?? error.stack, contexto);
  } else {
    logger.warn(`${error.codigo}: ${error.message}`, contexto);
  }

  const body = {
    ok: false,
    message: error.message,
    codigo: error.codigo,
    solicitudId: req.id,
  };
  if (error.detalles) body.errores = error.detalles;
  if (process.env.NODE_ENV !== 'production' && !error.isOperational) {
    body.stack = (error.causa ?? error).stack;
  }

  res.status(error.statusCode).json(body);
};
