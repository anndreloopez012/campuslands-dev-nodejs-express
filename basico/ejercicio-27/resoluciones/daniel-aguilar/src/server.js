const { createApp } = require('./app');
const { createLogger, consoleWriter, fileWriter } = require('./utils/logger');

const PORT = process.env.PORT || 3000;
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  write: process.env.LOG_FILE ? fileWriter(process.env.LOG_FILE) : consoleWriter,
});

createApp({ logger }).listen(PORT, () => {
  logger.info(`Servidor escuchando en http://localhost:${PORT}`, { logLevel: logger.level });
});
