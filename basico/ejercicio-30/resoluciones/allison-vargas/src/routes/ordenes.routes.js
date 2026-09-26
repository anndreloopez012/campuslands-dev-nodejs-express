import { Router } from 'express';
import {
  obtenerOrdenes,
  obtenerOrdenPorId,
  cambiarEstadoOrden,
} from '../controllers/ordenes.controller.js';

const router = Router();

router.get('/', obtenerOrdenes);
router.get('/:id', obtenerOrdenPorId);
router.put('/:id/estado', cambiarEstadoOrden);

export default router;
