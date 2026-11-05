import { Router } from 'express';
import * as controller from '../controllers/cors.controller.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.route('/politicas')
  .get(controller.politicas)
  .all(metodoNoPermitido(['GET']));

export default router;
