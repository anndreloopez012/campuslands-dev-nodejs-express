import { Router } from 'express';
import * as controller from '../controllers/usuarios.controller.js';
import { autenticar } from '../middlewares/autenticar.js';
import { requierePermiso } from '../middlewares/requierePermiso.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.use(autenticar);

router.route('/')
  .get(requierePermiso('usuarios:ver'), controller.listar)
  .all(metodoNoPermitido(['GET']));

router.route('/:id')
  .get(requierePermiso('usuarios:ver'), controller.obtener)
  .all(metodoNoPermitido(['GET']));

router.route('/:id/rol')
  .patch(requierePermiso('usuarios:cambiar-rol'), controller.cambiarRol)
  .all(metodoNoPermitido(['PATCH']));

export default router;
