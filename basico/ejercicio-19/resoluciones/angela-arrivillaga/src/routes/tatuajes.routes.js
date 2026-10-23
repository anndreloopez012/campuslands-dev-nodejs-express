import { Router } from 'express';
import { principal, listar, obtener, porArtista } from '../controllers/tatuajes.controller.js';

const router = Router();

router.get('/', principal);
router.get('/tatuajes', listar);
router.get('/tatuajes/:id', obtener);
router.get('/artistas/:id/tatuajes', porArtista);

export default router;
