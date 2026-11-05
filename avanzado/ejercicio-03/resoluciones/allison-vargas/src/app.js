import express, { Router } from 'express';
import { crearServicios } from './services/index.js';
import { crearHeroesRouter } from './routes/heroes.routes.js';
import { crearEquiposRouter } from './routes/equipos.routes.js';
import { crearDraftsRouter } from './routes/drafts.routes.js';
import { crearSchemasRouter } from './routes/schemas.routes.js';
import { ESQUEMAS } from './validators/index.js';
import { manejadorDeErrores } from './middlewares/errores.js';
import { metodoNoPermitido } from './middlewares/metodoNoPermitido.js';
import { notFound } from './middlewares/notFound.js';
import { BASE_RUTAS } from './constants/rutas.js';

export function crearApp({ servicios = crearServicios(), esquemas = ESQUEMAS } = {}) {
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
        topic: 'validacion con schemas',
      });
    })
    .all(metodoNoPermitido(['GET']));

  router.use('/heroes', crearHeroesRouter({ heroes: servicios.heroes }));
  router.use('/equipos', crearEquiposRouter({ equipos: servicios.equipos }));
  router.use('/drafts', crearDraftsRouter({ drafts: servicios.drafts }));
  router.use('/schemas', crearSchemasRouter({ esquemas }));

  app.use(BASE_RUTAS, router);
  app.use(notFound);
  app.use(manejadorDeErrores());

  return app;
}

export default crearApp();
