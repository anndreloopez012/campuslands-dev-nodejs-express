import { Router } from 'express';
import { principal, listarArmas, crearArma, eliminarArma, probarEstado } from '../controllers/estados.controller.js';

const router = Router();

router.get('/', principal);
router.get('/armas', listarArmas);
router.post('/armas', crearArma);
router.delete('/armas/:id', eliminarArma);
router.get('/estados/:codigo', probarEstado);

export default router;
