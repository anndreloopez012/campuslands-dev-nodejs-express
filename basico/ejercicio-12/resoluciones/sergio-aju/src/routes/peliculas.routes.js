import { Router } from 'express';
import { obtenerPeliculas } from '../controllers/peliculas.controller.js';

const router = Router();

router.get('/', obtenerPeliculas);

export default router;