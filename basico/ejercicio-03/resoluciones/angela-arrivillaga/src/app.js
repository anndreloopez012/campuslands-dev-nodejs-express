const express = require('express');
const routes = require('./routes/campeones.routes');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/basico/ejercicio-03', routes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

module.exports = app;
