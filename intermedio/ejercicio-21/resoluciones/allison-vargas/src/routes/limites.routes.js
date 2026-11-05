import { Router } from 'express';
import * as controller from '../controllers/limites.controller.js';
import { identificarCliente } from '../middlewares/identificarCliente.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.route('/')
  .get(identificarCliente, controller.describir)
  .all(metodoNoPermitido(['GET']));

export default router;
