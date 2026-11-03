import { Router } from 'express';
import { crearLibro } from '../controllers/libros.controller.js';

const router = Router();

router.post('/', crearLibro);

export default router;