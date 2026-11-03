import { Router } from 'express';
import { principal, listar, crear, eco } from '../controllers/obras.controller.js';

const router = Router();

router.get('/', principal);
router.get('/obras', listar);
router.post('/obras', crear);
router.post('/eco', eco);

export default router;
