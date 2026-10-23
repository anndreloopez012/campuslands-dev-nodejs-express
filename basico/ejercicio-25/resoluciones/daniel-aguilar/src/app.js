const express = require('express');
const routes = require('./routes');
const { fail } = require('./utils/response');

const app = express();

app.use(express.json());
app.use(routes);

app.use((req, res) => fail(res, 404, 'ROUTE_NOT_FOUND', `Ruta ${req.method} ${req.originalUrl} no encontrada`));

app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return fail(res, 400, 'INVALID_JSON', 'El cuerpo no es un JSON valido');
  }
  const status = error.status || 500;
  if (status === 500) {
    console.error(error);
    return fail(res, 500, 'INTERNAL_ERROR', 'Error interno del servidor');
  }
  return fail(res, status, error.code || 'ERROR', error.message, error.details);
});

module.exports = app;
