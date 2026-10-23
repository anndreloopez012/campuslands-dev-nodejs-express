import { Router } from 'express';
import { principal, archivo, listar, obtener } from '../controllers/jugadores.controller.js';

const router = Router();

router.get('/', principal);
router.get('/archivo', archivo);
router.get('/jugadores', listar);
router.get('/jugadores/:nombre', obtener);

export default router;
