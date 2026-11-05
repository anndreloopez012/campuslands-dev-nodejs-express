import { Router } from 'express';
import { crearEquiposController } from '../controllers/equipos.controller.js';
import { crearTorneosController } from '../controllers/torneos.controller.js';
import { crearEquiposRoutes } from './equipos.routes.js';
import { crearTorneosRoutes } from './torneos.routes.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { construirOpenApi } from '../docs/openapi.js';
import { renderizarHtml } from '../docs/html.js';

export function crearRutas({ equipos, torneos }) {
  const router = Router();
  const spec = construirOpenApi();
  const pagina = renderizarHtml(spec);

  router.route('/')
    .get((req, res) => {
      res.status(200).json({
        ok: true,
        message: 'Ejercicio ejecutado correctamente',
        topic: 'documentacion de endpoints',
      });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/docs')
    .get((req, res) => {
      res.set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'");
      res.type('html').send(pagina);
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/docs/openapi.json')
    .get((req, res) => res.status(200).json(spec))
    .all(metodoNoPermitido(['GET']));

  router.use('/equipos', crearEquiposRoutes(crearEquiposController(equipos)));
  router.use('/torneos', crearTorneosRoutes(crearTorneosController(torneos)));

  return router;
}
