const express = require('express');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/error-handler');

const app = express();

app.use(express.json());
app.use(routes);

// Siempre al final: primero el 404 y despues el manejador de errores.
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
