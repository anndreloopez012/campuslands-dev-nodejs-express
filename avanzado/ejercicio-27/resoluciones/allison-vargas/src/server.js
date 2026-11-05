import { createApp } from './app.js';
import { loadConfig } from './config.js';

try {
  const config = loadConfig();
  createApp(config).listen(config.port, () => process.stdout.write(`${config.serviceName} escuchando en puerto ${config.port}\n`));
} catch (error) {
  process.stderr.write(`Configuración inválida: ${error.message}\n`);
  process.exitCode = 1;
}
