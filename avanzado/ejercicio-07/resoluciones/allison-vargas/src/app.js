import express, { Router } from 'express';
import { crearServicios } from './services/index.js';
import { crearAutosRouter, crearMarcasRouter } from './routes/autos.routes.js';
import { crearCacheRouter, crearRelojRouter } from './routes/cache.routes.js';
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
        topic: 'cache en memoria',
      });
    })
    .all(metodoNoPermitido(['GET']));

  router.use('/autos', crearAutosRouter({ autos: servicios.autos }));
  router.use('/marcas', crearMarcasRouter({ marcas: servicios.marcas }));
  router.use('/cache', crearCacheRouter({ admin: servicios.admin }));
  router.use('/reloj', crearRelojRouter({ sistema: servicios.sistema }));

  app.use(BASE_RUTAS, router);
  app.use(notFound);
  app.use(manejadorDeErrores({ registro }));

  return app;
}

export default crearApp({ servicios: crearServicios({ relojVirtual: process.env.RELOJ_VIRTUAL === 'true' }) });
