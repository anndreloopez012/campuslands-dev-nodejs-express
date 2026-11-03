function requestLogger(logger) {
  return (req, res, next) => {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const ms = (Number(process.hrtime.bigint() - start) / 1e6).toFixed(1);
      const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
      logger[level](`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
    });
    next();
  };
}

module.exports = { requestLogger };
