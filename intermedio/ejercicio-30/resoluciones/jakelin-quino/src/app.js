const express = require('express');
const motos = require('./routes/motos');

const app = express();
app.use(express.json());
app.use('/motos', motos);
app.use((error, _req, res, _next) => {
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
