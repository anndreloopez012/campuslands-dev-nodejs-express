import { Router } from 'express';
import {
  obtenerSoldadores,
  crearSoldador
} from '../controllers/soldadores.controller.js';

const router = Router();

router.get('/', obtenerSoldadores);
router.post('/', crearSoldador);

export default router;