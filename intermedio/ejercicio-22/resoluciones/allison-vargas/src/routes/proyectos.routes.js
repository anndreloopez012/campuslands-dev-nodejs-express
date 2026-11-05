import { Router } from 'express';
import * as controller from '../controllers/proyectos.controller.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.route('/')
  .get(controller.listar)
  .all(metodoNoPermitido(['GET']));

router.route('/:id')
  .get(controller.obtener)
  .all(metodoNoPermitido(['GET']));

router.route('/:id/archivos')
  .get(controller.archivos)
  .all(metodoNoPermitido(['GET']));

router.route('/:id/subidas')
  .post(controller.solicitarSubida)
  .all(metodoNoPermitido(['POST']));

export default router;
