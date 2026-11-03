export function registrarPeticion(req, res, next) {
  const inicio = Date.now();

  res.on('finish', () => {
    const duracion = Date.now() - inicio;
    console.log(new Date().toISOString() + ' ' + req.method + ' ' + req.originalUrl + ' ' + res.statusCode + ' ' + duracion + 'ms');
  });

  next();
}
