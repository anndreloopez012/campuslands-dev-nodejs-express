import { Router } from 'express';
import * as controller from '../controllers/compuestos.controller.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.route('/')
  .get(controller.listar)
  .post(controller.crear)
  .all(metodoNoPermitido(['GET', 'POST']));

router.route('/:id')
  .get(controller.obtener)
  .delete(controller.eliminar)
  .all(metodoNoPermitido(['GET', 'DELETE']));

export default router;
