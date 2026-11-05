let app;

try {
  ({ default: app } = await import('./app.js'));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const { instalarApagado } = await import('./apagado.js');

const config = app.contenedor.resolver('config');
const logger = app.contenedor.resolver('logger');

const servidor = app.listen(config.puerto, () => {
  logger.info('servidor_iniciado', { puerto: config.puerto, entorno: config.entorno });
});

instalarApagado({
  servidor,
  logger,
  antes: () => app.marcarApagando(),
  despues: () => app.detenerModulos(),
  tiempoMaximoMs: config.apagadoMs,
});
