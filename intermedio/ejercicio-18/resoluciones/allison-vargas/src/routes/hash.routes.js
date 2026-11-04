import { Router } from 'express';
import * as controller from '../controllers/hash.controller.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.route('/parametros')
  .get(controller.parametros)
  .all(metodoNoPermitido(['GET']));

router.route('/demo')
  .post(controller.demo)
  .all(metodoNoPermitido(['POST']));

router.route('/verificar')
  .post(controller.comprobar)
  .all(metodoNoPermitido(['POST']));

export default router;
