import { Router } from 'express';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { exigirJson } from '../middlewares/exigirJson.js';

export function crearTorneosRoutes(controller) {
  const router = Router();

  router.route('/')
    .get(controller.listar)
    .all(metodoNoPermitido(['GET']));

  router.route('/:id')
    .get(controller.obtener)
    .all(metodoNoPermitido(['GET']));

  router.route('/:id/inscripciones')
    .get(controller.listarInscripciones)
    .post(exigirJson, controller.inscribir)
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/:id/inscripciones/:equipoId')
    .delete(controller.retirar)
    .all(metodoNoPermitido(['DELETE']));

  return router;
}
