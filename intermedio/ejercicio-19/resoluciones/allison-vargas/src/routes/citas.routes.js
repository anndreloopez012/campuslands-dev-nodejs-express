import { Router } from 'express';
import * as controller from '../controllers/citas.controller.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.route('/')
  .get(controller.listar)
  .post(controller.crear)
  .all(metodoNoPermitido(['GET', 'POST']));

router.route('/:id')
  .get(controller.obtener)
  .all(metodoNoPermitido(['GET']));

router.route('/:id/estado')
  .patch(controller.cambiarEstado)
  .all(metodoNoPermitido(['PATCH']));

export default router;
