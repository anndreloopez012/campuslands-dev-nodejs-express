const express = require('express');
const routes = require('./routes');

const app = express();

// 415: los cuerpos de POST/PUT/PATCH deben ser JSON
app.use((req, res, next) => {
  const hasBody = Number(req.headers['content-length'] || 0) > 0;
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && hasBody) {
    if (!(req.headers['content-type'] || '').startsWith('application/json')) {
      return res.status(415).json({ ok: false, message: 'Content-Type debe ser application/json' });
    }
  }
  next();
});

app.use(express.json());
app.use(routes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: `Ruta ${req.method} ${req.originalUrl} no encontrada` });
});

app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, message: 'El cuerpo no es un JSON valido' });
  }
  const status = error.status || 500;
  if (status === 500) {
    console.error(error);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
  res.status(status).json({ ok: false, message: error.message, ...(error.details && { details: error.details }) });
});

module.exports = app;
