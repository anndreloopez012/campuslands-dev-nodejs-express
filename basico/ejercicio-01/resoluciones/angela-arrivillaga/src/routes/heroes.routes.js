import { Router } from 'express';
import { principal, runtime, heroe } from '../controllers/heroes.controller.js';

const router = Router();

router.get('/', principal);
router.get('/runtime', runtime);
router.get('/heroe', heroe);

export default router;
