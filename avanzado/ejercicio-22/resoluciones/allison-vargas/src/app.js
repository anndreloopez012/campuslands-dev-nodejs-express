import express, { Router } from 'express';
import { crearDespachador } from './webhooks/despachador.js';
import { crearReceptor } from './webhooks/receptor.js';
import { crearServicioProyectos } from './services/proyectos.service.js';
import { crearProyectosRouter, crearReceptorRouter, crearWebhooksRouter } from './routes/webhooks.routes.js';
import { manejadorDeErrores, registroPorDefecto } from './middlewares/errores.js';
import { metodoNoPermitido } from './middlewares/metodoNoPermitido.js';
import { notFound } from './middlewares/notFound.js';
import { BASE_RUTAS } from './constants/rutas.js';

export function crearServicios({
  reloj = () => new Date(), transporte, programar, politica, permitirLocal = process.env.WEBHOOKS_PERMITIR_LOCAL !== 'false',
} = {}) {
  const despachador = crearDespachador({
    reloj, transporte, programar, politica,
  });
  return {
    despachador,
    permitirLocal,
    receptor: crearReceptor({ reloj }),
    proyectos: crearServicioProyectos({ despachador, reloj }),
  };
}

export function crearApp({ servicios = crearServicios(), registro = registroPorDefecto } = {}) {
  const app = express();
  const router = Router();

  app.disable('x-powered-by');
  app.set('query parser', 'simple');

  router.route('/')
    .get((req, res) => {
      res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'webhooks simulados' });
    })
    .all(metodoNoPermitido(['GET']));

  router.use('/proyectos', crearProyectosRouter(servicios));
  router.use('/receptor', crearReceptorRouter(servicios));
  router.use('/', crearWebhooksRouter(servicios));

  app.use(BASE_RUTAS, router);
  app.use(notFound);
  app.use(manejadorDeErrores({ registro }));
  return app;
}

export default crearApp();
