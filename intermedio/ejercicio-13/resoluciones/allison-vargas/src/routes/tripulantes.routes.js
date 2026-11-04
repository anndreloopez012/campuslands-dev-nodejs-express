import { Router } from 'express';
import * as controller from '../controllers/tripulantes.controller.js';
import * as asignaciones from '../controllers/asignaciones.controller.js';
import { cargarTripulante } from '../middlewares/cargarTripulante.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.param('id', cargarTripulante);

router.route('/')
  .get(controller.listar)
  .post(controller.crear)
  .all(metodoNoPermitido(['GET', 'POST']));

router.route('/:id')
  .get(controller.obtener)
  .patch(controller.actualizar)
  .delete(controller.eliminar)
  .all(metodoNoPermitido(['GET', 'PATCH', 'DELETE']));

router.route('/:id/misiones')
  .get(asignaciones.listarPorTripulante)
  .all(metodoNoPermitido(['GET']));

export default router;
