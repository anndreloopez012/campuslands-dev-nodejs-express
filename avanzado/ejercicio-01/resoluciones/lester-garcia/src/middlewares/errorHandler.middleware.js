export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  res.status(statusCode).json({
    ok: false,
    status,
    statusCode,
    message: err.message || "Error interno del servidor RPG.",
    ...(err.errors && err.errors.length > 0 ? { errors: err.errors } : {})
  });
};
