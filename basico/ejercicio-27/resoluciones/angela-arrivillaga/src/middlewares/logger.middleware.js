import { escribirLog } from '../services/log.service.js';

export function registrarPeticion(req, res, next) {
  const inicio = Date.now();

  res.on('finish', () => {
    const duracion = Date.now() - inicio;
    const linea = new Date().toISOString() + ' ' + req.method + ' ' + req.originalUrl + ' ' + res.statusCode + ' ' + duracion + 'ms';

    console.log(linea);
    escribirLog(linea);
  });

  next();
}
