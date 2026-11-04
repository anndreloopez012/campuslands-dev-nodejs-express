import { Router } from 'express';
import * as controller from '../controllers/resenas.controller.js';
import { cargarResena } from '../middlewares/cargarResena.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router({ mergeParams: true });

router.param('resenaId', cargarResena);

router.route('/')
  .get(controller.listar)
  .post(controller.crear)
  .all(metodoNoPermitido(['GET', 'POST']));

router.route('/:resenaId')
  .get(controller.obtener)
  .patch(controller.actualizar)
  .delete(controller.eliminar)
  .all(metodoNoPermitido(['GET', 'PATCH', 'DELETE']));

router.route('/:resenaId/util')
  .post(controller.marcarUtil)
  .all(metodoNoPermitido(['POST']));

export default router;
