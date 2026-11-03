import { Router } from 'express';
import { crearParacaidista } from '../controllers/paracaidistas.controller.js';

const router = Router();

router.post('/', crearParacaidista);

export default router;