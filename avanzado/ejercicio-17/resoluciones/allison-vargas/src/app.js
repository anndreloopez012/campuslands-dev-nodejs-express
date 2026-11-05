import express, { Router } from 'express';
import { crearServicios } from './services/index.js';
import { crearAuthRouter } from './routes/auth.routes.js';
import { crearDestinosRouter, crearReservasRouter } from './routes/viajes.routes.js';
import { manejadorDeErrores, registroPorDefecto } from './middlewares/errores.js';
import { metodoNoPermitido } from './middlewares/metodoNoPermitido.js';
import { notFound } from './middlewares/notFound.js';
import { BASE_RUTAS } from './constants/rutas.js';

export function crearApp({ servicios = crearServicios(), registro = registroPorDefecto } = {}) {
  const app = express();
  const router = Router();

  app.disable('x-powered-by');
  app.set('query parser', 'simple');

  router.route('/')
    .get((req, res) => {
      res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'refresh tokens conceptual' });
    })
    .all(metodoNoPermitido(['GET']));

  router.use('/auth', crearAuthRouter(servicios));
  router.use('/destinos', crearDestinosRouter(servicios));
  router.use('/reservas', crearReservasRouter(servicios));

  app.use(BASE_RUTAS, router);
  app.use(notFound);
  app.use(manejadorDeErrores({ registro }));
  return app;
}

export default crearApp();
