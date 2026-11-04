import { ejecutarConContexto } from '../utils/context.js';
import { logger } from '../utils/logger.js';

export const requestLogger = (req, res, next) => {
  const inicio = process.hrtime.bigint();

  res.on('finish', () => {
    const duracionMs = Number(process.hrtime.bigint() - inicio) / 1e6;
    ejecutarConContexto(req.id, () =>
      logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duracionMs.toFixed(1)}ms`));
  });

  next();
};
