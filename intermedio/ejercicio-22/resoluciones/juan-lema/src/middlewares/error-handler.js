function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status === 500) console.error(err);

  res.status(status).json({ ok: false, message: status === 500 ? "Error interno" : err.message });
}

export { errorHandler };
