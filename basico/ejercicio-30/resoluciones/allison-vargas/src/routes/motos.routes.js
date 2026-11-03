import { Router } from 'express';
import {
  obtenerMotos,
  obtenerMotoPorId,
  crearNuevaMoto,
  actualizarMotoExistente,
  eliminarMotoExistente,
} from '../controllers/motos.controller.js';
import {
  obtenerOrdenesDeMoto,
  crearOrdenDeMoto,
} from '../controllers/ordenes.controller.js';

const router = Router();

router.get('/', obtenerMotos);
router.get('/:id', obtenerMotoPorId);
router.post('/', crearNuevaMoto);
router.put('/:id', actualizarMotoExistente);
router.delete('/:id', eliminarMotoExistente);

router.get('/:motoId/ordenes', obtenerOrdenesDeMoto);
router.post('/:motoId/ordenes', crearOrdenDeMoto);

export default router;
