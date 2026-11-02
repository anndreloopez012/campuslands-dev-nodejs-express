import { Router } from 'express';
import { principal, listar, obtener, artistas } from '../controllers/canciones.controller.js';

const router = Router();

router.get('/', principal);
router.get('/canciones', listar);
router.get('/canciones/:id', obtener);
router.get('/artistas', artistas);

export default router;
