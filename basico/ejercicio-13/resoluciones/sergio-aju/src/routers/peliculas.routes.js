import { Router } from 'express';
import { obtenerPelicula } from '../controllers/peliculas.controller.js';

const router = Router();

router.get('/:id', obtenerPelicula);

export default router;