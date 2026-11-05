import express, { Router } from 'express';
import { crearServicios } from './services/index.js';
import { crearLibrosRouter, crearPrestamosRouter } from './routes/biblioteca.routes.js';
import { crearMetricasRouter } from './routes/metricas.routes.js';
import { middlewareMetricas } from './metricas/http.js';
import { manejadorDeErrores, registroPorDefecto } from './middlewares/errores.js';
import { metodoNoPermitido } from './middlewares/metodoNoPermitido.js';
import { notFound } from './middlewares/notFound.js';
import { BASE_RUTAS } from './constants/rutas.js';

export function crearApp({ servicios = crearServicios(), ahora, registro = registroPorDefecto } = {}) {
  const app = express();
  const router = Router();

  app.set('query parser', 'simple');
  app.disable('x-powered-by');
  app.use(middlewareMetricas({ http: servicios.http, ahora }));

  router.route('/')
    .get((req, res) => {
      res.status(200).json({
        ok: true,
        message: 'Ejercicio ejecutado correctamente',
        topic: 'metricas simples',
      });
    })
    .all(metodoNoPermitido(['GET']));

  router.use('/metrics', crearMetricasRouter(servicios));
  router.use('/libros', crearLibrosRouter(servicios));
  router.use('/prestamos', crearPrestamosRouter(servicios));

  app.use(BASE_RUTAS, router);
  app.use(notFound);
  app.use(manejadorDeErrores({ registro }));

  return app;
}

export default crearApp();
