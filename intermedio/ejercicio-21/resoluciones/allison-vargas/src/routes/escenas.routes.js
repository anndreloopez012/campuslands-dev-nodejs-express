import { Router } from 'express';
import * as controller from '../controllers/escenas.controller.js';
import { identificarCliente } from '../middlewares/identificarCliente.js';
import { limitar } from '../middlewares/limitar.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { limitadores } from '../config/limites.js';

const router = Router();

router.use(identificarCliente);

router.route('/')
  .get(limitar('lectura', limitadores.lectura), controller.listar)
  .post(limitar('escritura', limitadores.escritura), controller.crear)
  .all(metodoNoPermitido(['GET', 'POST']));

router.route('/:id')
  .get(limitar('lectura', limitadores.lectura), controller.obtener)
  .all(metodoNoPermitido(['GET']));

router.route('/:id/render')
  .post(limitar('render', limitadores.render), controller.render)
  .all(metodoNoPermitido(['POST']));

export default router;
