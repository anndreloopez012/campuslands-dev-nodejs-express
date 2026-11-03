import { AppError } from '../utils/app-error.js';

// 404 para rutas inexistentes
export const notFoundHandler = (req, res, next) => {
  next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
};

// Middleware global de errores (4 argumentos)
export const errorHandler = (err, req, res, next) => {
  // JSON mal formado enviado por el cliente
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, message: "El cuerpo JSON es inválido" });
  }

  const statusCode = err.statusCode || 500;

  // Los errores inesperados no exponen detalles internos
  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    ok: false,
    message: statusCode === 500 ? "Error interno del servidor" : err.message
  });
};
