import app from './app.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`Servidor escuchando en http://localhost:${PORT}`);
});

const apagar = (motivo, error) => {
  logger.error(`${motivo}, cerrando el servidor`, error);
  server.close(() => process.exit(1));
};

process.on('unhandledRejection', (error) => apagar('unhandledRejection', error));
process.on('uncaughtException', (error) => apagar('uncaughtException', error));
