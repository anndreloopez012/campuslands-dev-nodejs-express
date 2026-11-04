import { Router } from 'express';
import * as controller from '../controllers/naves.controller.js';
import { cargarNave } from '../middlewares/cargarNave.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.param('id', cargarNave);

router.route('/')
  .get(controller.listar)
  .post(controller.crear)
  .all(metodoNoPermitido(['GET', 'POST']));

router.route('/:id')
  .get(controller.obtener)
  .patch(controller.actualizar)
  .delete(controller.eliminar)
  .all(metodoNoPermitido(['GET', 'PATCH', 'DELETE']));

export default router;
