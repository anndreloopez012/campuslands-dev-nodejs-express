const { loadConfig } = require('./config');
const { createApp } = require('./app');

let config;
try {
  config = loadConfig();
} catch (error) {
  // Fail fast: si la configuracion es invalida, no tiene sentido arrancar.
  console.error(`Configuracion invalida: ${error.message}`);
  process.exit(1);
}

createApp(config).listen(config.port, () => {
  console.log(`[${config.env}] escuchando en http://localhost:${config.port} (log: ${config.logLevel})`);
});
