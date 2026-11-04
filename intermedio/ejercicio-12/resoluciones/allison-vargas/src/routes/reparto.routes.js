import { Router } from 'express';
import * as controller from '../controllers/reparto.controller.js';
import { cargarMiembro } from '../middlewares/cargarMiembro.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router({ mergeParams: true });

router.param('miembroId', cargarMiembro);

router.route('/')
  .get(controller.listar)
  .post(controller.crear)
  .all(metodoNoPermitido(['GET', 'POST']));

router.route('/:miembroId')
  .get(controller.obtener)
  .patch(controller.actualizar)
  .delete(controller.eliminar)
  .all(metodoNoPermitido(['GET', 'PATCH', 'DELETE']));

export default router;
