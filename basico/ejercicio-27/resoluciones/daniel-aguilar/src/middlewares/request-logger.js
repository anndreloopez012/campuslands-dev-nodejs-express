// Registra UNA linea por peticion al terminar la respuesta: metodo, ruta, estado y duracion.
// El nivel depende del resultado: 5xx -> error, 4xx -> warn, el resto -> info.
function requestLogger(logger) {
  return (req, res, next) => {
    const startedAt = process.hrtime.bigint();
    res.on('finish', () => {
      const ms = Number(process.hrtime.bigint() - startedAt) / 1e6;
      const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
      logger[level](`${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`);
    });
    next();
  };
}

module.exports = { requestLogger };
