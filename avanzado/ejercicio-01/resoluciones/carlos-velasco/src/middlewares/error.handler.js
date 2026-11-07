const { AppError } = require("../errors/app.error");

function errorHandler(error, req, res, next) {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const message = statusCode === 500 ? "Error interno del servidor" : error.message;

  if (statusCode === 500) {
    console.error("[error no controlado]", error);
  }

  res.status(statusCode).json({
    ok: false,
    message,
    apiVersion: req.apiVersion || "desconocida",
  });
}

module.exports = errorHandler;
