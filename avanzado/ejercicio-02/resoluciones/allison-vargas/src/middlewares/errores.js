import { AppError, PayloadTooLargeError, ValidationError } from '../utils/errors.js';

export function normalizar(err) {
  if (err instanceof AppError) return err;
  if (err.type === 'entity.parse.failed') {
    return new ValidationError('El body no es un JSON valido', undefined, 'JSON_INVALIDO');
  }
  if (err.type === 'entity.too.large') return new PayloadTooLargeError();
  const inesperado = new AppError('Error interno del servidor', 500, 'ERROR_INTERNO');
  inesperado.isOperational = false;
  inesperado.causa = err;
  return inesperado;
}

export const manejadorDeErrores = () => (err, req, res, next) => {
  if (res.headersSent) return next(err);
  const error = normalizar(err);
  if (!error.isOperational) {
    req.log.error('error_no_controlado', { error: error.causa?.message, pila: error.causa?.stack });
  }
  if (error.cabeceras) res.set(error.cabeceras);
  const cuerpo = { ok: false, message: error.message, codigo: error.codigo, idPeticion: req.id };
  if (error.detalles) cuerpo.errores = error.detalles;
  return res.status(error.statusCode).json(cuerpo);
};
