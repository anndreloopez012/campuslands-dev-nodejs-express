import { AppError } from '../utils/AppError.js';

export function rutaNoEncontrada(req, res, next) {
  next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
}

export function manejadorDeErrores(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const esErrorEsperado = error.isOperational === true;

  if (!esErrorEsperado) {
    console.error('Error inesperado:', error);
  }

  return res.status(statusCode).json({
    ok: false,
    message: esErrorEsperado ? error.message : 'Ocurrio un error interno en el servidor',
  });
}
