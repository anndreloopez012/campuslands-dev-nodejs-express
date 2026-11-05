import express, { Router } from 'express';
import { crearServicios } from './services/index.js';
import { crearMisionesRouter, crearNavesRouter } from './routes/misiones.routes.js';
import { crearObservabilidadRouter } from './routes/observabilidad.routes.js';
import { crearLogger } from './observabilidad/logger.js';
import { crearMemoria, destinoConsola } from './observabilidad/destinos.js';
import { requestId } from './middlewares/requestId.js';
import { registroDeAccesos } from './middlewares/accesos.js';
import { manejadorDeErrores } from './middlewares/errores.js';
import { metodoNoPermitido } from './middlewares/metodoNoPermitido.js';
import { notFound } from './middlewares/notFound.js';
import { BASE_RUTAS } from './constants/rutas.js';

export function crearApp({
  reloj = () => new Date(),
  servicios = crearServicios({ reloj }),
  memoria = crearMemoria({ capacidad: 500 }),
  destinos = [destinoConsola()],
  nivel = process.env.LOG_NIVEL ?? 'info',
  logger = crearLogger({
    nivel, reloj, destinos: [memoria.destino, ...destinos], contexto: { servicio: 'flota-estelar' },
  }),
  ahora,
  generarId,
} = {}) {
  const app = express();
  const router = Router();
  const inicio = reloj();

  app.set('query parser', 'simple');
  app.disable('x-powered-by');

  app.use(requestId({ logger, generar: generarId }));
  app.use(registroDeAccesos({ ahora, omitir: [`${BASE_RUTAS}/logs`, `${BASE_RUTAS}/health`] }));

  router.route('/')
    .get((req, res) => {
      res.status(200).json({
        ok: true,
        message: 'Ejercicio ejecutado correctamente',
        topic: 'observabilidad y logs',
      });
    })
    .all(metodoNoPermitido(['GET']));

  router.use('/', crearObservabilidadRouter({
    logger, memoria, reloj, inicio,
  }));
  router.use('/naves', crearNavesRouter(servicios));
  router.use('/misiones', crearMisionesRouter(servicios));

  app.use(BASE_RUTAS, router);
  app.use(notFound);
  app.use(manejadorDeErrores({ logger }));

  app.locals.logger = logger;
  app.locals.memoria = memoria;
  return app;
}

export default crearApp();
