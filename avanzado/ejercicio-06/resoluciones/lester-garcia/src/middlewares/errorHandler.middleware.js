export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    ok: false,
    status: err.status || "error",
    statusCode,
    ...(err.domainCode ? { domainCode: err.domainCode } : {}),
    message: err.message || "Error interno del servidor.",
    ...(err.errors && err.errors.length > 0 ? { errors: err.errors } : {})
  });
};
