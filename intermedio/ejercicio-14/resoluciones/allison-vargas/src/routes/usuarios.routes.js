import { Router } from 'express';
import * as controller from '../controllers/usuarios.controller.js';
import { autenticar } from '../middlewares/autenticar.js';
import { requerirRol } from '../middlewares/requerirRol.js';
import { cargarUsuario } from '../middlewares/cargarUsuario.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.use(autenticar, requerirRol('admin'));
router.param('id', cargarUsuario);

router.route('/')
  .get(controller.listar)
  .all(metodoNoPermitido(['GET']));

router.route('/:id')
  .get(controller.obtener)
  .patch(controller.actualizar)
  .all(metodoNoPermitido(['GET', 'PATCH']));

export default router;
