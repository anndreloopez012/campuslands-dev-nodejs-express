import express, { Router } from 'express';
import { crearServicios } from './services/index.js';
import { crearTrabajosRouter } from './routes/trabajos.routes.js';
import { crearOrdenesRouter, crearSistemaRouter, crearTrabajadoresRouter } from './routes/taller.routes.js';
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
        topic: 'colas de tareas conceptuales',
      });
    })
    .all(metodoNoPermitido(['GET']));

  const { permitirSimulaciones } = servicios;
  router.use('/trabajos', crearTrabajosRouter({ trabajos: servicios.trabajos, permitirSimulaciones }));
  router.use('/trabajadores', crearTrabajadoresRouter({ trabajadores: servicios.trabajadores }));
  router.use('/ordenes', crearOrdenesRouter({ ordenes: servicios.ordenes, permitirSimulaciones }));
  router.use('/', crearSistemaRouter(servicios));

  app.use(BASE_RUTAS, router);
  app.use(notFound);
  app.use(manejadorDeErrores({ registro }));

  return app;
}

export default crearApp({ servicios: crearServicios({ relojVirtual: process.env.RELOJ_VIRTUAL === 'true' }) });
