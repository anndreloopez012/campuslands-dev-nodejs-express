const { AppError } = require("../errors/app.error");

function errorHandler(error, req, res, next) {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const message = statusCode === 500 ? "Error interno del servidor" : error.message;

  if (statusCode === 500) {
    console.error(`[${req.method} ${req.originalUrl}]`, error);
  }

  res.status(statusCode).json({
    ok: false,
    message,
    module: req.moduleName || "desconocido",
  });
}

module.exports = errorHandler;
