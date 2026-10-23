const express = require('express');
const { getGame } = require('./game');

const app = express();

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'modulos CommonJS'
  });
});

app.get('/game', (req, res) => {
  res.json(getGame());
});

module.exports = app;