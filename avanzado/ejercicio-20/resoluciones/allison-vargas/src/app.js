import express, { Router } from 'express';
import { crearAlmacenIdempotencia } from './idempotencia/almacen.js';
import { crearServicioEstudio } from './services/estudio.service.js';
import { crearPasarelaSimulada } from './services/pasarela.js';
import { crearEstudioRouter } from './routes/estudio.routes.js';
import { manejadorDeErrores, registroPorDefecto } from './middlewares/errores.js';
import { metodoNoPermitido } from './middlewares/metodoNoPermitido.js';
import { notFound } from './middlewares/notFound.js';
import { loadJson } from './utils/loadJson.js';
import { BASE_RUTAS } from './constants/rutas.js';

export function crearServicios({
  reloj = () => new Date(), pasarela = crearPasarelaSimulada(), politica,
} = {}) {
  return {
    almacen: crearAlmacenIdempotencia({ reloj, politica }),
    estudio: crearServicioEstudio({ artistas: loadJson('artistas.json'), reloj, pasarela }),
  };
}

export function crearApp({ servicios = crearServicios(), registro = registroPorDefecto } = {}) {
  const app = express();
  const router = Router();

  app.disable('x-powered-by');
  app.set('query parser', 'simple');

  router.route('/')
    .get((req, res) => {
      res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'idempotencia' });
    })
    .all(metodoNoPermitido(['GET']));

  router.use('/', crearEstudioRouter(servicios));

  app.use(BASE_RUTAS, router);
  app.use(notFound);
  app.use(manejadorDeErrores({ registro }));
  return app;
}

export default crearApp();
