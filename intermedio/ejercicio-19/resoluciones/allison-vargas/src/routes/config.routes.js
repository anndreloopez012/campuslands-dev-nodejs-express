import { Router } from 'express';
import * as controller from '../controllers/config.controller.js';
import { requiereApiKey } from '../middlewares/requiereApiKey.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.route('/')
  .get(controller.publica)
  .all(metodoNoPermitido(['GET']));

router.route('/completa')
  .get(requiereApiKey, controller.completa)
  .all(metodoNoPermitido(['GET']));

export default router;
