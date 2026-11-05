import express, { Router } from 'express';
import { crearGranja } from './concurrencia/granja.js';
import { crearServicioEscenas } from './services/escenas.service.js';
import { crearRenderizadorSimulado } from './services/renderizador.js';
import { crearEscenasRouter, crearRendersRouter } from './routes/render.routes.js';
import { manejadorDeErrores, registroPorDefecto } from './middlewares/errores.js';
import { metodoNoPermitido } from './middlewares/metodoNoPermitido.js';
import { notFound } from './middlewares/notFound.js';
import { loadJson } from './utils/loadJson.js';
import { BASE_RUTAS } from './constants/rutas.js';

export function crearServicios({
  reloj = () => new Date(), renderizar = crearRenderizadorSimulado(), limites, demoraVistaPreviaMs,
} = {}) {
  return {
    escenas: crearServicioEscenas({ escenas: loadJson('escenas.json'), reloj, demoraVistaPreviaMs }),
    granja: crearGranja({ renderizar, reloj, limites }),
  };
}

export function crearApp({ servicios = crearServicios(), registro = registroPorDefecto } = {}) {
  const app = express();
  const router = Router();

  app.disable('x-powered-by');
  app.set('query parser', 'simple');

  router.route('/')
    .get((req, res) => {
      res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'concurrencia controlada' });
    })
    .all(metodoNoPermitido(['GET']));

  router.use('/escenas', crearEscenasRouter(servicios));
  router.use('/renders', crearRendersRouter(servicios));
  router.route('/cola')
    .get((req, res) => res.status(200).json({ ok: true, data: servicios.granja.estadisticas() }))
    .all(metodoNoPermitido(['GET']));

  app.use(BASE_RUTAS, router);
  app.use(notFound);
  app.use(manejadorDeErrores({ registro }));
  return app;
}

export default crearApp();
