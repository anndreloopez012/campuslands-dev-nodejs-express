import { Router } from 'express';
import * as controller from '../controllers/usuarios.controller.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.route('/')
  .get(controller.listar)
  .all(metodoNoPermitido(['GET']));

router.route('/:id')
  .get(controller.obtener)
  .all(metodoNoPermitido(['GET']));

export default router;
