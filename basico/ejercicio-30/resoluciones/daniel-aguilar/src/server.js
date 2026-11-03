const { loadConfig } = require('./config');
const { createLogger } = require('./utils/logger');
const { createApp } = require('./app');

let config;
try {
  config = loadConfig();
} catch (error) {
  console.error(`Configuracion invalida: ${error.message}`);
  process.exit(1);
}

const logger = createLogger({ level: config.logLevel });

createApp({ logger }).listen(config.port, () => {
  logger.info(`Taller de motos escuchando en http://localhost:${config.port}`, { env: config.nodeEnv });
});
