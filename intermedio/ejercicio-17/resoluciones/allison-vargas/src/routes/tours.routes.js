import { Router } from 'express';
import * as controller from '../controllers/tours.controller.js';
import { autenticar, autenticarOpcional } from '../middlewares/autenticar.js';
import { requierePermiso } from '../middlewares/requierePermiso.js';
import { cargarTour } from '../middlewares/cargarTour.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

const puedeGestionar = requierePermiso('tours:gestionar-propios', 'tours:gestionar-todos');
const puedeEliminar = requierePermiso('tours:eliminar', 'tours:gestionar-propios');

router.get('/', autenticarOpcional, controller.listar);
router.post('/', autenticar, puedeGestionar, controller.crear);
router.all('/', metodoNoPermitido(['GET', 'POST']));

router.get('/:id', autenticarOpcional, cargarTour, controller.obtener);
router.patch('/:id', autenticar, puedeGestionar, cargarTour, controller.actualizar);
router.delete('/:id', autenticar, puedeEliminar, cargarTour, controller.eliminar);
router.all('/:id', metodoNoPermitido(['GET', 'PATCH', 'DELETE']));

export default router;
