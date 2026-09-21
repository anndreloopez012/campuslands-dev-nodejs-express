function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status === 500) console.error(err);

  const message = err.type === "entity.parse.failed" ? "El cuerpo no es un JSON valido" : err.message;
  res.status(status).json({ ok: false, message: status === 500 ? "Error interno" : message });
}

export { errorHandler };
