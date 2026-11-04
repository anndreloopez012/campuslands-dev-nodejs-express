import { Router } from 'express';
import * as controller from '../controllers/productos.controller.js';
import { autenticar } from '../middlewares/autenticar.js';
import { requerirRol } from '../middlewares/requerirRol.js';
import { cargarProducto } from '../middlewares/cargarProducto.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';

const router = Router();

router.get('/', controller.listar);
router.post('/', autenticar, requerirRol('admin'), controller.crear);
router.all('/', metodoNoPermitido(['GET', 'POST']));

router.get('/:id', cargarProducto, controller.obtener);
router.patch('/:id', autenticar, requerirRol('admin'), cargarProducto, controller.actualizar);
router.delete('/:id', autenticar, requerirRol('admin'), cargarProducto, controller.eliminar);
router.all('/:id', metodoNoPermitido(['GET', 'PATCH', 'DELETE']));

export default router;
