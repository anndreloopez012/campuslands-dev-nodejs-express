export const bitacora = () => (req, res, next) => {
  const inicio = process.hrtime.bigint();
  res.on('finish', () => {
    req.log.info('peticion', {
      metodo: req.method,
      ruta: req.originalUrl.split('?')[0],
      status: res.statusCode,
      ms: Number((process.hrtime.bigint() - inicio) / 1000000n),
    });
  });
  next();
};
