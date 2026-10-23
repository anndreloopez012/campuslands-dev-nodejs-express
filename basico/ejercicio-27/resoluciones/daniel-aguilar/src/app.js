const express = require('express');
const { createRoutes } = require('./routes');
const { requestLogger } = require('./middlewares/request-logger');
const { createLogger } = require('./utils/logger');

function createApp({ logger = createLogger() } = {}) {
  const app = express();

  app.use(requestLogger(logger));
  app.use(express.json());
  app.use(createRoutes(logger));

  app.use((req, res) => {
    res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
  });

  app.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') {
      return res.status(400).json({ ok: false, message: 'El cuerpo no es un JSON valido' });
    }
    // Error inesperado: el detalle va al LOG, no al cliente.
    logger.error(`Error no controlado: ${error.message}`, { stack: error.stack });
    res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  });

  return app;
}

module.exports = { createApp };
