import { config } from '../config/index.js';

const PESO = { silent: 0, info: 1, debug: 2 };

const activo = (nivel) => PESO[config.nivelLog] >= PESO[nivel];

export const logger = {
  info: (...partes) => activo('info') && console.log(new Date().toISOString(), 'INFO', ...partes),
  debug: (...partes) => activo('debug') && console.log(new Date().toISOString(), 'DEBUG', ...partes),
};

export function registrarPeticiones(req, res, next) {
  const inicio = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - inicio) / 1e6;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`);
    if (req.body && Object.keys(req.body).length) logger.debug('body:', Object.keys(req.body).join(', '));
  });
  next();
}
