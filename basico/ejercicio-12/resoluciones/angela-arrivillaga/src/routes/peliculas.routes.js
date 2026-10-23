import { Router } from 'express';
import { principal, listar, obtener, resumen } from '../controllers/peliculas.controller.js';

const router = Router();

router.get('/', principal);
router.get('/peliculas', listar);
router.get('/peliculas/:id', obtener);
router.get('/resumen', resumen);

export default router;
