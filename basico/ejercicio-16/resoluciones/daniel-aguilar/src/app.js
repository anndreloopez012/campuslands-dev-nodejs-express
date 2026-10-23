const express = require('express');
const sneakers = require('./data/sneakers');

// 1. Crear la aplicacion
const app = express();

// 2. Definir rutas: app.<metodo>(ruta, (req, res) => { ... })
app.get('/', (req, res) => {
  res.send('Bienvenido a la tienda de sneakers. Prueba GET /sneakers');
});

app.get('/health', (req, res) => {
  res.json({ ok: true, status: 'up' });
});

app.get('/basico/ejercicio-16', (req, res) => {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'primer servidor Express',
  });
});

app.get('/sneakers', (req, res) => {
  res.json({ ok: true, total: sneakers.length, sneakers });
});

// 3. Si ninguna ruta coincidio, responder 404 (siempre al final)
app.use((req, res) => {
  res.status(404).json({ ok: false, message: `Ruta ${req.method} ${req.originalUrl} no encontrada` });
});

module.exports = app;
