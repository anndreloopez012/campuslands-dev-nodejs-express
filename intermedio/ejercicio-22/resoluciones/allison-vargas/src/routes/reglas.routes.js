import { Router } from 'express';
import * as controller from '../controllers/reglas.controller.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.route('/')
  .get(controller.describir)
  .all(metodoNoPermitido(['GET']));

export default router;
