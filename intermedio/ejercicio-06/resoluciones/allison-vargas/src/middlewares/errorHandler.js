export const notFound = (req, res) => {
  res.status(404).json({ ok: false, message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, message: 'El body no es un JSON valido' });
  }

  const status = err.statusCode || 500;
  if (!err.isOperational) console.error(err);

  const body = {
    ok: false,
    message: err.isOperational ? err.message : 'Error interno del servidor',
  };
  if (err.detalles) body.errores = err.detalles;

  res.status(status).json(body);
};
