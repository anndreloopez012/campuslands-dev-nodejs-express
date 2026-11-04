import { Router } from 'express';
import * as controller from '../controllers/admin.controller.js';
import { autenticar } from '../middlewares/autenticar.js';
import { requerirRol } from '../middlewares/requerirRol.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.use(autenticar, requerirRol('admin'));

router.route('/resumen')
  .get(controller.resumen)
  .all(metodoNoPermitido(['GET']));

router.route('/usuarios')
  .get(controller.usuarios)
  .all(metodoNoPermitido(['GET']));

export default router;
