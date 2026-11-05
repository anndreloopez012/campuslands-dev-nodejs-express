import express, { Router } from 'express';
import { crearServicios } from './services/index.js';
import { crearEventosRouter } from './routes/eventos.routes.js';
import { crearSesionesRouter } from './routes/sesiones.routes.js';
import { crearBusRouter, crearBuzonesRouter, crearCatalogoRouter } from './routes/sistema.routes.js';
import { manejadorDeErrores, registroPorDefecto } from './middlewares/errores.js';
import { metodoNoPermitido } from './middlewares/metodoNoPermitido.js';
import { notFound } from './middlewares/notFound.js';
import { BASE_RUTAS } from './constants/rutas.js';

export function crearApp({ servicios = crearServicios(), registro = registroPorDefecto } = {}) {
  const app = express();
  const router = Router();

  app.set('query parser', 'simple');
  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));

  router.route('/')
    .get((req, res) => {
      res.status(200).json({
        ok: true,
        message: 'Ejercicio ejecutado correctamente',
        topic: 'event emitter',
      });
    })
    .all(metodoNoPermitido(['GET']));

  router.use('/', crearCatalogoRouter({ catalogo: servicios.catalogo }));
  router.use('/sesiones', crearSesionesRouter(servicios));
  router.use('/eventos', crearEventosRouter({ eventos: servicios.eventos }));
  router.use('/buzones', crearBuzonesRouter({ buzones: servicios.buzones }));
  router.use('/bus', crearBusRouter({ sistema: servicios.sistema }));

  app.use(BASE_RUTAS, router);
  app.use(notFound);
  app.use(manejadorDeErrores({ registro }));

  return app;
}

export default crearApp();
