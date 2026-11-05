import { Router } from 'express';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { exigirJson } from '../middlewares/exigirJson.js';

export function crearPartidasRoutes(controller) {
  const router = Router();

  router.route('/')
    .get(controller.listar)
    .post(exigirJson, controller.crear)
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/:id')
    .get(controller.obtener)
    .all(metodoNoPermitido(['GET']));

  router.route('/:id/jugadores')
    .post(exigirJson, controller.unir)
    .all(metodoNoPermitido(['POST']));

  router.route('/:id/jugadores/:jugadorId')
    .delete(controller.retirar)
    .all(metodoNoPermitido(['DELETE']));

  router.route('/:id/iniciar')
    .post(controller.iniciar)
    .all(metodoNoPermitido(['POST']));

  router.route('/:id/eliminaciones')
    .post(exigirJson, controller.eliminar)
    .all(metodoNoPermitido(['POST']));

  router.route('/:id/resultados')
    .get(controller.resultados)
    .all(metodoNoPermitido(['GET']));

  return router;
}
