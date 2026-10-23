export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  return res.status(statusCode).json({
    status,
    message: err.message || "Error interno del servidor en el centro de paracaidismo."
  });
};