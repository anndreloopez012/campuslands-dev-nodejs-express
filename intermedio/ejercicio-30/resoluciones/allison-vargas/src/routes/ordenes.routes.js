import { Router } from 'express';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { exigirJson } from '../middlewares/exigirJson.js';
import { exigirRol } from '../middlewares/autenticar.js';

export function crearOrdenesRoutes(controller) {
  const router = Router();
  const mostrador = exigirRol('admin', 'recepcion');
  const taller = exigirRol('admin', 'mecanico');

  router.route('/')
    .get(controller.listar)
    .post(mostrador, exigirJson, controller.crear)
    .all(metodoNoPermitido(['GET', 'POST']));

  router.route('/:id')
    .get(controller.obtener)
    .all(metodoNoPermitido(['GET']));

  router.route('/:id/asignacion')
    .put(mostrador, exigirJson, controller.asignar)
    .all(metodoNoPermitido(['PUT']));

  router.route('/:id/estado')
    .put(exigirJson, controller.cambiarEstado)
    .all(metodoNoPermitido(['PUT']));

  router.route('/:id/items')
    .post(taller, exigirJson, controller.agregarItem)
    .all(metodoNoPermitido(['POST']));

  router.route('/:id/items/:repuestoId')
    .delete(taller, controller.quitarItem)
    .all(metodoNoPermitido(['DELETE']));

  router.route('/:id/horas')
    .post(taller, exigirJson, controller.registrarHoras)
    .all(metodoNoPermitido(['POST']));

  router.route('/:id/factura')
    .get(mostrador, controller.factura)
    .all(metodoNoPermitido(['GET']));

  return router;
}
