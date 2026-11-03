import { Router } from 'express';
import { obtenerRopa } from '../controllers/ropa.controller.js';

const router = Router();

router.get('/', obtenerRopa);

export default router;