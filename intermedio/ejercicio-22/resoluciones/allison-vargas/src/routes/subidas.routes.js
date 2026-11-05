import { Router } from 'express';
import * as controller from '../controllers/subidas.controller.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.route('/:id')
  .get(controller.obtener)
  .delete(controller.eliminar)
  .all(metodoNoPermitido(['GET', 'DELETE']));

router.route('/:id/confirmar')
  .post(controller.confirmar)
  .all(metodoNoPermitido(['POST']));

export default router;
