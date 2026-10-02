import { Router } from 'express';
import { listar, obtener, crear, actualizar, eliminar } from '../controllers/motos.controller.js';
import { listarMantenimientos, crearMantenimiento } from '../controllers/mantenimientos.controller.js';

const router = Router();

router.get('/', listar);
router.get('/:id', obtener);
router.post('/', crear);
router.put('/:id', actualizar);
router.delete('/:id', eliminar);

router.get('/:id/mantenimientos', listarMantenimientos);
router.post('/:id/mantenimientos', crearMantenimiento);

export default router;
