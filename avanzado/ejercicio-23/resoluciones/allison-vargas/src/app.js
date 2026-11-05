import express, { Router } from 'express';
import { crearPlanificador } from './jobs/planificador.js';
import { JOBS_DEL_TALLER, crearServicioTaller } from './services/taller.service.js';
import { crearJobsRouter, crearTallerRouter } from './routes/taller.routes.js';
import { manejadorDeErrores, registroPorDefecto } from './middlewares/errores.js';
import { metodoNoPermitido } from './middlewares/metodoNoPermitido.js';
import { notFound } from './middlewares/notFound.js';
import { loadJson } from './utils/loadJson.js';
import { BASE_RUTAS } from './constants/rutas.js';

export function crearServicios({ reloj = () => new Date(), timeoutMs, registroJobs } = {}) {
  const taller = crearServicioTaller({ datos: loadJson('taller.json'), reloj });
  const planificador = crearPlanificador({ reloj, registro: registroJobs });
  for (const definicion of JOBS_DEL_TALLER) {
    planificador.registrar({ ...definicion, tarea: taller.tareas[definicion.tarea], timeoutMs });
  }
  return { reloj, taller, planificador };
}

export function crearApp({ servicios = crearServicios(), registro = registroPorDefecto } = {}) {
  const app = express();
  const router = Router();

  app.disable('x-powered-by');
  app.set('query parser', 'simple');

  router.route('/')
    .get((req, res) => {
      res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'jobs programados' });
    })
    .all(metodoNoPermitido(['GET']));

  router.use('/', crearJobsRouter(servicios));
  router.use('/', crearTallerRouter(servicios));

  app.use(BASE_RUTAS, router);
  app.use(notFound);
  app.use(manejadorDeErrores({ registro }));
  app.locals.planificador = servicios.planificador;
  return app;
}

export default crearApp();
