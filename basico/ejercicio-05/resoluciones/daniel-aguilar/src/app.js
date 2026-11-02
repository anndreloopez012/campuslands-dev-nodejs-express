const express = require('express');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(routes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

app.use((error, req, res, next) => {
  const status = error.status || 500;
  if (status === 500) console.error(error);
  res.status(status).json({ ok: false, message: status === 500 ? 'Error interno del servidor' : error.message });
});

module.exports = app;
