import { Router } from 'express';
import { principal, listar, crear } from '../controllers/libros.controller.js';

const router = Router();

router.get('/', principal);
router.get('/libros', listar);
router.post('/libros', crear);

export default router;
