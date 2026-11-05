import express from 'express';
import { crearRutas } from './routes/index.js';
import { crearServicios } from './services/index.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { BASE_RUTAS } from './constants/rutas.js';

export function crearApp(servicios = crearServicios()) {
  const app = express();

  app.set('query parser', 'simple');
  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));
  app.use(BASE_RUTAS, crearRutas(servicios));
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export default crearApp();
