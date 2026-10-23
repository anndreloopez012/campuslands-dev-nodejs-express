import { Router } from 'express';
import { principal, listarProyectos, obtenerProyecto, area, volumen, costo } from '../controllers/arquitectura.controller.js';

const router = Router();

router.get('/', principal);
router.get('/proyectos', listarProyectos);
router.get('/proyectos/:id', obtenerProyecto);
router.get('/calculos/area', area);
router.get('/calculos/volumen', volumen);
router.get('/calculos/costo', costo);

export default router;
