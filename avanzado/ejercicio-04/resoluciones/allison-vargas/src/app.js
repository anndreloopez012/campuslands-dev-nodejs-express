import express, { Router } from 'express';
import { crearServicios } from './services/index.js';
import { crearErroresRouter } from './routes/errores.routes.js';
import { crearJugadoresRouter } from './routes/jugadores.routes.js';
import { crearPartidasRouter } from './routes/partidas.routes.js';
import { idPeticion } from './middlewares/idPeticion.js';
import { manejadorDeErrores, registroPorDefecto } from './middlewares/manejadorDeErrores.js';
import { metodoNoPermitido } from './middlewares/metodoNoPermitido.js';
import { notFound } from './middlewares/notFound.js';
import { BASE_RUTAS } from './constants/rutas.js';

export function crearApp({ servicios = crearServicios(), registro = registroPorDefecto } = {}) {
  const app = express();
  const router = Router();

  app.set('query parser', 'simple');
  app.disable('x-powered-by');
  app.use(idPeticion());
  app.use(express.json({ limit: '10kb' }));

  router.route('/')
    .get((req, res) => {
      res.status(200).json({
        ok: true,
        message: 'Ejercicio ejecutado correctamente',
        topic: 'errores de dominio',
      });
    })
    .all(metodoNoPermitido(['GET']));

  router.use('/errores', crearErroresRouter());
  router.use('/jugadores', crearJugadoresRouter({ jugadores: servicios.jugadores }));
  router.use('/partidas', crearPartidasRouter({ partidas: servicios.partidas }));

  app.use(BASE_RUTAS, router);
  app.use(notFound);
  app.use(manejadorDeErrores({ registro }));

  return app;
}

export default crearApp();
