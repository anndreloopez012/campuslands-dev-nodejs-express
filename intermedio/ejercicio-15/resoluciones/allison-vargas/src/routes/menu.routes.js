import { Router } from 'express';
import * as controller from '../controllers/menu.controller.js';
import { autenticar } from '../middlewares/autenticar.js';
import { requerirRol } from '../middlewares/requerirRol.js';
import { cargarPlato } from '../middlewares/cargarPlato.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.route('/')
  .get(controller.listar)
  .post(autenticar, requerirRol('vendedor'), controller.crear)
  .all(metodoNoPermitido(['GET', 'POST']));

router.route('/:id')
  .get(cargarPlato, controller.obtener)
  .patch(autenticar, requerirRol('vendedor'), cargarPlato, controller.actualizar)
  .delete(autenticar, requerirRol('admin'), cargarPlato, controller.eliminar)
  .all(metodoNoPermitido(['GET', 'PATCH', 'DELETE']));

export default router;
