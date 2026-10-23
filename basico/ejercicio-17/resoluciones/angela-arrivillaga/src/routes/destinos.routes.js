import { Router } from 'express';
import { principal, listar, populares, paises, obtener } from '../controllers/destinos.controller.js';

const router = Router();

router.get('/', principal);
router.get('/destinos', listar);
router.get('/destinos/populares', populares);
router.get('/destinos/:id', obtener);
router.get('/paises', paises);

export default router;
