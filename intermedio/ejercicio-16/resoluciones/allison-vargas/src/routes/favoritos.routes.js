import { Router } from 'express';
import * as controller from '../controllers/favoritos.controller.js';
import { autenticar } from '../middlewares/autenticar.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.use(autenticar);

router.route('/')
  .get(controller.listar)
  .post(controller.agregar)
  .all(metodoNoPermitido(['GET', 'POST']));

router.route('/:productoId')
  .delete(controller.quitar)
  .all(metodoNoPermitido(['DELETE']));

export default router;
