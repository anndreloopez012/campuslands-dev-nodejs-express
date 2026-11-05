import { Router } from 'express';
import * as controller from '../controllers/formulas.controller.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.route('/analizar')
  .post(controller.analizar)
  .all(metodoNoPermitido(['POST']));

router.route('/conversion')
  .post(controller.convertir)
  .all(metodoNoPermitido(['POST']));

router.route('/ecuaciones')
  .post(controller.verificarEcuacion)
  .all(metodoNoPermitido(['POST']));

export default router;
