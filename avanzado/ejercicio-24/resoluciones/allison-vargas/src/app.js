import express from 'express';
import { especificacion } from './docs/openapi.js';
import { crearServicioQuimica } from './services/quimica.service.js';
import { crearRouterQuimica } from './routes/quimica.routes.js';
import { manejadorDeErrores, registroPorDefecto } from './middlewares/errores.js';
import { notFound } from './middlewares/notFound.js';
import { loadJson } from './utils/loadJson.js';
import { BASE_RUTAS } from './constants/rutas.js';

export function crearRouter() {
  return crearRouterQuimica({ quimica: crearServicioQuimica({ elementos: loadJson('elementos.json') }), especificacion });
}

export function crearApp({ router = crearRouter(), registro = registroPorDefecto } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.set('query parser', 'simple');
  app.use(BASE_RUTAS, router);
  app.use(notFound);
  app.use(manejadorDeErrores({ registro }));
  return app;
}

export default crearApp();
