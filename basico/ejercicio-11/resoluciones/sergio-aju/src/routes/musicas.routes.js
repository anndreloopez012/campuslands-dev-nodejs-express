import { Router } from 'express';
import { obtenerMusicas } from '../controllers/musicas.controller.js';

const router = Router();

router.get('/', obtenerMusicas);

export default router;