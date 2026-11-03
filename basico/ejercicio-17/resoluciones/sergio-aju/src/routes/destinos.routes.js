import { Router } from 'express';
import { obtenerDestinos } from '../controllers/destinos.controller.js';

const router = Router();

router.get('/', obtenerDestinos);

export default router;