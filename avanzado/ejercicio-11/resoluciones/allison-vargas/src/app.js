import express, { Router } from 'express';
import { crearServicios } from './services/index.js';
import { crearCancionesRouter } from './routes/canciones.routes.js';
import { crearImportacionesRouter } from './routes/importaciones.routes.js';
import { manejadorDeErrores, registroPorDefecto } from './middlewares/errores.js';
import { metodoNoPermitido } from './middlewares/metodoNoPermitido.js';
import { notFound } from './middlewares/notFound.js';
import { BASE_RUTAS } from './constants/rutas.js';

export function crearApp({ servicios, registro = registroPorDefecto } = {}) {
  const app = express();
  const router = Router();
  const contenido = servicios ?? crearServicios({ registro });

  app.set('query parser', 'simple');
  app.disable('x-powered-by');

  router.route('/')
    .get((req, res) => {
      res.status(200).json({
        ok: true,
        message: 'Ejercicio ejecutado correctamente',
        topic: 'importacion masiva',
      });
    })
    .all(metodoNoPermitido(['GET']));

  router.use('/importaciones', crearImportacionesRouter(contenido));
  router.use('/', crearCancionesRouter(contenido));

  app.use(BASE_RUTAS, router);
  app.use(notFound);
  app.use(manejadorDeErrores({ registro }));

  return app;
}

export default crearApp();
