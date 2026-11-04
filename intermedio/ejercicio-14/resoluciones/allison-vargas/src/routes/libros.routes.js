import { Router } from 'express';
import * as controller from '../controllers/libros.controller.js';
import { autenticar } from '../middlewares/autenticar.js';
import { requerirRol } from '../middlewares/requerirRol.js';
import { cargarLibro } from '../middlewares/cargarLibro.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.route('/')
  .get(controller.listar)
  .post(autenticar, requerirRol('editor'), controller.crear)
  .all(metodoNoPermitido(['GET', 'POST']));

router.route('/:id')
  .get(cargarLibro, controller.obtener)
  .patch(autenticar, requerirRol('editor'), cargarLibro, controller.actualizar)
  .delete(autenticar, requerirRol('admin'), cargarLibro, controller.eliminar)
  .all(metodoNoPermitido(['GET', 'PATCH', 'DELETE']));

export default router;
