import { Router } from 'express';
import * as controller from '../controllers/ranking.controller.js';

const router = Router();

router.get('/', controller.obtener);

export default router;
