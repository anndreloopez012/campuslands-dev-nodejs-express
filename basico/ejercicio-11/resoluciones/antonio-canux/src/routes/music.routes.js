import { Router } from 'express';
import { getStatus, findMusic } from '../controllers/music.controller.js';

const router = Router();

router.get('/ejercicio-11', getStatus);
// Usaremos query params para la búsqueda, ej: /search?artist=Nightwish
router.get('/ejercicio-11/search', findMusic);

export default router;