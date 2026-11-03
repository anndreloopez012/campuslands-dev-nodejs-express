import { Router } from 'express';
import * as controller from '../controllers/ejercicio.controller.js';

const router = Router();

router.get('/', controller.ejecutarEjercicio);
router.get('/personajes', controller.listarPersonajes);
router.get('/misiones', controller.listarMisiones);
router.post('/misiones/:id/aceptar', controller.aceptarMision);

export default router;
