import app from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';

app.listen(config.puerto, () => {
  logger.info(`${config.nombreApp} escuchando en http://localhost:${config.puerto} (${config.entorno})`);
  if (!config.hayArchivoEnv) logger.info('No se encontro archivo .env: se usan variables del sistema y valores por defecto');
});
