import { Router } from 'express';
import * as controller from '../controllers/calculos.controller.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.route('/catalogo')
  .get(controller.catalogoCompleto)
  .all(metodoNoPermitido(['GET']));

router.route('/calor')
  .post(controller.calor)
  .all(metodoNoPermitido(['POST']));

export default router;
