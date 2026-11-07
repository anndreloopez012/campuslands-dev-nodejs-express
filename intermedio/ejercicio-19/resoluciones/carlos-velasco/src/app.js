const express = require('express');
const studioRoutes = require('./routes/studio.routes');
const errorHandler = require('./middlewares/error.handler');
const { getConfig } = require('./config/app.config');

const config = getConfig();
const app = express();

app.use(express.json());

app.use(studioRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Servidor funcionando correctamente',
    topic: 'dotenv y config',
    puerto: config.puerto
  });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

app.use(errorHandler);

module.exports = app;
