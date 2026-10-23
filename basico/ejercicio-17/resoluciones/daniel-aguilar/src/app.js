const express = require('express');
const routes = require('./routes');

const app = express();

app.use(routes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

module.exports = app;
