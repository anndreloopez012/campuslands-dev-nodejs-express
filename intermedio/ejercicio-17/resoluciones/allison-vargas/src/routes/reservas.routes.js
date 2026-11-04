import { Router } from 'express';
import * as controller from '../controllers/reservas.controller.js';
import { autenticar } from '../middlewares/autenticar.js';
import { requierePermiso } from '../middlewares/requierePermiso.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.use(autenticar);

router.route('/')
  .get(controller.listar)
  .post(requierePermiso('reservas:crear'), controller.crear)
  .all(metodoNoPermitido(['GET', 'POST']));

router.route('/:id')
  .get(controller.obtener)
  .all(metodoNoPermitido(['GET']));

router.route('/:id/estado')
  .patch(controller.cambiarEstado)
  .all(metodoNoPermitido(['PATCH']));

export default router;
