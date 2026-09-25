import app from './app.js';

const DEFAULT_PORT = 3000;
const configuredPort = Number(process.env.PORT ?? DEFAULT_PORT);

if (!Number.isInteger(configuredPort) || configuredPort < 1 || configuredPort > 65535) {
  throw new Error('PORT debe ser un número entero entre 1 y 65535.');
}

const server = app.listen(configuredPort, () => {
  console.log(`Servidor iniciado en http://localhost:${configuredPort}`);
});

server.on('error', (error) => {
  console.error('No fue posible iniciar el servidor:', error.message);
  process.exitCode = 1;
});

function shutdown(signal) {
  console.log(`\n${signal} recibido. Cerrando el servidor...`);
  server.close((error) => {
    if (error) {
      console.error('Error al cerrar el servidor:', error.message);
      process.exitCode = 1;
    }
  });
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));