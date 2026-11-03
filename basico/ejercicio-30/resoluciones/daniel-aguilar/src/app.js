const express = require('express');
const { createLogger } = require('./utils/logger');
const { createMotorcycleService } = require('./services/motorcycles.service');
const { createOrderService } = require('./services/orders.service');
const { createRoutes } = require('./routes');
const { requestLogger } = require('./middlewares/request-logger');
const { notFoundHandler, errorHandler } = require('./middlewares/error-handler');

function createApp({ logger = createLogger() } = {}) {
  // Los servicios se crean por aplicacion: cada instancia (y cada prueba) tiene sus propios datos.
  // La referencia circular se resuelve con funciones: motos necesita saber de ordenes y viceversa.
  let orders;
  const motorcycles = createMotorcycleService({ hasOpenOrders: (id) => orders.hasOpenOrders(id) });
  orders = createOrderService({ getMotorcycle: motorcycles.get });

  const app = express();
  app.use(requestLogger(logger));
  app.use(express.json());
  app.use(createRoutes({ motorcycles, orders }));
  app.use(notFoundHandler);
  app.use(errorHandler(logger));
  return app;
}

module.exports = { createApp };
