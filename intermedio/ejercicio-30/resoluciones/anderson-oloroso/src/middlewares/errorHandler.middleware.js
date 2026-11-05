export const globalErrorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  console.error(`[ERROR] [${req.id}] ${err.message}`);

  return res.status(statusCode).json({
    ok: false,
    requestId: req.id,
    status: statusCode,
    message: err.message || 'Error interno del servidor',
    timestamp: new Date().toISOString()
  });
};
