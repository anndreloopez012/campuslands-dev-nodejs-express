import express, { Router } from 'express';
import { crearServicios } from './services/index.js';
import { crearColeccionesRouter } from './routes/colecciones.routes.js';
import { crearExportacionesRouter } from './routes/exportaciones.routes.js';
import { crearPeliculasRouter } from './routes/peliculas.routes.js';
import { manejadorDeErrores, registroPorDefecto } from './middlewares/errores.js';
import { metodoNoPermitido } from './middlewares/metodoNoPermitido.js';
import { notFound } from './middlewares/notFound.js';
import { BASE_RUTAS } from './constants/rutas.js';

export function crearApp({ servicios = crearServicios(), registro = registroPorDefecto } = {}) {
  const app = express();
  const router = Router();

  app.set('query parser', 'simple');
  app.disable('x-powered-by');

  router.route('/')
    .get((req, res) => {
      res.status(200).json({
        ok: true,
        message: 'Ejercicio ejecutado correctamente',
        topic: 'exportacion JSON',
      });
    })
    .all(metodoNoPermitido(['GET']));

  router.use('/peliculas', crearPeliculasRouter({ ...servicios, registro }));
  router.use('/exportaciones', crearExportacionesRouter(servicios));
  router.use('/', crearColeccionesRouter(servicios));

  app.use(BASE_RUTAS, router);
  app.use(notFound);
  app.use(manejadorDeErrores({ registro }));

  return app;
}

export default crearApp();
