import { Router } from 'express';
import * as controller from '../controllers/destinos.controller.js';
import { autenticar } from '../middlewares/autenticar.js';
import { requierePermiso } from '../middlewares/requierePermiso.js';
import { cargarDestino } from '../middlewares/cargarDestino.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.get('/', controller.listar);
router.post('/', autenticar, requierePermiso('destinos:gestionar'), controller.crear);
router.all('/', metodoNoPermitido(['GET', 'POST']));

router.get('/:id', cargarDestino, controller.obtener);
router.patch('/:id', autenticar, requierePermiso('destinos:gestionar'), cargarDestino, controller.actualizar);
router.delete('/:id', autenticar, requierePermiso('destinos:eliminar'), cargarDestino, controller.eliminar);
router.all('/:id', metodoNoPermitido(['GET', 'PATCH', 'DELETE']));

export default router;
