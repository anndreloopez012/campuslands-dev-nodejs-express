import { Router } from 'express';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { exigirJson } from '../middlewares/exigirJson.js';

export function crearJugadoresRoutes(controller) {
  const router = Router();

  router.route('/')
    .get(controller.listar)
    .post(exigirJson, controller.crear)
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/:id')
    .get(controller.obtener)
    .all(metodoNoPermitido(['GET']));

  return router;
}
