import express, { Router } from 'express';
import { crearServicios } from './services/index.js';
import { crearClubesRouter, crearJugadoresRouter } from './routes/clubes.routes.js';
import { crearFichajesRouter, crearIntercambiosRouter } from './routes/fichajes.routes.js';
import { crearLibroRouter } from './routes/libro.routes.js';
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
        topic: 'transacciones simuladas',
      });
    })
    .all(metodoNoPermitido(['GET']));

  const { permitirFallos } = servicios;
  router.use('/clubes', crearClubesRouter({ clubes: servicios.clubes }));
  router.use('/jugadores', crearJugadoresRouter({ jugadores: servicios.jugadores }));
  router.use('/fichajes', crearFichajesRouter({ fichajes: servicios.fichajes, permitirFallos }));
  router.use('/intercambios', crearIntercambiosRouter({ fichajes: servicios.fichajes, permitirFallos }));
  router.use('/', crearLibroRouter(servicios));

  app.use(BASE_RUTAS, router);
  app.use(notFound);
  app.use(manejadorDeErrores({ registro }));

  return app;
}

export default crearApp();
