import { Router } from 'express';
import * as controller from '../controllers/roles.controller.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.route('/')
  .get(controller.listar)
  .all(metodoNoPermitido(['GET']));

export default router;
