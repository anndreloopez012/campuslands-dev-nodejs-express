// Middleware global de manejo de errores de Express (debe recibir 4 argumentos)
export const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorType = err.errorType || 'InternalServerError';

  console.error(`[ERROR HANDLER] [${req.method}] ${req.url} -> [${statusCode}] ${err.message}`);

  return res.status(statusCode).json({
    ok: false,
    status: statusCode,
    error: errorType,
    message: err.message || 'Ocurrió un error inesperado en el servidor.',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
};
