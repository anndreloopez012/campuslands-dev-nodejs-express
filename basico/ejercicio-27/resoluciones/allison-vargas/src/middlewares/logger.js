import { logInfo } from '../utils/logger.js';

export function registrarPeticionHTTP(req, res, next) {
  const inicio = Date.now();

  res.on('finish', () => {
    const duracionMs = Date.now() - inicio;
    logInfo(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${duracionMs}ms)`);
  });

  next();
}
