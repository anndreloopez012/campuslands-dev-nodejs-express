import { Router } from 'express';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { exigirJson } from '../middlewares/exigirJson.js';
import { exigirRol } from '../middlewares/autenticar.js';

export function crearMotosRoutes(controller) {
  const router = Router();
  const escribe = exigirRol('admin', 'recepcion');

  router.route('/')
    .get(controller.listar)
    .post(escribe, exigirJson, controller.crear)
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/:id')
    .get(controller.obtener)
    .patch(escribe, exigirJson, controller.actualizar)
    .all(metodoNoPermitido(['GET', 'PATCH']));

  return router;
}
