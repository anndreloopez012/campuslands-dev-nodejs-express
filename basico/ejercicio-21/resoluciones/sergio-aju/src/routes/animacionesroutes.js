import { Router } from 'express';
import {
  obtenerAnimaciones,
  crearAnimacion
} from '../controllers/animaciones.controller.js';

const router = Router();

router.get('/', obtenerAnimaciones);
router.post('/', crearAnimacion);

export default router;