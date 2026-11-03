export const notFound = (req, res) => {
  res.status(404).json({ ok: false, message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  if (!err.isOperational) console.error(err);
  res.status(status).json({
    ok: false,
    message: err.isOperational ? err.message : 'Error interno del servidor',
  });
};
