const errorHandler = (error, req, res, next) => {
  console.error('[ERROR]', error.message);

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    ok: false,
    message: error.message || 'Error interno del servidor'
  });
};

module.exports = errorHandler;