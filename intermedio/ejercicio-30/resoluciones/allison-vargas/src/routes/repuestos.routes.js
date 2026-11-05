import { Router } from 'express';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { exigirJson } from '../middlewares/exigirJson.js';
import { exigirRol } from '../middlewares/autenticar.js';

export function crearRepuestosRoutes(controller) {
  const router = Router();
  const soloAdmin = exigirRol('admin');

  router.route('/')
    .get(controller.listar)
    .post(soloAdmin, exigirJson, controller.crear)
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/:id')
    .get(controller.obtener)
    .patch(soloAdmin, exigirJson, controller.actualizar)
    .all(metodoNoPermitido(['GET', 'PATCH']));

  router.route('/:id/reabastecer')
    .post(soloAdmin, exigirJson, controller.reabastecer)
    .all(metodoNoPermitido(['POST']));

  return router;
}
