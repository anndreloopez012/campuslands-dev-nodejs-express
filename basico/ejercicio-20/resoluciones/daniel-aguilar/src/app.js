const express = require('express');
const routes = require('./routes');
const { trace } = require('./middlewares/trace');
const { requestId } = require('./middlewares/request-id');
const { requireJson } = require('./middlewares/require-json');

const app = express();

// El ORDEN importa: cada peticion atraviesa los middlewares de arriba hacia abajo.
app.use(trace('1. inicio'));
app.use(requestId);
app.use(requireJson);                    // antes del parser: rechaza lo que no sea JSON
app.use(express.json({ limit: '1kb' })); // parsea el cuerpo a req.body (limite bajo para probar 413)
app.use(trace('2. despues de express.json'));

app.use(routes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

// Middleware de errores (4 parametros): captura los fallos de express.json y de las rutas.
app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, message: 'El cuerpo no es un JSON valido' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ ok: false, message: 'El cuerpo supera el limite de 1kb' });
  }
  console.error(error);
  res.status(500).json({ ok: false, message: 'Error interno del servidor' });
});

module.exports = app;
