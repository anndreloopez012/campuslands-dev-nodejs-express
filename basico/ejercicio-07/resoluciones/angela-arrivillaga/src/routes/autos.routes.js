import { Router } from 'express';
import { principal, listar } from '../controllers/autos.controller.js';

const router = Router();

router.get('/', principal);
router.get('/autos', listar);

export default router;
