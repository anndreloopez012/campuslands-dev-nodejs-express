import { Router } from 'express';
import * as controller from '../controllers/contexto.controller.js';

const router = Router();

router.get('/', controller.obtener);

export default router;
