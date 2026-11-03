import { Router } from 'express';

import {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar
} from '../controllers/formulas.controller.js';

const router = Router();

router.get('/', listar);
router.get('/:id', obtener);
router.post('/', crear);
router.put('/:id', actualizar);
router.delete('/:id', eliminar);

export default router;