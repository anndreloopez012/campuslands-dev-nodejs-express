import { Router } from 'express';
import * as controller from '../controllers/equipos.controller.js';
import { validarId } from '../middlewares/validarId.js';

const router = Router();

router.param('id', validarId);

router.route('/')
  .get(controller.listar)
  .post(controller.crear);

router.route('/:id')
  .get(controller.obtener)
  .put(controller.actualizar)
  .delete(controller.eliminar);

router.post('/:id/jugadores', controller.agregarJugador);

export default router;
