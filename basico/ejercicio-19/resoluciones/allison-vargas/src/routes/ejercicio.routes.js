import { Router } from 'express';
import {
  ejecutarEjercicio,
  obtenerDisenosDeArtista,
  obtenerDisenoEspecifico,
} from '../controllers/ejercicio.controller.js';

const router = Router();

// GET /basico/ejercicio-19
router.get('/', ejecutarEjercicio);

// GET /basico/ejercicio-19/artistas/:artistaId/disenos?estilo=&precioMax=
router.get('/artistas/:artistaId/disenos', obtenerDisenosDeArtista);

// GET /basico/ejercicio-19/artistas/:artistaId/disenos/:disenoId
router.get('/artistas/:artistaId/disenos/:disenoId', obtenerDisenoEspecifico);

export default router;
