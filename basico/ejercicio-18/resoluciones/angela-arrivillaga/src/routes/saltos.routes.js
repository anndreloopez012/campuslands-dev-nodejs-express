import { Router } from 'express';
import { principal, listar, crear } from '../controllers/saltos.controller.js';

const router = Router();

router.get('/', principal);
router.get('/saltos', listar);
router.post('/saltos', crear);

export default router;
