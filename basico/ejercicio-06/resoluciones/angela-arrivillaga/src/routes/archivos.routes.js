import { Router } from 'express';
import { principal, listar, leer, infoRuta } from '../controllers/archivos.controller.js';

const router = Router();

router.get('/', principal);
router.get('/archivos', listar);
router.get('/archivos/:nombre', leer);
router.get('/info-ruta', infoRuta);

export default router;
