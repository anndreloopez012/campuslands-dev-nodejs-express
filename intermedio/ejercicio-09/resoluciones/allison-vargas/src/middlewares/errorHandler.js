import { AppError, ValidationError } from '../utils/errors.js';

function normalizar(err) {
  if (err instanceof AppError) return err;
  if (err.type === 'entity.parse.failed') {
    return new ValidationError('El body no es un JSON valido', undefined, 'JSON_INVALIDO');
  }
  const inesperado = new AppError('Error interno del servidor', 500, 'ERROR_INTERNO');
  inesperado.isOperational = false;
  inesperado.causa = err;
  return inesperado;
}

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const error = normalizar(err);
  if (!error.isOperational) console.error(error.causa);

  const body = { ok: false, message: error.message, codigo: error.codigo };
  if (error.detalles) body.errores = error.detalles;

  res.status(error.statusCode).json(body);
};
