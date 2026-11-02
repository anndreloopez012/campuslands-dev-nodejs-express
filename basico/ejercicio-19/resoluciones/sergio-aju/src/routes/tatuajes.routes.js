import { Router } from 'express';
import {
  obtenerTatuaje,
  buscarTatuajes
} from '../controllers/tatuajes.controller.js';

const router = Router();

router.get('/buscar', buscarTatuajes);
router.get('/:id', obtenerTatuaje);

export default router;