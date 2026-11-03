const express = require('express');
const { loadConfig } = require('./config');
const { createRoutes } = require('./routes');

function createApp(config = loadConfig()) {
  const app = express();

  app.use(express.json());
  app.use(createRoutes(config));

  app.use((req, res) => {
    res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
  });

  app.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') {
      return res.status(400).json({ ok: false, message: 'El cuerpo no es un JSON valido' });
    }
    console.error(error);
    res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  });

  return app;
}

module.exports = { createApp };
