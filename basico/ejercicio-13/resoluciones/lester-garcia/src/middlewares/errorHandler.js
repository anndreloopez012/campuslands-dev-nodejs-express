export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  console.error(`[SYSTEM ERROR] ${err.name}: ${err.message}`);

  return res.status(statusCode).json({
    status,
    message: err.message || "Error interno del servidor en la red de telemetría.",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};