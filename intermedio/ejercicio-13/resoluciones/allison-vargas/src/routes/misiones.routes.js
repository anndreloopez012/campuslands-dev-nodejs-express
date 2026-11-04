import { Router } from 'express';
import * as controller from '../controllers/misiones.controller.js';
import * as asignaciones from '../controllers/asignaciones.controller.js';
import { cargarMision } from '../middlewares/cargarMision.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.param('id', cargarMision);

router.route('/')
  .get(controller.listar)
  .post(controller.crear)
  .all(metodoNoPermitido(['GET', 'POST']));

router.route('/:id')
  .get(controller.obtener)
  .patch(controller.actualizar)
  .delete(controller.eliminar)
  .all(metodoNoPermitido(['GET', 'PATCH', 'DELETE']));

router.route('/:id/tripulantes')
  .get(asignaciones.listarPorMision)
  .post(asignaciones.asignar)
  .all(metodoNoPermitido(['GET', 'POST']));

router.route('/:id/tripulantes/:tripulanteId')
  .delete(asignaciones.desasignar)
  .all(metodoNoPermitido(['DELETE']));

export default router;
