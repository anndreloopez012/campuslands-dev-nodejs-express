function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  res.status(status).json({ ok: false, message: status === 500 ? "Error interno" : err.message });
}

export { errorHandler };
